import { BricksetApiError, fetchBricksetApi, type FetchBricksetApiOptions, type FetchOptions } from '@brickset-api/fetch';
import type { EndpointType, KnownEndpoint, OptionsByEndpoint, SetCollectionParams } from '@brickset-api/types/endpoints';
import type { GetSetsOptions } from '@brickset-api/types/data/get-sets';

export type BricksetClientRequest<Url extends KnownEndpoint | (string & {})> = {
  endpoint: Url;
  options: BricksetClientRequestOptions<Url>;
};

export type BricksetClientRequestOptions<Url extends string> =
  FetchOptions &
  FetchBricksetApiOptions &
  OptionsByEndpoint<Url>;

export type BricksetClientMiddleware = <Url extends KnownEndpoint | (string & {})>(
  request: BricksetClientRequest<Url>,
  next: (request: BricksetClientRequest<Url>) => Promise<EndpointType<Url>>,
) => Promise<EndpointType<Url>>;

export type BricksetClientOptions = {
  auth?: {
    apiKey: string;
    userHash?: string;
  };
  /**
   * When true (default), thrown errors are sanitized to avoid leaking sensitive request details.
   */
  sanitizeErrors?: boolean;
  /**
   * Controls if a request may be cached. Defaults to safe behavior:
   * only cache read-like endpoints and never cache auth/mutation calls.
   */
  canCache?: <Url extends KnownEndpoint | (string & {})>(request: BricksetClientRequest<Url>) => boolean;
  defaultOptions?: Partial<FetchOptions & FetchBricksetApiOptions>;
  middlewares?: BricksetClientMiddleware[];
  cache?: BricksetClientCache;
};

export interface BricksetClientCache {
  get(key: string): unknown | undefined;
  set(key: string, value: unknown): void;
}

export class InMemoryBricksetClientCache implements BricksetClientCache {
  private readonly map = new Map<string, unknown>();

  get(key: string): unknown | undefined {
    return this.map.get(key);
  }

  set(key: string, value: unknown): void {
    this.map.set(key, value);
  }
}

export class BricksetApiClient {
  private readonly auth?: BricksetClientOptions['auth'];
  private readonly sanitizeErrors: boolean;
  private readonly canCache: <Url extends KnownEndpoint | (string & {})>(request: BricksetClientRequest<Url>) => boolean;
  private readonly defaultOptions: Partial<FetchOptions & FetchBricksetApiOptions>;
  private readonly middlewares: BricksetClientMiddleware[];
  private readonly cache?: BricksetClientCache;

  constructor(options: BricksetClientOptions = {}) {
    this.auth = options.auth;
    this.sanitizeErrors = options.sanitizeErrors ?? true;
    this.canCache = options.canCache ?? defaultCanCache;
    this.defaultOptions = options.defaultOptions ?? {};
    this.middlewares = options.middlewares ?? [];
    this.cache = options.cache;
  }

  async request<Url extends KnownEndpoint | (string & {})>(
    endpoint: Url,
    options: BricksetClientRequestOptions<Url>,
  ): Promise<EndpointType<Url>> {
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
    } as BricksetClientRequestOptions<Url>;

    const request: BricksetClientRequest<Url> = {
      endpoint,
      options: mergedOptions,
    };

    const cacheable = this.cache ? this.canCache(request) : false;
    const cacheKey = cacheable ? this.createCacheKey(request) : undefined;

    if (this.cache && cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return cached as EndpointType<Url>;
      }
    }

    let result: EndpointType<Url>;
    try {
      result = await this.runMiddlewares(request, async ({ endpoint: currentEndpoint, options: currentOptions }) =>
        fetchBricksetApi(currentEndpoint, currentOptions as OptionsByEndpoint<Url> & FetchOptions & FetchBricksetApiOptions),
      );
    } catch (error) {
      if (!this.sanitizeErrors) {
        throw error;
      }
      throw sanitizeClientError(error);
    }

    if (this.cache && cacheKey) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  async login(
    username: string,
    password: string,
    options: FetchOptions & FetchBricksetApiOptions & { apiKey?: string } = {},
  ): Promise<EndpointType<'/api/v3.asmx/login'>> {
    const { apiKey, ...rest } = options;
    return this.request('/api/v3.asmx/login', {
      ...rest,
      apiKey: this.resolveApiKey(apiKey),
      username,
      password,
    });
  }

  async getSets(
    params: GetSetsOptions,
    options: FetchOptions & FetchBricksetApiOptions & { apiKey?: string; userHash?: string } = {},
  ): Promise<EndpointType<'/api/v3.asmx/getSets'>> {
    const { apiKey, userHash, ...rest } = options;
    const resolvedUserHash = userHash ?? this.auth?.userHash;

    return this.request('/api/v3.asmx/getSets', {
      ...rest,
      apiKey: this.resolveApiKey(apiKey),
      ...(resolvedUserHash ? { userHash: resolvedUserHash } : {}),
      params,
    });
  }

  async getThemes(
    options: FetchOptions & FetchBricksetApiOptions & { apiKey?: string } = {},
  ): Promise<EndpointType<'/api/v3.asmx/getThemes'>> {
    const { apiKey, ...rest } = options;
    return this.request('/api/v3.asmx/getThemes', {
      ...rest,
      apiKey: this.resolveApiKey(apiKey),
    });
  }

  async getSubthemes(
    theme: string,
    options: FetchOptions & FetchBricksetApiOptions & { apiKey?: string } = {},
  ): Promise<EndpointType<'/api/v3.asmx/getSubthemes'>> {
    const { apiKey, ...rest } = options;
    return this.request('/api/v3.asmx/getSubthemes', {
      ...rest,
      apiKey: this.resolveApiKey(apiKey),
      theme,
    });
  }

  async getYears(
    theme?: string,
    options: FetchOptions & FetchBricksetApiOptions & { apiKey?: string } = {},
  ): Promise<EndpointType<'/api/v3.asmx/getYears'>> {
    const { apiKey, ...rest } = options;
    const resolvedApiKey = this.resolveApiKey(apiKey);
    if (theme) {
      return this.request('/api/v3.asmx/getYears', {
        ...rest,
        apiKey: resolvedApiKey,
        theme,
      });
    }
    return this.request('/api/v3.asmx/getYears', {
      ...rest,
      apiKey: resolvedApiKey,
    });
  }

  async getCollection(
    options: FetchOptions & FetchBricksetApiOptions & { apiKey?: string; userHash?: string } = {},
  ): Promise<EndpointType<'/api/v3.asmx/getCollection'>> {
    const { apiKey, userHash, ...rest } = options;
    return this.request('/api/v3.asmx/getCollection', {
      ...rest,
      apiKey: this.resolveApiKey(apiKey),
      userHash: this.resolveUserHash(userHash),
    });
  }

  async setCollection(
    setID: number,
    params: SetCollectionParams,
    options: FetchOptions & FetchBricksetApiOptions & { apiKey?: string; userHash?: string } = {},
  ): Promise<EndpointType<'/api/v3.asmx/setCollection'>> {
    const { apiKey, userHash, ...rest } = options;
    return this.request('/api/v3.asmx/setCollection', {
      ...rest,
      apiKey: this.resolveApiKey(apiKey),
      userHash: this.resolveUserHash(userHash),
      setID,
      params,
    });
  }

  private runMiddlewares<Url extends KnownEndpoint | (string & {})>(
    request: BricksetClientRequest<Url>,
    last: (request: BricksetClientRequest<Url>) => Promise<EndpointType<Url>>,
  ): Promise<EndpointType<Url>> {
    const chain = this.middlewares.reduceRight(
      (next, middleware) => {
        return (currentRequest: BricksetClientRequest<Url>) => middleware(currentRequest, next);
      },
      last,
    );

    return chain(request);
  }

  private resolveApiKey(apiKey?: string): string {
    const resolved = apiKey ?? this.auth?.apiKey;
    if (!resolved) {
      throw new Error('No apiKey provided. Pass apiKey in request options or configure client auth.apiKey.');
    }
    return resolved;
  }

  private resolveUserHash(userHash?: string): string {
    const resolved = userHash ?? this.auth?.userHash;
    if (!resolved) {
      throw new Error('No userHash provided. Pass userHash in request options or configure client auth.userHash.');
    }
    return resolved;
  }

  private createCacheKey<Url extends KnownEndpoint | (string & {})>(request: BricksetClientRequest<Url>): string {
    const sanitized = sanitizeForCache(request.options);
    return JSON.stringify({
      endpoint: request.endpoint,
      options: sanitized,
    });
  }
}

export class BricksetClientError extends Error {
  constructor(
    message: string,
    public causeError?: unknown,
  ) {
    super(message);
    this.name = 'BricksetClientError';
  }
}

const NEVER_CACHE_ENDPOINTS = new Set([
  '/api/v3.asmx/login',
  '/api/v3.asmx/checkUserHash',
  '/api/v3.asmx/setCollection',
  '/api/v3.asmx/setMinifigCollection',
  '/api/v3.asmx/setUserFlagLabels',
]);

function defaultCanCache<Url extends KnownEndpoint | (string & {})>(request: BricksetClientRequest<Url>): boolean {
  return !NEVER_CACHE_ENDPOINTS.has(String(request.endpoint));
}

function sanitizeForCache(options: Record<string, unknown>): Record<string, unknown> {
  const sensitive = new Set(['apiKey', 'userHash', 'password', 'username']);
  const copy: Record<string, unknown> = {};
  for (const key in options) {
    if (!Object.prototype.hasOwnProperty.call(options, key)) continue;
    const value = options[key];
    copy[key] = sensitive.has(key) ? '[REDACTED]' : value;
  }
  return copy;
}

function sanitizeClientError(error: unknown): BricksetClientError {
  if (error instanceof BricksetApiError) {
    return new BricksetClientError(
      `Brickset API request failed with status ${error.response.status} ${error.response.statusText}.`,
      error,
    );
  }

  if (error instanceof Error) {
    return new BricksetClientError('Brickset API request failed.', error);
  }

  return new BricksetClientError('Brickset API request failed.');
}
