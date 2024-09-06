import type { GetSets } from "./data/get-sets";

// options
type Options = {};

export type KnownAuthenticatedEndpoint =
  | '/v3.asmx/getSets';

export type KnownEndpoint = KnownAuthenticatedEndpoint;

export type AuthenticatedOptions = {
  accessToken: string;
};

export type OptionsByEndpoint<Endpoint extends string> =
  Endpoint extends KnownAuthenticatedEndpoint ? Options & AuthenticatedOptions :
  Partial<AuthenticatedOptions>;

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends '/v3.asmx/getSets' ? GetSets[] :
  unknown;
