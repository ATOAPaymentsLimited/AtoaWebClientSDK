import { API_METHODS, ApiClient } from "@/core/utils/http-client";
import { apiCall, api_urls } from "@/core/utils/http-utils";
import type {
  SimulateCardPaymentRequest,
  SimulateCardPaymentResponse,
} from "@/core/types/MockCardSimulator";

/**
 * Atoa Mock Card simulator.
 *
 * One call: submit the chosen test card and get back the status the payment ended in.
 */
export class MockCardSimulatorService {
  private http: ApiClient | never;

  constructor(httpClient?: never) {
    this.http = httpClient ?? new ApiClient();
  }

  /**
   * Simulate the sandbox card payment with the given test card.
   *
   * The outcome is the backend's to decide: it resolves the number against its own catalogue and
   * refuses anything else, so a wrong number is an error rather than a made-up decline.
   */
  simulatePayment(
    paymentIdempotencyId: string,
    body: SimulateCardPaymentRequest,
  ): Promise<SimulateCardPaymentResponse> {
    return apiCall<SimulateCardPaymentResponse>(async () => {
      return this.http.makeRequest({
        method: API_METHODS.POST,
        url: api_urls.SIMULATE_SANDBOX_CARD_PAYMENT.replace(
          "$paymentIdempotencyId",
          paymentIdempotencyId,
        ),
        json: body,
      });
    });
  }
}
