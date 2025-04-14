import type CustomerDetails from "./CustomerDetails";
import type { EnvironmentTypeEnum } from "./Environment";
import type { AtoaPayWebSDKError } from "./Error";

export type ErrorEventHandler = (error: AtoaPayWebSDKError) => void;

export type PaymentStatusEventHandler = (data: {
  status: string;
  paymentRequestId: string;
  paymentIdempotencyId?: string;
  callbackParams?: Record<string, string>;
  atoaSignature?: string;
  atoaSignatureHash?: string;
}) => void;

export type UserCancelPaymentEventHandler = (paymentRequestId: string) => void;

export type DialogCloseEventData = {
  status: string;
  paymentRequestId: string;
  paymentIdempotencyId: string;
  callbackParams?: Record<string, string>;
  atoaSignature?: string;
  atoaSignatureHash?: string;
};

export type DialogCloseEventHandler = (data?: DialogCloseEventData) => void;

export interface SdkOptions {
  environment: EnvironmentTypeEnum;
  paymentRequestId: string;
  customerDetails?: CustomerDetails;
  onError?: ErrorEventHandler;
  onPaymentStatusChange?: PaymentStatusEventHandler;
  onUserCancel?: UserCancelPaymentEventHandler;
  onClose?: DialogCloseEventHandler;
}
