import { type FetchBricksetApiOptions, type FetchOptions } from '@brickset-api/fetch';
import type { EndpointType, KnownEndpoint, OptionsByEndpoint } from '@brickset-api/types/endpoints';
export type BricksetClientRequest<Url extends KnownEndpoint | (string & {})> = {
    endpoint: Url;
    options: BricksetClientRequestOptions<Url>;
};
export type BricksetClientRequestOptions<Url extends string> = FetchOptions & FetchBricksetApiOptions & OptionsByEndpoint<Url>;
export type BricksetClientMiddleware = <Url extends KnownEndpoint | (string & {})>(request: BricksetClientRequest<Url>, next: (request: BricksetClientRequest<Url>) => Promise<EndpointType<Url>>) => Promise<EndpointType<Url>>;
export type BricksetClientOptions = {
    defaultOptions?: Partial<FetchOptions & FetchBricksetApiOptions>;
    middlewares?: BricksetClientMiddleware[];
    cache?: BricksetClientCache;
};
export interface BricksetClientCache {
    get(key: string): unknown | undefined;
    set(key: string, value: unknown): void;
}
export declare class InMemoryBricksetClientCache implements BricksetClientCache {
    private readonly map;
    get(key: string): unknown | undefined;
    set(key: string, value: unknown): void;
}
export declare class BricksetApiClient {
    private readonly defaultOptions;
    private readonly middlewares;
    private readonly cache?;
    constructor(options?: BricksetClientOptions);
    request<Url extends KnownEndpoint | (string & {})>(endpoint: Url, options: BricksetClientRequestOptions<Url>): Promise<EndpointType<Url>>;
    private runMiddlewares;
    private createCacheKey;
}
