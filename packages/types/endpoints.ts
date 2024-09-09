import type { GetSets } from "./data/get-sets";

export type KnownAuthenticatedEndpoint =
  | '/setCollection';

export type KnownUnauthorizedEndpoint =
  | '/api/v3.asmx/getSets'
  | '/api/v3.asmx/getThemes'
  | '/api/v3.asmx/getYears';

export type KnownEndpoint = KnownAuthenticatedEndpoint | KnownUnauthorizedEndpoint;

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

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends '/api/v3.asmx/getSets' ? { status: 'error'; message: string } | { status: 'success'; matches: number; sets: GetSets[] } :
  unknown;

export type ValidateEndpointUrl<T extends string> = unknown extends EndpointType<T> ? 'unknown endpoint url' : T;
