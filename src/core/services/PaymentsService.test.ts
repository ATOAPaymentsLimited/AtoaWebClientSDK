/// <reference types="jest" />

import { PaymentsService } from "./PaymentsService";
import { API_METHODS } from "@/core/utils/http-client";
import { apiCall } from "@/core/utils/http-utils";
import { SourceTypeEnum } from "@/core/types/common";
import { EnvironmentTypeEnum } from "@/core/types/Environment";
import * as commonUtils from "@/core/utils/common";

// Mock the apiCall function
jest.mock("@/core/utils/http-utils", () => ({
  api_urls: {
    GET_BANK_INSTITUTIONS: "mock-bank-institutions-url",
    GET_PAYMENT_DETAILS: "mock-payment-details-url",
    SECURE_PAYMENT_AUTH: "mock-secure-payment-auth-url",
    GET_PAYMENT_STATUS: "mock-payment-status-url/$id",
  },
  apiCall: jest.fn((callback: () => Promise<any>) => callback()),
}));

// Mock the ApiClient class
jest.mock("@/core/utils/http-client", () => ({
  API_METHODS: {
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "delete",
  },
  ApiClient: jest.fn().mockImplementation(() => ({
    makeRequest: jest.fn(),
  })),
}));

// Mock the common utilities
jest.mock("@/core/utils/common", () => ({
  detectBrowser: jest.fn(() => "Chrome"),
  isMobile: jest.fn(() => false),
}));

// Mock global navigator
Object.defineProperty(window, "navigator", {
  value: {
    platform: "MacIntel",
    deviceMemory: 8,
  },
  writable: true,
});

class TestablePaymentsService extends PaymentsService {
  constructor(mockClient: any) {
    super();
    // Override the http property with our mock
    Object.defineProperty(this, "http", {
      value: mockClient,
      writable: true,
    });
  }
}

describe("PaymentsService", () => {
  let service: TestablePaymentsService;
  let mockApiClient: { makeRequest: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = { makeRequest: jest.fn() };
    service = new TestablePaymentsService(mockApiClient);
  });

  describe("fetchConsumerBankInstitutions", () => {
    it("should call makeRequest with correct parameters", async () => {
      // Arrange
      const mockResponse = [{ id: "bank1", name: "Bank One" }];
      mockApiClient.makeRequest.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await service.fetchConsumerBankInstitutions({env: EnvironmentTypeEnum.SANDBOX});

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        url: "mock-bank-institutions-url",
        method: API_METHODS.GET,
      });
      expect(result).toEqual(mockResponse);
      expect(apiCall).toHaveBeenCalled();
    });

    it("should propagate errors from the API call", async () => {
      // Arrange
      const mockError = new Error("Network error");
      mockApiClient.makeRequest.mockRejectedValueOnce(mockError);

      // Mock apiCall to actually throw the error
      (apiCall as jest.Mock).mockImplementationOnce(async (callback) => {
        try {
          return await callback();
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(service.fetchConsumerBankInstitutions({env: EnvironmentTypeEnum.PRODUCTION})).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("fetchPaymentDetails", () => {
    it("should call makeRequest with correct parameters", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockParams = { env: EnvironmentTypeEnum.PRODUCTION };
      const mockResponse = {
        merchantId: "merchant1",
        consumerId: "consumer1",
        amount: { amount: 100 },
      };
      mockApiClient.makeRequest.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await service.fetchPaymentDetails(
        mockPaymentRequestId,
        mockParams
      );

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        url: "mock-payment-details-url",
        method: API_METHODS.POST,
        params: { env: mockParams.env.toLowerCase() },
        json: {
          data: mockPaymentRequestId,
          source: "EXTERNAL_MERCHANT",
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the API call", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockParams = { env: EnvironmentTypeEnum.PRODUCTION };
      const mockError = new Error("Network error");
      mockApiClient.makeRequest.mockRejectedValueOnce(mockError);

      // Mock apiCall to actually throw the error
      (apiCall as jest.Mock).mockImplementationOnce(async (callback) => {
        try {
          return await callback();
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(
        service.fetchPaymentDetails(mockPaymentRequestId, mockParams)
      ).rejects.toThrow("Network error");
    });

    it("should convert environment to lowercase", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockParams = { env: "PROD" as EnvironmentTypeEnum };
      mockApiClient.makeRequest.mockResolvedValueOnce({});

      // Act
      await service.fetchPaymentDetails(mockPaymentRequestId, mockParams);

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { env: "prod" },
        })
      );
    });
  });

  describe("callBankAuthorisationUrl", () => {
    it("should call makeRequest with correct parameters", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockPaymentDetails = {
        merchantId: "merchant1",
        employeeId: "employee1",
        merchantBusinessName: "Business Name",
        amount: { amount: 100 },
        consumerId: "consumer1",
        taxPercentage: 20,
        servicePercentage: 5,
        paymentType: "OPEN_BANKING",
        encryptedPaymentDetails: "encrypted-data",
        encryptedRefundPaymentDetails: "encrypted-refund-data",
        encryptedNotesDetails: "encrypted-notes",
        encryptedQrDetails: "encrypted-qr",
        contextType: "CHECKOUT",
        expiresIn: 3600,
        requestCreatedAt: "2023-01-01",
        strictExpiry: true,
        allowSdkRetry: true,
        redirectOnCompleted: false,
        splitBill: false,
        options: { option1: "value1" },
        qrDetails: { qr: "data" },
        storeDetails: { store: "data" },
        fraudDetails: { fraud: "data" },
      };
      const mockSelectedBank = {
        id: "bank1",
        features: ["feature1", "feature2"],
      };
      const mockResponse = { authUrl: "https://bank-auth-url.com" };
      mockApiClient.makeRequest.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await service.callBankAuthorisationUrl(
        mockPaymentRequestId,
        mockPaymentDetails as any,
        mockSelectedBank as any
      );

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        url: "mock-secure-payment-auth-url",
        method: API_METHODS.POST,
        json: {
          merchantId: mockPaymentDetails.merchantId,
          employeeId: mockPaymentDetails.employeeId,
          merchantName: mockPaymentDetails.merchantBusinessName,
          amount: {
            amount: mockPaymentDetails.amount.amount,
            currency: "GBP",
          },
          applicationUserId: mockPaymentDetails.consumerId,
          consumerId: mockPaymentDetails.consumerId,
          institutionId: mockSelectedBank.id,
          taxPercentage: mockPaymentDetails.taxPercentage,
          servicePercentage: mockPaymentDetails.servicePercentage,
          features: mockSelectedBank.features,
          paymentDevice: {
            platform: "MacIntel",
            osVersion: null,
            browser: "Chrome",
            manufacturer: null,
            model: null,
            deviceMemory: 8,
          },
          deviceOrigin: "DESKTOP",
          paymentRequest: {
            paymentType: mockPaymentDetails.paymentType,
          },
          encryptedPaymentDetails: mockPaymentDetails.encryptedPaymentDetails,
          encryptedRefundPaymentDetails:
            mockPaymentDetails.encryptedRefundPaymentDetails,
          encryptedNotesDetails: mockPaymentDetails.encryptedNotesDetails,
          encryptedQrDetails: mockPaymentDetails.encryptedQrDetails,
          contextType: mockPaymentDetails.contextType,
          paymentRequestSource: {
            paymentRequestSourcetype: SourceTypeEnum.EXTERNAL_MERCHANT,
            paymentRequestId: mockPaymentRequestId,
            expiresIn: mockPaymentDetails.expiresIn.toString(),
            requestCreatedAt: mockPaymentDetails.requestCreatedAt,
            strictExpiry: mockPaymentDetails.strictExpiry.toString(),
            allowSdkRetry: mockPaymentDetails.allowSdkRetry.toString(),
            redirectOnCompleted:
              mockPaymentDetails.redirectOnCompleted.toString(),
            splitBill: mockPaymentDetails.splitBill,
          },
          merchantPaymentOptions: mockPaymentDetails.options,
          paymentSourceType: SourceTypeEnum.EXTERNAL_MERCHANT,
          qrCodeDetails: mockPaymentDetails.qrDetails,
          storeDetails: mockPaymentDetails.storeDetails,
          fraudDetails: mockPaymentDetails.fraudDetails,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the API call", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockPaymentDetails = {
        merchantId: "merchant1",
        consumerId: "consumer1",
        amount: { amount: 100 },
      };
      const mockSelectedBank = { id: "bank1", features: [] };
      const mockError = new Error("Authorization failed");
      mockApiClient.makeRequest.mockRejectedValueOnce(mockError);

      // Mock apiCall to actually throw the error
      (apiCall as jest.Mock).mockImplementationOnce(async (callback) => {
        try {
          return await callback();
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(
        service.callBankAuthorisationUrl(
          mockPaymentRequestId,
          mockPaymentDetails as any,
          mockSelectedBank as any
        )
      ).rejects.toThrow("Authorization failed");
    });

    it("should handle undefined paymentRequestId", async () => {
      // Arrange
      const mockPaymentDetails = {
        merchantId: "merchant1",
        consumerId: "consumer1",
        amount: { amount: 100 },
      };
      const mockSelectedBank = { id: "bank1", features: [] };
      mockApiClient.makeRequest.mockResolvedValueOnce({});

      // Act
      await service.callBankAuthorisationUrl(
        undefined,
        mockPaymentDetails as any,
        mockSelectedBank as any
      );

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          json: expect.objectContaining({
            paymentRequestSource: expect.objectContaining({
              paymentRequestId: null,
            }),
          }),
        })
      );
    });

    it("should detect mobile device correctly", async () => {
      // Arrange
      (commonUtils.isMobile as jest.Mock).mockReturnValueOnce(true);
      mockApiClient.makeRequest.mockResolvedValueOnce({});

      // Act
      await service.callBankAuthorisationUrl(
        "payment123",
        { consumerId: "consumer1", amount: { amount: 100 } } as any,
        { id: "bank1" } as any
      );

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          json: expect.objectContaining({
            deviceOrigin: "MOBILE",
          }),
        })
      );
    });
  });

  describe("getPaymentStatusByID", () => {
    it("should call makeRequest with correct parameters", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockParams = { env: EnvironmentTypeEnum.PRODUCTION };
      const mockResponse = { status: "COMPLETED" };
      mockApiClient.makeRequest.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await service.getPaymentStatusByID(
        mockPaymentRequestId,
        mockParams
      );

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        url: "mock-payment-status-url/payment123",
        method: API_METHODS.GET,
        params: { env: mockParams.env.toLowerCase() },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the API call", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockParams = { env: EnvironmentTypeEnum.PRODUCTION };
      const mockError = new Error("Status lookup failed");
      mockApiClient.makeRequest.mockRejectedValueOnce(mockError);

      // Mock apiCall to actually throw the error
      (apiCall as jest.Mock).mockImplementationOnce(async (callback) => {
        try {
          return await callback();
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(
        service.getPaymentStatusByID(mockPaymentRequestId, mockParams)
      ).rejects.toThrow("Status lookup failed");
    });

    it("should convert environment to lowercase", async () => {
      // Arrange
      const mockPaymentRequestId = "payment123";
      const mockParams = { env: "PROD" as EnvironmentTypeEnum };
      mockApiClient.makeRequest.mockResolvedValueOnce({});

      // Act
      await service.getPaymentStatusByID(mockPaymentRequestId, mockParams);

      // Assert
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { env: "prod" },
        })
      );
    });
  });
});
