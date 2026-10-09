export default interface TransactionDetails {
  paidAmount: string;
  currency: string;
  paymentIdempotencyId?: string;
  consumerId?: string;
  consumerName?: string;
  institutionId?: string;
  bankName?: string;
  bankAccountNo?: string;
  taxAmount?: number;
  serviceAmount?: number;
  tipAmount?: number;
  status?: string | null;
  errorDescription: string | null;
  pendingTrasactionError: string | null;
  orderId?: string | null;
  redirectUrlParams?: Record<string, string>;
  signature?: string;
  signatureHash?: string;
  /** Server-side timestamps (ISO 8601) returned by the payment status API. */
  createdAt?: string;
  updatedAt?: string;
}
