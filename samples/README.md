# Atoa Web SDK - Integration Example

This example demonstrates a complete integration of the Atoa Web SDK, featuring both client-side and server-side components.

## Overview

This sample includes:
- A frontend checkout page that collects customer information
- A mock Express.js server that simulates integration with Atoa's payment API
- Proper handling of payment creation and verification flows

## Prerequisites

Before running this example, ensure you have:
1. Node.js v14 or higher installed
3. NPM or Yarn for installing dependencies

## Setup

1. First, build the Atoa Web SDK in the parent project (if not already done):
   ```
   cd ..
   npm run build
   ```

2. Install dependencies for this example:
   ```
   cd samples
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser to http://localhost:3000 to view the demo

## Implementation Details

### Frontend (index.html)
The frontend implementation demonstrates:
- A complete checkout flow using Atoa Web SDK
- Collecting user information and payment details
- Handling payment status updates and error cases
- Providing user feedback throughout the payment process

Key sections in the frontend code:
```javascript
// Initialize the Atoa Web SDK with the payment request details
const sdk = new AtoaWebSdk({
  environment: "SANDBOX", // Use SANDBOX or PRODUCTION
  paymentRequestId: paymentRequest.paymentRequestId, // From your server
  customerDetails: {
    email: email
  },
  onError: (error) => {
    // Handle errors
  },
  onPaymentStatusChange: (data) => {
    // Handle payment status updates
  },
  onClose: (data) => {
    // Handle payment dialog close events
  },
  onUserCancel: () => {
    // Handle user cancellation
  }
});

// Show the payment dialog
sdk.showPaymentDialog();
```

### Backend (server.js)
The backend implementation demonstrates:
- Creating payment requests with Atoa's API
- Verifying payment status
- Handling webhooks for payment updates
- Secure handling of API credentials

Key server-side API endpoints:
- `POST /api/create-payment`: Creates a new payment request

## File Structure

- `index.html` - Frontend implementation with checkout form and SDK integration
- `server.js` - Node.js/Express server with API endpoints for payment processing
- `package.json` - Project dependencies and scripts

## Additional Resources

- [Atoa API Documentation](https://docs.atoa.me/api-reference)
- [Express.js Documentation](https://expressjs.com/)
- [Webhook Best Practices](https://docs.atoa.me/webhooks) 