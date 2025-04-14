const baseURL = import.meta.env.VITE_BASE_URL;

export const api_urls = {
  GET_PAYMENT_DETAILS: `${baseURL}/payments/get-payment-details`,
  GET_BANK_INSTITUTIONS: `${baseURL}/sdk-payment/institutions/customer?sendDisabledBanks=true`,
  SECURE_PAYMENT_AUTH: `${baseURL}/payments/v1/secure-payment-auth`,
  GET_PAYMENT_STATUS: `${baseURL}/sdk-payment/status/$id`,
};

export class Failure extends Error {
  statusCode: number | undefined;
  title: string | undefined;
  name: string;
  time: string;
  referenceId: string | undefined;
  amount: number | undefined;
  redirectUrl: string | undefined;

  constructor(
    message: string,
    statusCode?: number,
    title?: string,
    name?: string,
    time?: string,
    referenceId?: string,
    amount?: number,
    redirectUrl?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.title = title;
    this.name = name ?? "";
    this.time = time ?? "";
    this.referenceId = referenceId ?? "";
    this.amount = amount;
    this.redirectUrl = redirectUrl ?? "";
  }
}

export const apiCall = async function apiCall<Type>(
  callback: () => Promise<Type>
): Promise<Type> {
  try {
    return await callback();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error && error.message) {
      if (error.name == "AbortError") {
        throw new Failure(error.message, error.name);
      }
      const errorMsgParsed = error.message.toLowerCase();

      if (["load failed", "failed to fetch"].includes(errorMsgParsed)) {
        throw new Failure(
          "Looks like the internet connection is unstable , please ensure your network is stable",
          1000 //"NETWORK_ERR"
        );
      }

      if (
        "this link is already paid" === errorMsgParsed ||
        "please reach out to the business for a new link and attempt to pay again" ===
          errorMsgParsed
      ) {
        throw new Failure(
          error.message,
          error.status,
          error.title,
          error.name,
          error.time,
          error.referenceId,
          error.amount,
          error.redirectUrl
        );
      }

      // The client was given an error response (5xx, 4xx)
      throw new Failure(error.message, error.status, error?.title, error?.name);
    } else if (error.request) {
      // The client never received a response, and the request was never left
      throw new Failure(error.message, error.status, error?.title, error?.name);
    } else {
      // Anything else
      throw new Failure("Oops! An unknown error occurred.");
    }
  }
};
