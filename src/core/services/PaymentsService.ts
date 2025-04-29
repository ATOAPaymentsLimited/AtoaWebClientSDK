import { EnvironmentTypeEnum } from "@/core/types/Environment";
import { API_METHODS, ApiClient } from "@/core/utils/http-client";
import { apiCall, api_urls } from "@/core/utils/http-utils";
import type PaymentDetails from "@/core/types/PaymentDetails";
import type BankData from "@/core/types/BankData";
import { detectBrowser, isMobile } from "@/core/utils/common";
import { SourceTypeEnum } from "@/core/types/common";
import type PaymentAuthResponse from "@/core/types/PaymentAuthResponse";
import type CustomerDetails from "@/core/types/CustomerDetails";
import { v4 as uuidv4 } from "uuid";
import type TransactionDetails from "../types/TransactionDetails";
import type PaymentRequestStatusDetails from "../types/PaymentRequestStatusDetails";

export class PaymentsService {
  private http: ApiClient | never;

  constructor(httpClient?: never) {
    this.http = httpClient ?? new ApiClient();
  }

  async fetchConsumerBankInstitutions(params: {env: EnvironmentTypeEnum}): Promise<BankData[]> {
    return apiCall<BankData[]>(async () => {
      return this.http.makeRequest({
        url: api_urls.GET_BANK_INSTITUTIONS,
        method: API_METHODS.GET,
        params: params,
      });
    });
  }

  fetchPaymentDetails(
    paymentRequestId: string,
    params: { env: EnvironmentTypeEnum; customerDetails?: CustomerDetails }
  ): Promise<PaymentDetails> {
    return apiCall<PaymentDetails>(async () => {
      const paramsLocal: { env: EnvironmentTypeEnum } = {
        env: params.env.toLowerCase() as EnvironmentTypeEnum,
      };

      return this.http.makeRequest({
        url: api_urls.GET_PAYMENT_DETAILS,
        method: API_METHODS.POST,
        params: paramsLocal,
        json: {
          data: paymentRequestId,
          source: "EXTERNAL_MERCHANT",
          customerDetails: params.customerDetails,
        },
      });
    });
  }

  callBankAuthorisationUrl(
    paymentRequestId: string | undefined,
    paymentDetails: PaymentDetails,
    selectedBank: BankData
  ): Promise<PaymentAuthResponse> {
    let consumerId = paymentDetails?.consumerId;
    if (!consumerId) {
      consumerId = uuidv4();
    }

    const dataToSend = {
      merchantId: paymentDetails?.merchantId,
      employeeId: paymentDetails?.employeeId ?? null,
      merchantName: paymentDetails?.merchantBusinessName,
      consumerName: "",
      amount: {
        amount: paymentDetails?.amount?.amount,
        currency: "GBP",
      },
      applicationUserId: consumerId ?? "",
      consumerId: consumerId ?? "",
      institutionId: selectedBank?.id,
      taxPercentage: paymentDetails?.taxPercentage,
      servicePercentage: paymentDetails?.servicePercentage,
      features: selectedBank?.features,
      paymentRequest: {
        paymentType: paymentDetails?.paymentType,
      },
      encryptedPaymentDetails: paymentDetails?.encryptedPaymentDetails,
      encryptedRefundPaymentDetails:
        paymentDetails?.encryptedRefundPaymentDetails,
      encryptedNotesDetails: paymentDetails?.encryptedNotesDetails ?? null,
      encryptedQrDetails: paymentDetails?.encryptedQrDetails ?? null,
      contextType: paymentDetails?.contextType,
      paymentDevice: {
        platform: navigator?.platform ?? null,
        osVersion: null,
        browser: detectBrowser(),
        manufacturer: null,
        model: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deviceMemory: (navigator as any)?.deviceMemory ?? null,
      },
      deviceOrigin: isMobile() ? "SDK_MOBILE" : "SDK_DESKTOP",
      paymentRequestSource: {
        paymentRequestSourcetype: SourceTypeEnum["EXTERNAL_MERCHANT"],
        paymentRequestId: paymentRequestId ?? null,
        expiresIn: paymentDetails?.expiresIn?.toString(),
        requestCreatedAt: paymentDetails?.requestCreatedAt?.toString(),
        strictExpiry: paymentDetails?.strictExpiry?.toString(),
        allowSdkRetry: paymentDetails?.allowSdkRetry?.toString(),
        redirectOnCompleted: paymentDetails?.redirectOnCompleted?.toString(),
        splitBill: paymentDetails?.splitBill,
      },
      merchantPaymentOptions: paymentDetails?.options,
      paymentSourceType: SourceTypeEnum["EXTERNAL_MERCHANT"],
      qrCodeDetails: paymentDetails?.qrDetails,
      storeDetails: paymentDetails?.storeDetails,
      fraudDetails: paymentDetails?.fraudDetails,
    };

    return apiCall<PaymentAuthResponse>(async () => {
      return this.http.makeRequest({
        url: api_urls.SECURE_PAYMENT_AUTH,
        method: API_METHODS.POST,
        json: dataToSend,
      });
    });
  }

  getPaymentStatusByRequestId(
    paymentRequestId: string,
    params: { env: EnvironmentTypeEnum }
  ): Promise<PaymentRequestStatusDetails> {
    return apiCall<PaymentRequestStatusDetails>(async () => {
      const paramsLocal: { env: EnvironmentTypeEnum } = {
        env: params.env.toLowerCase() as EnvironmentTypeEnum,
      };
      return this.http.makeRequest({
        url: api_urls.GET_PAYMENT_STATUS_BY_REQUEST_ID.replace("$id", paymentRequestId),
        method: API_METHODS.GET,
        params: paramsLocal,
      });
    });
  }

  getPaymentStatusByID(
    paymentIdempotencyId: string,
    params: { env: EnvironmentTypeEnum }
  ): Promise<TransactionDetails> {
    return apiCall<TransactionDetails>(async () => {
      const paramsLocal: { env: EnvironmentTypeEnum } = {
        env: params.env.toLowerCase() as EnvironmentTypeEnum,
      };
      return this.http.makeRequest({
        url: api_urls.GET_PAYMENT_STATUS.replace("$id", paymentIdempotencyId),
        method: API_METHODS.GET,
        params: paramsLocal,
      });
    });
  }
}
