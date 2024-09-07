import type { GetSets } from "./data/get-sets";

// options
type Options = {};

export type KnownAuthenticatedEndpoint =
  | '/v3.asmx/setCollection';

export type KnownUnauthorizedEndpoint =
  | '/v3.asmx/getSets';

export type KnownEndpoint = KnownAuthenticatedEndpoint | KnownUnauthorizedEndpoint;

// helper types for parameters
type CombineParameters<P1 extends string, P2 extends string> = `${P1}&${P2}` | `${P2}&${P1}`;

type WithParameters<Url extends string, Parameters extends string | undefined> =
  Parameters extends undefined ? Url : `${Url}?${Parameters}`;

  // helper for paginated endpoints
  type PaginationParameters = `pageNumber=${number}` | CombineParameters<`pageNumber=${number}`, `pageSize=${number}`>;
  type PaginatedEndpointUrl<Endpoint extends KnownEndpoint> = Endpoint | WithParameters<Endpoint, PaginationParameters>;

export type ApiKeyOptions = {
  apiKey: string;
};

export type AuthenticatedOptions = ApiKeyOptions &{
  userHash: string;
};

export type OptionsByEndpoint<Endpoint extends string> =
  Endpoint extends KnownAuthenticatedEndpoint ? Options & AuthenticatedOptions :
  Endpoint extends KnownUnauthorizedEndpoint ? Options & ApiKeyOptions :
  ApiKeyOptions & Partial<AuthenticatedOptions>;

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends '/v3.asmx/getSets' ? GetSets :
  unknown;

export type ValidateEndpointUrl<T extends string> = unknown extends EndpointType<T> ? 'unknown endpoint url' : T;
