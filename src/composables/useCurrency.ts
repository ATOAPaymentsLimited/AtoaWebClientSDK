import { computed, inject, type ComputedRef, type Ref } from "vue";
import type PaymentDetails from "@/core/types/PaymentDetails";
import {
  currencySymbol as symbolOf,
  formatDecimals,
  formatMoney,
  paymentCurrencyOf,
} from "@/core/utils/money";

/**
 * The currency and locale to render money in, taken from the payment being collected.
 *
 * Reads the `paymentRequestDetails` ref that `PaymentDialog` already provides, rather than adding
 * a second provide alongside it. One source cannot drift from itself, and every component on the
 * tree already has this injection available.
 *
 * **This composable contains no decisions and must not grow any.** It reads `currency` and
 * `defaultLocale` off `businessCountryInfo` and forwards them to `@/core/utils/money`. Every rule
 * about how money is written — the empty-currency fallback, unknown codes — lives there, where it
 * is unit-testable without mounting a component.
 *
 * There is deliberately no bare `symbol` here. Handing out a glyph is what produces
 * `{{ symbol }}{{ amount }}`, and that concatenation cannot be right in both directions: `en-IE`
 * writes `€45.00`, `fr-FR` writes `45,00 €`. Only `Intl` knows which, so only {@link money} may
 * build the string.
 */
export interface UseCurrency {
  /** ISO 4217 of the payment, or `undefined` before details have loaded. */
  currencyCode: ComputedRef<string | undefined>;
  /** BCP 47 the payment formats in, e.g. `en-GB` / `en-IE`. `undefined` ⇒ the viewer's own. */
  locale: ComputedRef<string | undefined>;
  /** `£1,234.50` / `45,00 €` — the symbol placed by `Intl`, never concatenated. */
  money: (amount: string | number | undefined) => string;
  /** Digits only, no symbol — for the rare surface that renders the glyph separately. */
  decimals: (amount: string | number | undefined) => string;
  /** The symbol for an arbitrary currency, written for the payment's locale. */
  symbolFor: (currency: string | undefined) => string;
}

export function useCurrency(): UseCurrency {
  const paymentDetails = inject<Ref<PaymentDetails | undefined>>(
    "paymentRequestDetails"
  );

  // `||` not `??` throughout: these arrive off the wire typed as required strings and nothing
  // validates them, so `??` would accept `""` as an answer and skip a fallback that would have
  // worked. An empty locale is worse than a missing one — `Intl` throws `RangeError` on it.
  const country = computed(() => paymentDetails?.value?.businessCountryInfo);

  /**
   * What the payment is denominated in. One resolver shared with the outbound payload, so what is
   * SHOWN and what is SENT can never disagree — see `paymentCurrencyOf`.
   */
  const currencyCode = computed<string | undefined>(() =>
    paymentCurrencyOf(paymentDetails?.value)
  );

  const locale = computed<string | undefined>(
    () => country.value?.defaultLocale || undefined
  );

  return {
    currencyCode,
    locale,
    money: (amount) =>
      formatMoney(amount ?? 0, currencyCode.value, locale.value),
    decimals: (amount) => formatDecimals(amount ?? 0, locale.value),
    symbolFor: (currency) =>
      currency == null || currency === ""
        ? ""
        : symbolOf(currency, locale.value),
  };
}
