/**
 * Atoa Mock Card simulator — the sandbox stand-in for the Rapyd hosted checkout.
 *
 * A convenience list, never the source of truth: the backend resolves the submitted number against
 * its own copy and refuses anything else. Mirrors the consumer web, which mirrors the processor's
 * `mock-card.catalogue.ts`.
 */

/** What a saved card does on a later MIT charge; its PRESENCE is what makes a card savable. */
export type MockCardSavedBehavior = "SUCCESS";

/** Outcome labels for a save-card payment, named for what happens to the SAVED card. */
export const SAVED_CARD_TAGS: Record<MockCardSavedBehavior, string> = {
  SUCCESS: "Saves on a passed 3DS challenge",
};

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

  /** Set only on the cards a save-card payment may use — the fact the backend's guard keys on. */
  savedBehavior?: MockCardSavedBehavior;
}

/** The published test cards. One missing here can still be typed by hand. */
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
    savedBehavior: "SUCCESS",
  },
  {
    testCardId: "tc_mastercard_3ds",
    pan: "5555 5555 5555 0127",
    tag: "3DS challenge",
    requires3ds: true,
    savedBehavior: "SUCCESS",
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

/** Simulate request. Card details ride along only so a save-card payment has something to save. */
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
