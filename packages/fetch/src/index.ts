import type {
  AuthenticatedOptions,
  ApiKeyOptions,
  EndpointType,
  KnownEndpoint,
  OptionsByEndpoint,
} from '@brickset-api/types/endpoints';

type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

// if OptionsByEndpoint<Url> has no required keys, make the options parameter optional
type Args<Url extends string> = RequiredKeys<OptionsByEndpoint<Url>> extends never
  ? [endpoint: Url, options?: FetchBricksetApiOptions & OptionsByEndpoint<Url> & FetchOptions]
  : [endpoint: Url, options: FetchBricksetApiOptions & OptionsByEndpoint<Url> & FetchOptions]

export async function fetchBricksetApi<
  Url extends KnownEndpoint | (string & {}),
>(
  ...[endpoint, options]: Args<Url>
): Promise<EndpointType<Url>> {
  const resolvedOptions = (options ?? {}) as FetchBricksetApiOptions & OptionsByEndpoint<Url> & FetchOptions;
  const url = new URL(endpoint, 'https://brickset.com');

  if (hasApiKey(resolvedOptions)) {
    url.searchParams.set('apiKey', resolvedOptions.apiKey);
  }

  if (hasUserHash(resolvedOptions)) {
    url.searchParams.set('userHash', resolvedOptions.userHash);
  }

  if ('setID' in resolvedOptions && resolvedOptions.setID !== undefined) {
    url.searchParams.set('setID', String(resolvedOptions.setID));
  }

  if ('setNumber' in resolvedOptions && typeof resolvedOptions.setNumber === 'string') {
    url.searchParams.set('setNumber', resolvedOptions.setNumber);
  }

  if ('minifigNumber' in resolvedOptions && typeof resolvedOptions.minifigNumber === 'string') {
    url.searchParams.set('minifigNumber', resolvedOptions.minifigNumber);
  }

  if ('theme' in resolvedOptions && typeof resolvedOptions.theme === 'string') {
    url.searchParams.set('theme', resolvedOptions.theme);
  }

  if ('params' in resolvedOptions && resolvedOptions.params !== undefined) {
    const paramsValue = typeof resolvedOptions.params === 'string'
      ? resolvedOptions.params
      : JSON.stringify(resolvedOptions.params);
    url.searchParams.set('params', paramsValue);
  }

  // build request
  let request = new Request(url, {
    redirect: 'manual',

    // set signal and cache from options
    signal: resolvedOptions.signal,
    cache: resolvedOptions.cache,
  });

  // if there is onRequest handler registered, let it modify the request
  if (resolvedOptions.onRequest) {
    request = await resolvedOptions.onRequest(request);

    if (!(request instanceof Request)) {
      throw new Error('onRequest handler must return a Request instance');
    }
  }

  // call the API
  const response = await fetch(request);

  // call onResponse handler
  await resolvedOptions.onResponse?.(response);

  // check if the response is json (`application/json; charset=utf-8`)
  const isJson = true; // response.headers.get('content-type').startsWith('application/json');

  // censor user hash in url to not leak it in error messages
  let erroredUrl = hasUserHash(resolvedOptions) && resolvedOptions.userHash !== ''
    ? url.toString().replace(resolvedOptions.userHash, '***')
    : url.toString();
  
  if (hasApiKey(resolvedOptions)) {
    erroredUrl = erroredUrl.replace(resolvedOptions.apiKey, '***');
  }

  // check if the response is an error
  if (!response.ok) {
    if (isJson) {
      const error: unknown = await response.json();

      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        throw new BricksetApiError(`The Brickset API call to '${erroredUrl}' returned ${response.status} ${response.statusText}: ${error.message}.`, response);
      }
    }

    // otherwise just throw error with the status code
    throw new BricksetApiError(`The Brickset API call to '${erroredUrl}' returned ${response.status} ${response.statusText}.`, response);
  }

  // if the response is not JSON, throw an error
  if (!isJson) {
    throw new BricksetApiError(`The Brickset API call to '${erroredUrl}' did not respond with a JSON response.`, response);
  }

  // parse the JSON response
  const json = await response.json();

  if (json.status === 'error') {
    throw new BricksetApiError(`The Brickset API call to '${erroredUrl}' returned an error: ${json.message}`, response);
  }

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

function hasApiKey(options: OptionsByEndpoint<any>): options is ApiKeyOptions {
  return 'apiKey' in options;
}

function hasUserHash(options: OptionsByEndpoint<any>): options is ApiKeyOptions & AuthenticatedOptions {
  return 'userHash' in options;
}
