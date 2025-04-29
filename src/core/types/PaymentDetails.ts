import type FraudDetails from "./FraudDetails";
import type MerchantThemeDetails from "./MerchantThemeDetails";
import type QrDetails from "./QrDetails";
import type StoreDetails from "./StoreDetails";
import type { PaymentTypeEnum, SourceTypeEnum } from "./common";
import type { EnvironmentTypeEnum } from "./Environment";
import type LastPaymentBankDetails from "./LastPaymentBankDetails";

export interface PaymentDetailsError {
  paymentDetailHasError: boolean;
  paymentDetailHasQrNotLinkedError: boolean;
  paymentDetailErrorTitle: string;
  paymentDetailErrorMsg: string;
  paymentDetailErrorTime: string;
  paymentDetailErrorAmt: number | undefined;
  paymentDetailErrorReferenceId: string;
  paymentDetailsErrorRedirectionUrl: string | null;
}

export interface TipOption {
  value: number;
  mostTipped: boolean;
}

export default interface PaymentDetails {
  merchantBusinessName: string;
  merchantId: string;
  storeImg: string | null;
  senderRequestId?: string;
  senderName?: string;
  employeeId: null;
  env: EnvironmentTypeEnum;
  consumerId?: null | string;
  contextType?: null | string;
  amount: {
    amount: number;
    currency: string;
  };
  merchantThemeDetails?: MerchantThemeDetails;
  encryptedPaymentDetails?: string;
  encryptedNotesDetails: string;
  encryptedRefundPaymentDetails?: string;
  encryptedQrDetails: string;
  taxPercentage: number;
  servicePercentage: number;
  merchantNotes?: string;
  qrDetails?: QrDetails;
  storeDetails?: StoreDetails;
  isCashback?: boolean;
  fraudDetails?: FraudDetails;
  expiresIn?: number;
  requestCreatedAt?: string;
  strictExpiry?: boolean;
  allowSdkRetry?: boolean;
  options?: {
    [key: string]: string | boolean | number | undefined;
  };
  tipInfo?: {
    id: string;
    tipType: 0 | 1;
    allowCustomTips: boolean;
    tipOptions: Array<TipOption>;
    status: boolean;
  };
  splitBill?: boolean;
  splitOutstandingAmount?: number;
  splitEntries?: any[];
  paymentType?: PaymentTypeEnum;
  integrationId?: string;
  tableId?: string;
  paymentSourceType?: SourceTypeEnum;
  redirectOnCompleted?: boolean;
  lastPaymentBankDetails?: LastPaymentBankDetails;
}
