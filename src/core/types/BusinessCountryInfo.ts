/** A payment method a checkout may offer, as the backend names it. */
export type PaymentRail = "PAY_BY_BANK" | "CARD" | "PAY_LATER";

/**
 * The country the business trades in, resolved server-side (`businessCountryInfo` on
 * `get-payment-details`).
 *
 * Everything locale-shaped about a payment comes from here rather than from the SDK build: which
 * methods to offer, which currency and symbol to render, which locale to format in. One published
 * bundle serves a GB and an IE merchant at once, so none of this can be a constant.
 *
 * Absent on peer-to-peer payments, which have no business to take a country from, and on any
 * response from a backend that predates the EU rollout. Every reader must treat it as optional.
 */
export default interface BusinessCountryInfo {
  regionCode: "UK" | "EU";
  /** ISO 3166-1 alpha-2, e.g. "GB" / "IE". */
  countryCode: string;
  /** ISO 4217, e.g. "GBP" / "EUR". */
  currency: string;
  currencySymbol: string;
  /** Minor units for the currency — 2 for GBP/EUR. */
  currencyDecimals?: number;
  /** BCP 47, e.g. "en-GB" / "en-IE". Decides grouping, decimal mark and symbol placement. */
  defaultLocale: string;
  timezone: string;
  phoneCountryCode: string;
  /** The methods this country offers, already filtered to the selectable set. */
  paymentRails: PaymentRail[];

  /**
   * Which trust badges this country is entitled to show.
   *
   * The backend owns this because every badge is a REGULATORY claim: `FCA` and `UK_BANKS` are true
   * of a UK business and false of an Irish one. Reading the list rather than hardcoding it per
   * region is what stops the SDK asserting an authorisation the merchant does not hold.
   */
  signupPanel?: {
    trustBadges?: string[];
  };

  /** Country-specific copy and links, authored by the backend. */
  text?: {
    /** e.g. "Atoa is authorised by the Financial Conduct Authority (FRN #1007647)". */
    regulatorNote?: string;
    termsUrl?: string;
    privacyUrl?: string;
    cookieUrl?: string;
    legalFooter?: string;
  };
}
