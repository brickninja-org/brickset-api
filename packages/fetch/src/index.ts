import { AuthenticatedOptions, OptionsByEndpoint, type EndpointType } from '@brickset-api/types/endpoints';

type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

// if OptionsByEndpoint<Url> has no required keys, make the options parameter optional
type Args<Url extends string> = RequiredKeys<OptionsByEndpoint<Url>> extends never
  ? [endpoint: Url, options?: FetchBricksetApiOptions & OptionsByEndpoint<Url> & FetchOptions]
  : [endpoint: Url, options: FetchBricksetApiOptions & OptionsByEndpoint<Url> & FetchOptions]


  export async function fetchBricksetApi<
  Url extends (string & {}),
>(
  ...[endpoint, options]: Args<Url>
): Promise<EndpointType<Url>> {
  const url = new URL(endpoint, 'https://brickset.com/api/v3.asmx');

  // build request
  let request = new Request(url, {
    // set signal and cache from options
    signal: options.signal,
    cache: options.cache,
  });

  // if there is onRequest handler registered, let it modify the request
  if (options.onRequest) {
    request = await options.onRequest(request);

    if (!(request instanceof Request)) {
      throw new Error('onRequest handler must return a Request instance');
    }
  }

  // call the API
  const response = await fetch(request);

  // call onResponse handler
  await options.onResponse?.(response);

  // check if the response is json (`application/json; charset=utf-8`)
  const isJson = response.headers.get('content-type')?.startsWith('application/json');

  // censor access token in url to not leak it in error messages
  const erroredUrl = hasAccessToken(options)
    ? url.toString().replace(options.accessToken, '***')
    : url.toString();

  // check if the resonse is an error
  if (!response.ok) {
    if (isJson) {
      const error: unknown = await response.json();

      if (typeof error === 'object' && 'text' in error && typeof error.text === 'string') {
        throw new BricksetApiError(`The Brickset API call to '${erroredUrl}' returned ${response.status} ${response.statusText}: ${error.text}.`, response);
      }
    }

    // otherwise just throw error with the statu code
    throw new BricksetApiError(`The Brickset API call to '${erroredUrl}' returned ${response.status} ${response.statusText}.`, response);
  }

  // if the response is not JSON, throw an error
  if (!isJson) {
    throw new BricksetApiError(`The Brickset API call to '${erroredUrl}' did not respond with a JSON response.`, response);
  }

  // parse the JSON response
  const json = await response.json();

  // TODO: catch more errors

  return json;
}

export type FetchBricksetApiOptions = {
  /** onRequest handler allows to modify the request made to the Brickset API. */
  onRequest?: (request: Request) => Request | Promise<Request>;

  /**
   * onResponse handler. Called for all responses, successful or not.
   * Make sure to clone the response in case of consuming the body.
   */
  onResponse?: (response: Response) => void | Promise<void>;
};

export type FetchOptions = {
  /** @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal */
  signal?: AbortSignal,

  /** @see https://developer.mozilla.org/en-US/docs/Web/API/Request/cache */
  cache?: RequestCache,
}

export class BricksetApiError extends Error {
  constructor(message: string, public response: Response) {
    super(message);
    this.name = 'BricksetApiError';
  }
}

function hasAccessToken(options: OptionsByEndpoint<any>): options is AuthenticatedOptions {
  return 'accessToken' in options;
}
