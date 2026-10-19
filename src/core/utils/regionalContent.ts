import ukFlagIcon from "@/assets/images/uk_flag.svg";
import fcaShieldIcon from "@/assets/images/fca-shield.svg";
import lockWithTickIcon from "@/assets/images/lock-with-tick.svg";
import type PaymentDetails from "@/core/types/PaymentDetails";

/**
 * Trust badges, chosen by the BACKEND.
 *
 * `businessCountryInfo.signupPanel.trustBadges` names which badges a business may display —
 * `["ISO_SOC2", "FCA", "UK_BANKS"]` for a UK business, `["ISO_SOC2"]` for an Irish one. The SDK
 * renders the named ones and nothing else.
 *
 * This is deliberately NOT a region lookup table in the client. Every badge is a **regulatory
 * claim**: "Authorised by the FCA" is true of a UK business and false of an Irish one, and getting
 * it wrong is a false regulatory statement rather than a cosmetic bug. The backend already owns the
 * authorisation facts, so it owns the list; the client only owns the artwork.
 *
 * An unknown key renders nothing rather than falling back to something plausible — a new badge
 * reaching an old SDK build must be invisible, never mislabelled.
 */
export interface TrustBadge {
  key: string;
  icon: string;
  label: string;
}

const BADGE_ARTWORK: Record<string, { icon: string; label: string }> = {
  ISO_SOC2: { icon: lockWithTickIcon, label: "ISO 27001 and SOC2 Secure" },
  FCA: { icon: fcaShieldIcon, label: "Authorised by the FCA" },
  UK_BANKS: { icon: ukFlagIcon, label: "Processed by UK Banks" },
};

/**
 * The badges to render for this payment.
 *
 * Falls back to the UK set only when the payment carries no country at all — a peer-to-peer
 * payment or a backend predating the country profile. That is exactly what those payments show
 * today, so an older backend keeps its current footer rather than losing it.
 */
export function resolveTrustBadges(
  details: PaymentDetails | undefined
): TrustBadge[] {
  const keys = details?.businessCountryInfo
    ? details.businessCountryInfo.signupPanel?.trustBadges ?? []
    : ["ISO_SOC2", "UK_BANKS", "FCA"];

  return keys
    .map((key) => {
      const artwork = BADGE_ARTWORK[key];
      return artwork ? { key, ...artwork } : null;
    })
    .filter((badge): badge is TrustBadge => badge !== null);
}

/**
 * The country's terms and privacy URLs.
 *
 * Both markets point at `paywithatoa.co.uk` today, so the fallbacks below are what every merchant
 * already sees. They exist because these links must never render empty — an `href=""` reloads the
 * page — and because a payment with no country at all still has to show terms.
 */
const FALLBACK_TERMS_URL = "https://paywithatoa.co.uk/terms/";
const FALLBACK_PRIVACY_URL =
  "https://paywithatoa.co.uk/atoa-business-privacy-policy/";

export interface LegalLinks {
  termsUrl: string;
  privacyUrl: string;
}

export function legalLinks(details: PaymentDetails | undefined): LegalLinks {
  const text = details?.businessCountryInfo?.text;
  return {
    termsUrl: text?.termsUrl || FALLBACK_TERMS_URL,
    privacyUrl: text?.privacyUrl || FALLBACK_PRIVACY_URL,
  };
}
