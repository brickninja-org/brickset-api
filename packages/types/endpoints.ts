import type { GetSets } from "./data/get-sets";

export type KnownAuthenticatedEndpoint =
  | '/setCollection';

export type KnownUnauthorizedEndpoint =
  | '/api/v3.asmx/getSets'
  | '/api/v3.asmx/getThemes'
  | '/api/v3.asmx/getYears';

export type KnownEndpoint = KnownAuthenticatedEndpoint | KnownUnauthorizedEndpoint;

// helper types for parameters
type CombineParameters<P1 extends string, P2 extends string> = `${P1}&${P2}` | `${P2}&${P1}`;

type WithParameters<Url extends string, Parameters extends string | undefined> =
  Parameters extends undefined ? Url : `${Url}?${Parameters}`;

// helper for endpoints with parameters
type ParamsParameter = `params=${string}`;
type EndpointWithParams<Endpoint extends KnownEndpoint> = WithParameters<Endpoint, ParamsParameter>;

// options
type Options = {};

export type ApiKeyOptions = {
  apiKey: string;
};

export type AuthenticatedOptions = ApiKeyOptions &{
  userHash: string;
};

export type OptionsByEndpoint<Endpoint extends string> =
  Endpoint extends '/api/v3.asmx/getSets' ? Options & { params: string } & ApiKeyOptions :
  Endpoint extends '/api/v3.asmx/getThemes' ? Options & ApiKeyOptions :
  Endpoint extends '/api/v3.asmx/getYears' ? Options & { theme?: string } & ApiKeyOptions :
  Partial<AuthenticatedOptions & ApiKeyOptions>;

type ApiResponse<T> = {
  status: string;
  message?: string;
} & T;

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends '/api/v3.asmx/getSets' ? ApiResponse<{ sets: GetSets }> :
  unknown;

export type ValidateEndpointUrl<T extends string> = unknown extends EndpointType<T> ? 'unknown endpoint url' : T;
