export default interface PaymentAuthResponse {
  paymentIdempotencyId: string;
  userUuid?: string | null;
  status?: string | null;
  featureScope?: string[] | null;
  tracingId?: string | null;
  authorisationUrl: string;
  deepLinkAuthorisationUrl?: string | null;
  deepLinkAuthorisationUrlIOS?: string | null;
  businessAppDeepLinkAuthorisationUrl?: string | null;
  businessAppDeepLinkAndroidAuthorisationUrl?: string | null;
  businessAppDeepLinkAuthorisationUrlIOS?: string | null;
  appStoreLink?: string | null;
  androidPackageName?: string | null;
  iOSPackageName?: string | null;
  cardCheckoutId?: string | null;
}
