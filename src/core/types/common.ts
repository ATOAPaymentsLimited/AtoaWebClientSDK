declare global {
  interface Document {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentMode?: any;
  }
}

export enum SourceTypeEnum {
  QR_WITH_AMOUNT,
  QR_WITHOUT_AMOUNT,
  PHYSICAL_QR,
  EXTERNAL_MERCHANT,
  LINK,
  ADD_EMPLOYEE_QR,
  DEVICE_QR,
  PHYSICAL_NFC,
  QR_WITHOUT_AMOUNT_XERO,
  RECEIPT_QR,
  PHYSICAL_QR_WITH_AMOUNT,
  QUICKBOOKS_INVOICE,
  XERO_INVOICE,
  SAGE_INVOICE,
}

export enum PaymentTypeEnum {
  TRANSACTION = "TRANSACTION",
  REFUND = "REFUND",
  MANUALREFUND = "MANUALREFUND",
  INVOICEPAYMENT = "INVOICEPAYMENT",
  CONSUMERREWARD = "CONSUMERREWARD",
  CONSUMERCASHBACK = "CONSUMERCASHBACK",
  P2P = "P2P",
  P2P_WEB = "P2P_WEB",
}

export enum PaymentDeviceOriginEnum {
  DESKTOP = "DESKTOP",
  MOBILE = "MOBILE",
  CONSUMER_APP_ANDROID = "CONSUMER_APP_ANDROID",
  CONSUMER_APP_IOS = "CONSUMER_APP_IOS",
}

export enum BankTypeEnum {
  PERSONAL = "Personal Banks",
  BUSINESS = "Business Banks",
}

export enum TermsTypeEnum {
  YAPILY_END_USER_TERMS = "YAPILY_END_USER_TERMS",
  YAPILY_PRIVACY_POLICY = "YAPILY_PRIVACY_POLICY",
  ATOA_TERMS_OF_SERVICE = "ATOA_TERMS_OF_SERVICE",
}

export interface QrCodeDetailsType {
  qrId: string;
  nickName: string;
}

export interface PaymentRequestSourceType {
  qrId: string;
  paymentLinkId: string;
  paymentRequest: null;
  paymentRequestId: null;
  paymentRequestSourcetype: SourceTypeEnum;
  allowSdkRetry?: boolean;
  splitBill?: boolean;
  consumerMobileNumberToNotify?: number;
  phoneNumber?: string;
}

export interface PaymentDeviceType {
  platform: string;
  osVersion: null;
  browser: string;
  manufacturer: null;
  model: null;
  deviceMemory: number;
  ipAddress: string;
}

export interface StatusDetailsType {
  status: string;
  statusUpdateDate: string;
  isoStatus: {
    code: string;
    name: string;
  };
}
