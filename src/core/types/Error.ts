/**
 * Custom error class for Atoa Web SDK errors
 */
export class AtoaPayWebSDKError extends Error {
  details?: Record<string, unknown>;

  /**
   * Creates a new Atoa Web SDK error
   * @param message - Error message
   * @param details - Additional error details
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message);

    // Set the prototype explicitly (required for extending built-in classes in TypeScript)
    Object.setPrototypeOf(this, AtoaPayWebSDKError.prototype);

    this.name = "AtoaPayWebSDKError";
    if (details) {
      this.details = details;
    }
  }
}
