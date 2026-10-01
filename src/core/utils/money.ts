/**
 * The only place money becomes a string in this SDK.
 *
 * Ported from `ATOAConsumerWebNew/src/core/money.ts` rather than imported. That is deliberate and
 * is not an oversight: this package publishes to public npm and must stay dependency-free, so it
 * cannot reach for `@ATOAPaymentsLimited/region` (restricted registry, knows only GB and IE, and
 * THROWS on anything else — inside a render that would blank a payment page). Both copies must
 * keep the same behaviour; change them together.
 *
 * Currency and locale are properties of the PAYMENT, taken from `businessCountryInfo`, never of
 * the build. One published bundle serves a GB and an IE merchant at once.
 */

/**
 * Locale used when formatting digits WITHOUT a currency symbol.
 *
 * Grouping-only, so it is identical for GBP and EUR — `1,234.50` is how both the UK and Ireland
 * write it. It becomes wrong at the first market that groups differently (`de-DE` → `1.234,50`);
 * anything that renders a SYMBOL must take the payment's real locale instead.
 */
const GROUPING_LOCALE_FALLBACK = "en-GB";

function stripGrouping(amount: string | number): number {
  return Number(typeof amount === "string" ? amount.replace(/,/g, "") : amount);
}

/**
 * The currency's symbol as the given locale writes it — `£` for GBP, `€` for EUR.
 *
 * Read off `Intl` rather than a hand-kept map: a map has to be extended per market and silently
 * degrades to the bare code for anything it was not told about.
 */
export function currencySymbol(
  currency: string,
  locale: string | undefined = GROUPING_LOCALE_FALLBACK
): string {
  try {
    const part = new Intl.NumberFormat(locale, { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? currency + " ";
  } catch {
    return currency + " ";
  }
}

/** Digits only, always 2 dp, no symbol. The locale decides grouping and the decimal mark. */
export function formatDecimals(
  amount: string | number,
  locale: string | undefined = GROUPING_LOCALE_FALLBACK,
  minimumFractionDigits = 2
): string {
  const value = stripGrouping(amount);
  const options = { minimumFractionDigits, maximumFractionDigits: 2 };
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    // A STRUCTURALLY invalid tag throws `RangeError` here — `""` and `"en_GB"` (underscore) do,
    // while a merely unknown but well-formed `"xx-XX"` does not. Nothing validates
    // `businessCountryInfo.defaultLocale` off the wire, and this is the last formatter in every
    // degraded path. Unguarded, one bad country row throws from inside a render and blanks the
    // dialog. Retry with the one tag that is a compile-time constant and cannot be malformed.
    return new Intl.NumberFormat(GROUPING_LOCALE_FALLBACK, options).format(value);
  }
}

/**
 * An amount with its currency, formatted for the country the payment is being taken in.
 *
 * `Intl` places the symbol, so this is NOT `symbol + digits` concatenation. That is the whole
 * point: `fr-FR` writes `45,00 €` with the symbol LAST and a comma decimal, which no hand-built
 * string can produce. GB output is unchanged: `formatMoney(1234.5, "GBP", "en-GB")` → `£1,234.50`.
 *
 * A missing or empty `currency` renders the digits ALONE rather than guessing a glyph. Details may
 * not have loaded yet, and a guessed glyph is exactly how a `£` reached an Irish payment in the
 * first place — an obviously missing symbol beats a plausible wrong one. Unknown codes fall back
 * to `CODE 1,234.50` rather than throwing, because a payment page must still render an amount.
 */
export function formatMoney(
  amount: string | number,
  currency: string | undefined,
  locale?: string
): string {
  const value = stripGrouping(amount);

  if (currency == null || currency === "") {
    return formatDecimals(amount, locale);
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      // Pinned at 2 rather than left to the currency's own minor unit: the locale decides grouping
      // and the decimal mark, never how many digits of money exist. Correct for every currency we
      // serve (GBP, EUR) and wrong for the ones we do not — JPY has no minor unit. Revisit with
      // the first such market.
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Reached when the CURRENCY is unknown to Intl. Both calls below are individually guarded, so
    // a bad locale cannot throw a second time out of this recovery path.
    return currencySymbol(currency, locale) + formatDecimals(amount, locale);
  }
}

/**
 * The ISO 4217 code a payment is denominated in.
 *
 * The payment's own `amount.currency` first, then the business country's. Today the country is the
 * only one that exists — `get-payment-details` returns `amount` as `{ amount }` with no currency,
 * verified against dev for both a GB and an IE business — so reading `amount.currency` alone yields
 * `undefined`. It is still checked first because it is the per-payment answer, and relabelling a
 * payment as whatever the merchant usually trades in is the exact failure this module exists to
 * prevent.
 *
 * `||` not `??`: both fields are unvalidated off the wire and `""` must fall through.
 */
export function paymentCurrencyOf(details: {
  amount?: { currency?: string };
  businessCountryInfo?: { currency?: string };
} | undefined): string | undefined {
  return details?.amount?.currency || details?.businessCountryInfo?.currency;
}
