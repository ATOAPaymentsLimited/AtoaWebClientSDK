// Type definitions for Atoa Web Client SDK
// Project: https://github.com/ATOAPaymentsLimited/AtoaWebClientSDK

import { 
  SdkOptions,
  ErrorEventHandler,
  PaymentStatusEventHandler,
  UserCancelPaymentEventHandler,
  DialogCloseEventData,
  DialogCloseEventHandler,
  CustomerDetails,
  EnvironmentTypeEnum,
  AtoaPayWebSDKError
} from './core';

export { 
  SdkOptions,
  ErrorEventHandler,
  PaymentStatusEventHandler,
  UserCancelPaymentEventHandler,
  DialogCloseEventData,
  DialogCloseEventHandler,
  CustomerDetails,
  EnvironmentTypeEnum,
  AtoaPayWebSDKError
};

export declare class AtoaWebSdk {
  private dialogElement: HTMLElement | null;
  providedSdkOptions?: SdkOptions | null;
  
  constructor(options?: SdkOptions);
  validateSdkOptions(options?: SdkOptions): void;
  showPaymentDialog(): void;
  removeDialog(): void;
  dispose(): void;
} 