/**
 * Mock Server for Atoa Web SDK Integration
 * 
 * This is a simplified demonstration of how to implement server-side
 * integration with Atoa Payment APIs. In a real-world scenario, you would
 * use proper authentication, validation, error handling, and database storage.
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Atoa API Configuration - In production, store these in environment variables
const ATOA_API_CONFIG = {
  baseUrl: 'https://api.atoa.me',
  apiKey: 'YOUR_ATOA_API_KEY',
  apiSecret: 'YOUR_ATOA_API_SECRET',
  storeId: 'YOUR_ATOA_STORE_ID'
};

async function createAtoaPaymentRequest(paymentDetails) {
  try {
    // Refer [https://docs.atoa.me/api-reference/Payment/process-payment] for more details
    const response = await axios.post(
      `${ATOA_API_CONFIG.baseUrl}/api/payments/process-payment`,
      {
        customerId: paymentDetails.customerId || crypto.randomUUID(),
        consumerDetails: {
          email: paymentDetails.customerDetails.email,
        },
        orderId: paymentDetails.orderId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        paymentType: "TRANSACTION",
        autoRedirect: false,
        callbackParams: {
          orderId: paymentDetails.orderId,
        },
        expiresIn: 600000, // 10 minutes
        enableTips: false,
        storeId: ATOA_API_CONFIG.storeId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ATOA_API_CONFIG.apiSecret
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating Atoa payment request:', error);
    throw new Error('Failed to create payment request');
  }
}

app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, currency, customerDetails } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const orderId = `order-${Date.now()}`;
    
    const paymentDetails = {
      amount,
      currency,
      customerDetails,
      orderId,
      customerId: crypto.randomUUID()
    };
    
    const paymentRequest = await createAtoaPaymentRequest(paymentDetails);
    
    res.json(paymentRequest);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Webhook endpoint for receiving payment updates from Atoa
// Refer [https://docs.atoa.me/api-reference/Webhook/CreateWebhookEvent] for more details
app.post('/api/webhooks/atoa-payment', (req, res) => {
  //* For processing webhook events for payment updates
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html to view the demo`);
}); 