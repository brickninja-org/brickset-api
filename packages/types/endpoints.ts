import type { GetSets } from "./data/get-sets";
import type { GetThemes } from "./data/get-themes";

export type KnownAuthenticatedEndpoint =
  | '/setCollection';

export type KnownUnauthorizedEndpoint =
  | '/api/v3.asmx/getSets'
  | '/api/v3.asmx/getThemes';

export type KnownEndpoint = KnownAuthenticatedEndpoint | KnownUnauthorizedEndpoint;

// helper types for parameters
type CombineParameters<P1 extends string, P2 extends string> = `${P1}&${P2}` | `${P2}&${P1}`;

type WithParameters<Url extends string, Parameters extends string | undefined = undefined> =
  Parameters extends undefined ? Url : `${Url}?${Parameters}`;

type UrlWithParams<Url extends KnownEndpoint> =
  | WithParameters<Url, `params=${string}`>;

// options
type Options = {};

export type ApiKeyOptions = {
  apiKey: string;
};

export type AuthenticatedOptions = {
  userHash: string;
};

export type OptionsByEndpoint<Endpoint extends string> =
  Endpoint extends UrlWithParams<'/api/v3.asmx/getSets'> ? Options & ApiKeyOptions :
  Endpoint extends KnownAuthenticatedEndpoint ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends KnownEndpoint ? Options & ApiKeyOptions :
  Partial<ApiKeyOptions>;

// Common Brickset API v3 response
export type ApiResponse<T> = { status: 'success' } & T | { status: 'error'; message: string };

// Brickset API v3 

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends UrlWithParams<'/api/v3.asmx/getSets'> ? ApiResponse<{ matches: number; sets: GetSets[] }> :
  Url extends '/api/v3.asmx/getThemes' ? ApiResponse<{ matches: number, themes: GetThemes[] }> :
  unknown;

export type ValidateEndpointUrl<T extends string> = unknown extends EndpointType<T> ? 'unknown endpoint url' : T;
