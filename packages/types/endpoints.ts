// options
type Options = {};

export type AuthenticatedOptions = {
  accessToken: string;
};

export type OptionsByEndpoint<Endpoint extends string> =
  Partial<AuthenticatedOptions>;

// result type for endpoint
export type EndpointType<Url extends (string & {})> = unknown;
