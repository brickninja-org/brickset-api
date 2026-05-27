import { fetchBricksetApi, type FetchBricksetApiOptions, type FetchOptions } from '@brickset-api/fetch';
import type { EndpointType, KnownEndpoint, OptionsByEndpoint } from '@brickset-api/types/endpoints';

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
  private readonly defaultOptions: Partial<FetchOptions & FetchBricksetApiOptions>;
  private readonly middlewares: BricksetClientMiddleware[];
  private readonly cache?: BricksetClientCache;

  constructor(options: BricksetClientOptions = {}) {
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

    const cacheKey = this.createCacheKey(request);

    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return cached as EndpointType<Url>;
      }
    }

    const result = await this.runMiddlewares(request, async ({ endpoint: currentEndpoint, options: currentOptions }) =>
      fetchBricksetApi(currentEndpoint, currentOptions as OptionsByEndpoint<Url> & FetchOptions & FetchBricksetApiOptions),
    );

    if (this.cache) {
      this.cache.set(cacheKey, result);
    }

    return result;
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

  private createCacheKey<Url extends KnownEndpoint | (string & {})>(request: BricksetClientRequest<Url>): string {
    return JSON.stringify({
      endpoint: request.endpoint,
      options: request.options,
    });
  }
}
