import type PaymentRequestStatusDetails from "./PaymentRequestStatusDetails";
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
  paymentRequest: PaymentRequestStatusDetails;
  redirectUrlParams?: Record<string, string>;
  signature?: string;
  signatureHash?: string;
}
