import type TransactionDetails from "@/core/types/TransactionDetails";
import type StoreDetails from "@/core/types/StoreDetails";
export default interface PaymentRequestStatusDetails {
  merchantId: string;
  merchantName: string;
  customerId?: string;
  orderId?: string;
  status: string;
  storeDetails?: StoreDetails;
  transactionDetails: TransactionDetails[];
  taxAmount?: number;
  serviceAmount?: number;
  tipAmount?: number;
}
