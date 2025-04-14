/* eslint-disable @typescript-eslint/no-explicit-any */
// Regular expression patterns for testing content-type response headers.
const RE_CONTENT_TYPE_JSON = /^application\/(x-)?json/i;
const RE_CONTENT_TYPE_TEXT = /^text\//i;

interface ApiConfig {
  contentType?: string;
  headers?: {
    [key: string]: string;
  };
  method: API_METHODS;
  url: string;
  params: { [key: string]: string | number };
  json: { [key: string]: any };
  body: BodyInit | null | undefined;
  signal: AbortSignal;
}

export enum API_METHODS {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

export class ApiClient {
  /**
   * I initialize the API client.
   */
  constructor() {
    // Nothing to do at this time. In the future, I could add things like base
    // headers and other configuration defaults. But, I don't need any of that stuff
    // at this time.
  }

  // ---
  // PUBLIC METHODS.
  // ---

  /**
   * I make the API request with the given configuration options.
   *
   * GUARANTEE: All errors produced by this method will have consistent structure, even
   * if they are low-level networking errors. Every Promise rejection is guaranteed to
   * have a "type" and a "message" property.
   */
  async makeRequest(config: Partial<ApiConfig>) {
    // CAUTION: We want the entire contents of this method to be inside the try/catch
    // so that we can guarantee that all errors occurring during this workflow will
    // be caught and transformed into a consistent structure. NOTHING HERE SHOULD
    // throw an error - but, bugs happen and people pass-in malformed parameters and
    // I want the error-handling guarantees in place.
    try {
      // Extract options, with defaults, from config.
      const contentType = config.contentType || null;
      const headers = config.headers || Object.create(null);
      const method = config.method || null;
      const url = config.url || "";
      const params = config.params || Object.create(null);
      const json = config.json || null;
      const body = config.body || null;
      const signal = config.signal || null;

      // The fetch* variables are the values that we'll actually use to generate
      // the fetch() call. We're going to assign these based on the configuration
      // data that was passed-in.
      const fetchHeaders = this.buildHeaders(headers);
      let fetchMethod = null;
      const fetchUrl = this.mergeParamsIntoUrl(url, params);
      let fetchBody = null;

      if (json) {
        fetchHeaders["content-type"] = contentType || "application/json";
        fetchMethod = method || "post";
        fetchBody = JSON.stringify(json);
      } else if (body) {
        fetchHeaders["content-type"] =
          contentType || "application/octet-stream";
        fetchMethod = method || "post";
        fetchBody = body;
      } else {
        fetchMethod = method || "get";
      }

      const fetchRequeset = new window.Request(fetchUrl, {
        headers: fetchHeaders,
        method: fetchMethod,
        body: fetchBody,
        signal: signal,
        credentials: "include",
      });

      const fetchResponse = await window.fetch(fetchRequeset);
      const data = await this.unwrapResponseData(fetchResponse);

      if (fetchResponse.ok || fetchResponse?.status == 304) {
        return data;
      }

      // The request came back with a non-2xx status code; but may still contain an
      // error structure that is defined by our business domain.
      return Promise.reject(data);
    } catch (error) {
      // The request failed in a critical way; the content of this error will be
      // entirely unpredictable.
      return Promise.reject(error);
    }
  }

  /**
   * I transform the collection of HTTP headers into a like collection wherein the names
   * of the headers have been lower-cased. This way, if we need to manipulate the
   * collection prior to transport, we'll know what key-casing to use.
   */
  buildHeaders(headers: { [key: string]: string }) {
    const lowercaseHeaders = Object.create(null);

    Object.entries(headers).forEach(([key, value]) => {
      lowercaseHeaders[key.toLowerCase()] = value;
    });

    return { ...lowercaseHeaders };
  }

  /**
   * I build a query string (less the leading "?") from the given params.
   *
   * NOTE: At this time, there is no special handling of array-based values.
   */
  buildQueryString(params: { [key: string]: string | boolean | number }) {
    return Object.entries(params)
      .map(([key, value]) => {
        if (value === true) {
          return encodeURIComponent(key);
        }

        return encodeURIComponent(key) + "=" + encodeURIComponent(value);
      })
      .join("&");
  }

  /**
   * I merged the given params into the given URL. This is done by parsing the URL,
   * extracting the URL-based params, merging them with the given params, and then
   * rebuilding the URL with the merged params.
   *
   * NOTE: The given params take precedence in the case of a name-conflict.
   */
  mergeParamsIntoUrl(
    url: string,
    params: {
      [key: string]: string | number;
    }
  ) {
    // Split on fragment segments.
    const hashParts = url.split("#", 2);
    const preHash = hashParts[0];
    const fragment = hashParts[1] || "";

    // Split on search segments.
    const urlParts = preHash.split("?", 2);
    const scriptName = urlParts[0];

    // When merging the url-params and the additional params, the additional params
    // take precedence (meaning, they will overwrite url-based params).
    const urlParams = this.parseQueryString(urlParts[1] || "");
    const mergedParams = Object.assign(urlParams, params);
    const queryString = this.buildQueryString(mergedParams);

    const results = [scriptName];

    if (queryString) {
      results.push("?", queryString);
    }

    if (fragment) {
      results.push("#", fragment);
    }

    return results.join("");
  }

  /**
   * I parse the given query string into an object.
   *
   * NOTE: This method assumes that the leading "?" has already been removed.
   */
  parseQueryString(queryString: string) {
    const params = Object.create(null);

    for (const pair of queryString.split("&")) {
      const parts = pair.split("=", 2);
      const key = decodeURIComponent(parts[0]);
      // CAUTION: If there is no value in the query string pair, we want to use a
      // literal TRUE value since this literal value will be treated differently
      // when subsequently serializing the params back into a query string.
      const value = parts[1] ? decodeURIComponent(parts[1]) : true;
      params[key] = value;
    }

    return params;
  }

  /**
   * I unwrap the response payload from the given response based on the reported
   * content-type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async unwrapResponseData(response: any) {
    const contentType = response.headers.has("content-type")
      ? response.headers.get("content-type")
      : "";
    if (RE_CONTENT_TYPE_JSON.test(contentType)) {
      return response.json();
    } else if (RE_CONTENT_TYPE_TEXT.test(contentType)) {
      return response.text();
    } else {
      return response.blob();
    }
  }
}
