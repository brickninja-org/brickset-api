import type { GetSets } from "./data/get-sets";
import type { GetThemes } from "./data/get-themes";

export type KnownAuthenticatedEndpoint =
  | '/api/v3.asmx/setCollection';

export type KnownUnauthorizedEndpoint =
  | '/api/v3.asmx/getSets'
  | '/api/v3.asmx/getThemes'
  | '/api/v3.asmx/login'
  | '/api/v3.asmx/checkUserHash';

export type KnownEndpoint = KnownAuthenticatedEndpoint | KnownUnauthorizedEndpoint;

// helper types for parameters
type CombineParameters<P1 extends string, P2 extends string> = `${P1}&${P2}` | `${P2}&${P1}`;

type WithParameters<Url extends string, Parameters extends string | undefined = undefined> =
  Parameters extends undefined ? Url : `${Url}?${Parameters}`;

type UrlWithParams<Url extends KnownEndpoint> =
  | WithParameters<Url, `params=${string}`>;

type GetSetsUrl =
  | '/api/v3.asmx/getSets'
  | UrlWithParams<'/api/v3.asmx/getSets'>
  | WithParameters<'/api/v3.asmx/getSets', string>;

type SetCollectionUrl =
  | WithParameters<'/api/v3.asmx/setCollection', `setID=${string}&params=${string}`>
  | WithParameters<'/api/v3.asmx/setCollection', `params=${string}&setID=${string}`>;

// options
type Options = {};

export type ApiKeyOptions = {
  apiKey: string;
};

export type AuthenticatedOptions = {
  userHash: string;
};

export type LoginOptions = {
  username: string;
  password: string;
};

export type OptionsByEndpoint<Endpoint extends string> =
  Endpoint extends '/api/v3.asmx/login' ? Options & ApiKeyOptions & LoginOptions :
  Endpoint extends '/api/v3.asmx/checkUserHash' ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends GetSetsUrl ? Options & ApiKeyOptions :
  Endpoint extends SetCollectionUrl ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends KnownAuthenticatedEndpoint ? Partial<ApiKeyOptions & AuthenticatedOptions> :
  Endpoint extends KnownEndpoint ? Options & ApiKeyOptions :
  Partial<ApiKeyOptions>;

// Common Brickset API v3 response
export type ApiResponse<T> = { status: 'success' } & T | { status: 'error'; message: string };

type LoginResponse = ApiResponse<{ hash: string }>;
type CheckUserHashResponse = ApiResponse<Record<string, never>>;
type SetCollectionResponse = ApiResponse<Record<string, never>>;
type GetSetsResponse = ApiResponse<{ matches: number; sets: GetSets[] }>;
type GetThemesResponse = ApiResponse<{ matches: number; themes: GetThemes[] }>;

// Brickset API v3 

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends '/api/v3.asmx/login' ? LoginResponse :
  Url extends '/api/v3.asmx/checkUserHash' ? CheckUserHashResponse :
  Url extends SetCollectionUrl ? SetCollectionResponse :
  Url extends GetSetsUrl ? GetSetsResponse :
  Url extends '/api/v3.asmx/getThemes' ? GetThemesResponse :
  unknown;

export type ValidateEndpointUrl<T extends string> = unknown extends EndpointType<T> ? 'unknown endpoint url' : T;
