/**
 * Atoa Mock Card simulator — the sandbox stand-in for the Rapyd hosted checkout.
 *
 * The catalogue lives here rather than arriving on the authorization response: these are published
 * test cards, the same list the sandbox docs show, and the backend resolves whatever number is
 * submitted against its own copy. A card that is not in its copy is refused, so this list is a
 * convenience for the tester, never the source of truth for the outcome.
 *
 * Mirrors `types/MockCardSimulator.ts` in the consumer web, which mirrors `mock-card.catalogue.ts`
 * in the payment processor.
 */

/** One selectable test card. */
export interface MockCardTestCard {
  /** Catalogue key, matching the backend's `testCardId`. */
  testCardId: string;

  /** The number submitted for this outcome, formatted for display. */
  pan: string;

  /** Short label for the outcome the card produces, e.g. "Declined". */
  tag: string;

  /** Whether choosing this card presents the 3DS step. */
  requires3ds: boolean;
}

/**
 * The published sandbox test cards.
 *
 * Adding a card to the processor's catalogue and not here only means testers cannot pick it from
 * the list; the number would still work if typed.
 */
export const SANDBOX_TEST_CARDS: readonly MockCardTestCard[] = [
  {
    testCardId: "tc_visa_ok",
    pan: "4242 4242 4242 4242",
    tag: "Completed",
    requires3ds: false,
  },
  {
    testCardId: "tc_visa_3ds",
    pan: "4000 0000 0000 0127",
    tag: "3DS challenge",
    requires3ds: true,
  },
  {
    testCardId: "tc_mastercard_3ds",
    pan: "5555 5555 5555 0127",
    tag: "3DS challenge",
    requires3ds: true,
  },
  {
    testCardId: "tc_mastercard_ok",
    pan: "5555 5555 5555 4444",
    tag: "Completed",
    requires3ds: false,
  },
  {
    testCardId: "tc_declined",
    pan: "4000 0000 0000 0002",
    tag: "Declined",
    requires3ds: false,
  },
  {
    testCardId: "tc_no_funds",
    pan: "4000 0000 0000 0143",
    tag: "No funds",
    requires3ds: false,
  },
  {
    testCardId: "tc_expired",
    pan: "4000 0000 0000 0069",
    tag: "Expired",
    requires3ds: false,
  },
  {
    testCardId: "tc_cancelled",
    pan: "4000 0000 0000 0101",
    tag: "Cancelled",
    requires3ds: false,
  },
];

/**
 * Request body of the sandbox simulate endpoint.
 *
 * The card details are sent only so a payment that saves the card has something to save: the
 * outcome still comes from the number alone.
 */
export interface SimulateCardPaymentRequest {
  cardNumber: string;
  threeDsCode?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
}

/** Its response: the status the simulated outcome produced. */
export interface SimulateCardPaymentResponse {
  paymentIdempotencyId: string;
  status: string;
}
