# Atoa Web Client SDK

The official web client SDK for integrating Atoa Payments into web applications.

[![npm version](https://img.shields.io/npm/v/@atoapayments/atoa-web-client-sdk.svg)](https://www.npmjs.com/package/@atoapayments/atoa-web-client-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Required:** Before using this SDK, you must follow the [Getting Started Guide](https://docs.atoa.me/introduction) to set up your Atoa developer account and obtain API credentials.

## Overview

The Atoa Web Client SDK allows merchants to easily integrate Atoa Payments into their web applications. The SDK provides a simple interface for showing a payment dialog that handles the entire payment flow securely and efficiently.

## Installation

```bash
npm install @atoapayments/atoa-web-client-sdk
```

## Usage

### ES Modules / TypeScript

```javascript
import { AtoaWebSdk } from "@atoapayments/atoa-web-client-sdk";

// Initialize the SDK with environment
const sdk = new AtoaWebSdk({
  environment: "PRODUCTION", // 'SANDBOX' for testing
  paymentRequestId: "your-payment-request-id",
  customerDetails: {
    phoneCountryCode: "44",
    phoneNumber: "1234567890",
    email: "test@mail.com",
  }, // Optional – enables one-click payments for return users
  onError: (error) => {
    // Optional: Show error message to user
    // Example: showToast(error.message || "Something went wrong");
  },
  onPaymentStatusChange: (data) => {
    // Optional: Handle real-time status updates
    if (data.status === "COMPLETED") {
      // Example: Redirect to confirmation page
      // window.location.href = `/payment-success?order=${data.paymentRequestId}`;
    }
  },
  onClose: (data) => {
    // Optional: Track close event or navigate to order summary
    // Example: window.location.href = '/order-summary';
  },
  onUserCancel: (paymentRequestId) => {
    // Optional: Track close event or navigate to order summary
    // Example: window.location.href = '/order-summary';
  },
});

// Show payment dialog
sdk.showPaymentDialog();
```

### HTML Script Tag

```html
<script type="module">
  import { AtoaWebSdk } from "https://unpkg.com/@atoapayments/atoa-web-client-sdk";

  // Initialize the SDK with environment
  const sdk = new AtoaWebSdk({
    environment: "PRODUCTION", // 'SANDBOX' for testing
    paymentRequestId: "your-payment-request-id",
    customerDetails: {
      phoneCountryCode: "44",
      phoneNumber: "1234567890",
      email: "test@mail.com",
    }, // Optional – enables one-click payments for return users
    onError: (error) => {
      // Optional: Show error message to user
      // Example: showToast(error.message || "Something went wrong");
    },
    onPaymentStatusChange: (data) => {
      // Optional: Handle real-time status updates
      if (data.status === "COMPLETED") {
        // Example: Redirect to confirmation page
        // window.location.href = `/payment-success?order=${data.paymentRequestId}`;
      }
    },
    onClose: (data) => {
      // Optional: Track close event or navigate to order summary
      // Example: window.location.href = '/order-summary';
    },
    onUserCancel: (paymentRequestId) => {
      // Optional: Track close event or navigate to order summary
      // Example: window.location.href = '/order-summary';
    },
  });

  document.getElementById("payment-button").addEventListener("click", () => {
    sdk.showPaymentDialog();
  });
</script>
```

### Customer Details for Previously Used Banks

The SDK supports displaying banks the customer has previously paid with through the `customerDetails` parameter:

#### Using Customer Details

```javascript
const sdk = new AtoaWebSdk({
  environment: "PRODUCTION",
  paymentRequestId: "your-payment-request-id",
  customerDetails: {
    phoneCountryCode: "44",
    phoneNumber: "1234567890",
    email: "test@mail.com",
  },
  // ... other options
});
```

#### Important Notes About Customer Details

- **Customer Identification**: Either email OR both phoneNumber and phoneCountryCode must be provided in customerDetails. If both are provided, phoneNumber and phoneCountryCode will take precedence.
- **Returning Customers**: For returning customers, providing the same customerDetails allows the SDK to offer the option to pay with banks they've previously used.
- **Security**: The information about previously used banks is securely stored by Atoa, not in your application.
- **Optional**: This parameter is optional. If not provided, each payment will be treated as a new transaction without showing previously used banks.

## API Reference

### Constructor

```javascript
new AtoaWebSdk(options);
```

#### Parameters

- `options`: Configuration object (required)
  - `environment`: The Atoa environment to use (enum: 'SANDBOX', 'PRODUCTION')
  - `paymentRequestId`: The payment request ID (required)
  - `customerDetails`: Customer details for the payment (optional)
  - `onError`: Error callback function (optional)
  - `onPaymentStatusChange`: Callback for payment status updates (optional)
  - `onClose`: Callback when payment dialog is closed (optional)
  - `onUserCancel`: Callback when payment is cancelled by user (optional)

#### Detailed SDK Options

##### Environment

- Type: `EnvironmentTypeEnum`
- Required: Yes
- Values: 'SANDBOX' | 'PRODUCTION'
- Description: Specifies which Atoa environment to use for the payment

##### Payment Request ID

- Type: `string`
- Required: Yes
- Description: Unique identifier for the payment request

##### Customer Details

- Type: `CustomerDetails`
- Required: No
- Description: Customer information for the payment. When provided, the SDK will use this information to fetch the last bank used by the customer for payment, improving the user experience by showing their preferred bank first.

##### Event Handlers

###### onError

- Type: `(error: AtoaPayWebSDKError) => void`
- Description: Called when an error occurs during the payment process
- Parameters:
  - `error`: Error object containing:
    - `message`: Error message
    - `details`: Additional error details (if available)

###### onPaymentStatusChange

- Type: 
  ```typescript
  (data: {
    status: string;
    paymentRequestId: string;
    paymentIdempotencyId?: string;
    callbackParams?: Record<string, string>;
    atoaSignature?: string;
    atoaSignatureHash?: string;
  }) => void
  ```
- Description: Called when the payment status changes
- Parameters:
  - `data`: Status data object containing:
    - `status`: Current payment status
    - `paymentRequestId`: The payment request ID
    - `paymentIdempotencyId`: (optional) Payment idempotency ID
    - `callbackParams`: (optional) Additional callback parameters
    - `atoaSignature`: (optional) Atoa signature for verification
    - `atoaSignatureHash`: (optional) Atoa signature hash for verification

###### onClose

- Type:
  ```typescript
  (data?: {
    status: string;
    paymentRequestId: string;
    paymentIdempotencyId: string;
    callbackParams?: Record<string, string>;
    atoaSignature?: string;
    atoaSignatureHash?: string;
  }) => void
  ```
- Description: Called when the payment dialog is closed
- Parameters:
  - `data`: Close data object containing:
    - `status`: Final payment status
    - `paymentRequestId`: The payment request ID
    - `paymentIdempotencyId`: Payment idempotency ID
    - `callbackParams`: (optional) Additional callback parameters
    - `atoaSignature`: (optional) Atoa signature for verification
    - `atoaSignatureHash`: (optional) Atoa signature hash for verification

###### onUserCancel

- Type: `(paymentRequestId: string) => void`
- Description: Called when the user cancels the payment
- Parameters:
  - `paymentRequestId`: The payment request ID

### Methods

#### showPaymentDialog()

Shows the payment dialog with the configured options.

```javascript
sdk.showPaymentDialog();
```

This method:

- Creates a custom web component for the payment dialog
- Appends the dialog to the document body
- Handles all payment flow interactions

**Returns:**

- `void`

#### dispose()

Cleans up resources used by the SDK.

```javascript
sdk.dispose();
```

This method:

- Removes the dialog element from the DOM
- Resets instance properties

### Event Callbacks

#### onError(error)

Called when an error occurs during the payment process.

**Parameters:**

- `error`: Error object with:
  - `message`: Error message
  - `details`: Additional error details (if available)

#### onPaymentStatusChange(data)

Called when the payment status changes.

**Parameters:**

- `data`: Status data object with:
  - `status`: Current payment status
  - `paymentRequestId`: The payment request ID
  - `paymentIdempotencyId`: (optional) Payment idempotency ID

#### onClose(data)

Called when the payment dialog is closed.

**Parameters:**

- `data`: Close data object with:
  - `paymentIdempotencyId`: Payment idempotency ID
  - `status`: Final payment status

#### onUserCancel(paymentRequestId)

Called when the user cancels the payment.

**Parameters:**

- `paymentRequestId`: The payment request ID

### Signature Verification

For enhanced security, Atoa provides signature data in the `onPaymentStatusChange` and `onClose` callbacks. This signature should be used to verify the authenticity of webhook notifications on your server.

#### Webhook Events
Atoa supports the following webhook events:
- `PAYMENT_STATUS`: Notifications for successful, pending, and failed payments
- `EXPIRED_STATUS`: Notifications for expired payments
- `REFUND_STATUS`: Notifications for refund processing (COMPLETED, CANCELLED, FAILED)

For detailed webhook implementation, including payload formats and endpoint setup, refer to the [Atoa Webhook Documentation](https://docs.atoa.me/api-reference/Webhook/CreateWebhookEvent).

### Error Handling

The SDK throws `AtoaPayWebSDKError` in the following cases:

- When SDK options are not provided
- When SDK options are not an object
- When environment is invalid
- When payment request ID is missing or empty
- When there's an error displaying the payment dialog

## License

MIT © [Atoa Payments Limited](https://paywithatoa.co.uk)
