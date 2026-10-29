import type PaymentDetails from "@/core/types/PaymentDetails";
import type { PaymentRail } from "@/core/types/BusinessCountryInfo";

/**
 * Which payment methods this checkout may offer.
 *
 * Two independent gates, and a method needs BOTH:
 *   1. the COUNTRY must offer the rail — `businessCountryInfo.paymentRails`, set per market
 *      (Ireland launches card-only, so `PAY_BY_BANK` is simply not in its list);
 *   2. the MERCHANT must have the method switched on — `options.cardPaymentEnabled`.
 *
 * The rails gate sits ABOVE the merchant switch and never replaces it. Collapsing the two would
 * let a country's rail silently enable a method a merchant turned off.
 *
 * Mirrors `paymentMethodsAllowedForBusiness` in the consumer web's `core/checkout.ts`; keep the
 * two in step.
 */

/**
 * True when the country offers this rail.
 *
 * **An absent country allows everything.** Peer-to-peer payments carry no business, and a backend
 * that predates the EU rollout sends no `businessCountryInfo` at all — treating either as "no
 * rails" would black out checkouts that work today. Unknown must mean unrestricted here, which is
 * the opposite of how {@link formatMoney} treats an unknown currency, and deliberately so: a
 * missing symbol is a cosmetic degradation, a missing rail is an unpayable page.
 */
export function paymentRailAllowed(
  details: PaymentDetails | undefined,
  rail: PaymentRail
): boolean {
  const rails = details?.businessCountryInfo?.paymentRails;
  if (!Array.isArray(rails)) return true;
  return rails.includes(rail);
}

/** Card: offered by the country AND switched on for the merchant. */
export function cardPaymentAllowed(details: PaymentDetails | undefined): boolean {
  return (
    paymentRailAllowed(details, "CARD") &&
    details?.options?.cardPaymentEnabled === true
  );
}

/**
 * Pay by bank: offered by the country. There is no per-merchant switch for it — the bank grid is
 * the SDK's default rail, so the country is the only thing that can withdraw it.
 */
export function bankPaymentAllowed(details: PaymentDetails | undefined): boolean {
  return paymentRailAllowed(details, "PAY_BY_BANK");
}

/**
 * Card is the ONLY way to pay, so there is no bank list to fall back to.
 *
 * Two independent reasons: the LINK was minted as a card payment (`paymentMethod`), or the
 * merchant's COUNTRY offers no bank rail at all — Ireland launches card-only.
 *
 * Lives here rather than in a component because three places need the same answer and had started
 * to disagree: the view router, the back button, and the "switch to pay by bank" banner. A banner
 * offering a rail the country does not have is the exact failure this prevents.
 */
export function isCardOnlyCheckout(details: PaymentDetails | undefined): boolean {
  if (details?.paymentMethod === "CARD") return true;
  return cardPaymentAllowed(details) && !bankPaymentAllowed(details);
}
