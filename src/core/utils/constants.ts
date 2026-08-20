export const DEFAULT_TRANSACTION_LIMIT = 25000;

// Marks a simulated card checkout id, which must never reach the Rapyd toolkit (it 400s, because
// no such session exists on their side). The only signal that the sandbox simulator owns the screen.
export const MOCK_CARD_CHECKOUT_PREFIX = "checkout_mockcard_";

// The 3DS code the sandbox simulator authenticates on; anything else declines the payment.
export const MOCK_CARD_3DS_CODE = "123456";