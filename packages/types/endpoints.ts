import type { ApiKeyUsage } from "./data/api-key-usage";
import type { FlagLabel } from "./data/flag-label";
import type { GetCollection } from "./data/get-collection";
import type { GetSets, GetSetsOptions } from "./data/get-sets";
import type { GetSubthemes } from "./data/get-subthemes";
import type { GetThemes } from "./data/get-themes";
import type { Image } from "./data/image";
import type { Instructions } from "./data/instructions";
import type { MinifigCollection } from "./data/minifig-collection";
import type { Reviews } from "./data/reviews";
import type { UserMinifigNotes } from "./data/user-minifig-notes";
import type { UserNotes } from "./data/user-notes";
import type { Years } from "./data/years";

export type KnownAuthenticatedEndpoint =
  | '/api/v3.asmx/checkUserHash'
  | '/api/v3.asmx/getCollection'
  | '/api/v3.asmx/setCollection'
  | '/api/v3.asmx/getUserNotes'
  | '/api/v3.asmx/getUserFlagLabels'
  | '/api/v3.asmx/setUserFlagLabels'
  | '/api/v3.asmx/getMinifigCollection'
  | '/api/v3.asmx/setMinifigCollection'
  | '/api/v3.asmx/getUserMinifigNotes';

export type KnownUnauthorizedEndpoint =
  | '/api/v3.asmx/checkKey'
  | '/api/v3.asmx/getKeyUsageStats'
  | '/api/v3.asmx/getSets'
  | '/api/v3.asmx/getAdditionalImages'
  | '/api/v3.asmx/getInstructions'
  | '/api/v3.asmx/getInstructions2'
  | '/api/v3.asmx/getReviews'
  | '/api/v3.asmx/getThemes'
  | '/api/v3.asmx/getSubthemes'
  | '/api/v3.asmx/getYears'
  | '/api/v3.asmx/login';

export type KnownEndpoint = KnownAuthenticatedEndpoint | KnownUnauthorizedEndpoint;

// helper types for parameters
type CombineParameters<P1 extends string, P2 extends string> = `${P1}&${P2}` | `${P2}&${P1}`;

type WithParameters<Url extends string, Parameters extends string | undefined = undefined> =
  Parameters extends undefined ? Url : `${Url}?${Parameters}`;

type WithQueryParam<Url extends KnownEndpoint, ParamName extends string> =
  Url | WithParameters<Url, `${ParamName}=${string}`>;

type WithTwoQueryParams<Url extends KnownEndpoint, P1 extends string, P2 extends string> =
  Url | WithParameters<Url, CombineParameters<`${P1}=${string}`, `${P2}=${string}`>>;

type WithParamsJson<Url extends KnownEndpoint> = WithQueryParam<Url, 'params'>;

type WithTheme<Url extends KnownEndpoint> = WithQueryParam<Url, 'theme'>;

type WithSetId<Url extends KnownEndpoint> = WithQueryParam<Url, 'setID'>;

type GetSetsUrl =
  | '/api/v3.asmx/getSets'
  | WithParamsJson<'/api/v3.asmx/getSets'>;

type SetCollectionUrl = WithTwoQueryParams<'/api/v3.asmx/setCollection', 'setID', 'params'>;

type SetMinifigCollectionUrl = WithTwoQueryParams<'/api/v3.asmx/setMinifigCollection', 'minifigNumber', 'params'>;

type GetMinifigCollectionUrl =
  | '/api/v3.asmx/getMinifigCollection'
  | WithParamsJson<'/api/v3.asmx/getMinifigCollection'>;

type SetUserFlagLabelsUrl =
  | '/api/v3.asmx/setUserFlagLabels'
  | WithParamsJson<'/api/v3.asmx/setUserFlagLabels'>;

type SetIdEndpoints = '/api/v3.asmx/getAdditionalImages' | '/api/v3.asmx/getInstructions' | '/api/v3.asmx/getReviews';
type SetIdEndpointsUrl = WithSetId<SetIdEndpoints>;

type SetNumberEndpointsUrl = WithQueryParam<'/api/v3.asmx/getInstructions2', 'setNumber'>;
type SubthemesEndpointUrl = WithTheme<'/api/v3.asmx/getSubthemes'>;
type YearsEndpointUrl = '/api/v3.asmx/getYears' | WithTheme<'/api/v3.asmx/getYears'>;

type OneOrZero = 0 | 1 | '0' | '1';

export type SetCollectionParams = {
  own?: OneOrZero;
  want?: OneOrZero;
  qtyOwned?: number;
  qtyWanted?: number;
  qtyOwnedNew?: number;
  qtyOwnedUsed?: number;
  wantedPriority?: number;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  flag1?: OneOrZero;
  flag2?: OneOrZero;
  flag3?: OneOrZero;
  flag4?: OneOrZero;
  flag5?: OneOrZero;
  flag6?: OneOrZero;
  flag7?: OneOrZero;
  flag8?: OneOrZero;
};

export type GetMinifigCollectionParams = {
  owned?: OneOrZero;
  wanted?: OneOrZero;
  query?: string;
};

export type SetMinifigCollectionParams = {
  own?: OneOrZero;
  want?: OneOrZero;
  qtyOwned?: number;
  notes?: string;
};

type Max20Chars<S extends string> =
  S extends `${infer A}${infer B}${infer C}${infer D}${infer E}${infer F}${infer G}${infer H}${infer I}${infer J}${infer K}${infer L}${infer M}${infer N}${infer O}${infer P}${infer Q}${infer R}${infer T}${infer U}${infer Rest}`
    ? never
    : S;

export type FlagLabelValue = string & { readonly __max20Chars?: unique symbol };
export type SetUserFlagLabelsParams =
  Partial<Record<'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8', FlagLabelValue>>;

export function asFlagLabel<T extends string>(value: Max20Chars<T>): FlagLabelValue {
  return value as FlagLabelValue;
}

// options
type Options = {};
type PublicOptions = Options & ApiKeyOptions;
type UserOptions = PublicOptions & AuthenticatedOptions;

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
  Endpoint extends '/api/v3.asmx/login' ? PublicOptions & LoginOptions :
  Endpoint extends GetSetsUrl ? PublicOptions & { params: GetSetsOptions; userHash?: string } :
  Endpoint extends SetCollectionUrl ? UserOptions & { setID: number; params: SetCollectionParams } :
  Endpoint extends SetMinifigCollectionUrl ? UserOptions & { minifigNumber: string; params: SetMinifigCollectionParams } :
  Endpoint extends GetMinifigCollectionUrl ? UserOptions & { params: GetMinifigCollectionParams } :
  Endpoint extends SetUserFlagLabelsUrl ? UserOptions & { params: SetUserFlagLabelsParams } :
  Endpoint extends KnownAuthenticatedEndpoint ? UserOptions :
  Endpoint extends SetIdEndpointsUrl ? PublicOptions & { setID: number } :
  Endpoint extends SetNumberEndpointsUrl ? PublicOptions & { setNumber: string } :
  Endpoint extends SubthemesEndpointUrl ? PublicOptions & { theme: string } :
  Endpoint extends YearsEndpointUrl ? PublicOptions & { theme?: string } :
  Endpoint extends KnownEndpoint ? PublicOptions :
  Partial<ApiKeyOptions>;

// Common Brickset API v3 response
export type ApiResponse<T> = { status: 'success' } & T | { status: 'error'; message: string };
type MatchesListResponse<Key extends string, Item> = ApiResponse<{ matches: number } & Record<Key, Item[]>>;

type LoginResponse = ApiResponse<{ hash: string }>;
type CheckKeyResponse = ApiResponse<Record<string, never>>;
type CheckUserHashResponse = ApiResponse<Record<string, never>>;
type GetKeyUsageStatsResponse = MatchesListResponse<'apiKeyUsage', ApiKeyUsage>;
type GetAdditionalImagesResponse = MatchesListResponse<'additionalImages', Image>;
type GetInstructionsResponse = MatchesListResponse<'instructions', Instructions>;
type GetReviewsResponse = MatchesListResponse<'reviews', Reviews>;
type SetCollectionResponse = ApiResponse<Record<string, never>>;
type GetCollectionResponse = MatchesListResponse<'sets', GetCollection>;
type GetSetsResponse = MatchesListResponse<'sets', GetSets>;
type GetThemesResponse = MatchesListResponse<'themes', GetThemes>;
type GetSubthemesResponse = MatchesListResponse<'subthemes', GetSubthemes>;
type GetYearsResponse = MatchesListResponse<'years', Years>;
type GetUserNotesResponse = MatchesListResponse<'userNotes', UserNotes>;
type GetUserFlagLabelsResponse = MatchesListResponse<'flags', FlagLabel>;
type SetUserFlagLabelsResponse = ApiResponse<Record<string, never>>;
type GetMinifigCollectionResponse = MatchesListResponse<'minifigs', MinifigCollection>;
type SetMinifigCollectionResponse = ApiResponse<Record<string, never>>;
type GetUserMinifigNotesResponse = MatchesListResponse<'userMinifigNotes', UserMinifigNotes>;

// Brickset API v3 

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends '/api/v3.asmx/checkKey' ? CheckKeyResponse :
  Url extends '/api/v3.asmx/login' ? LoginResponse :
  Url extends '/api/v3.asmx/checkUserHash' ? CheckUserHashResponse :
  Url extends '/api/v3.asmx/getKeyUsageStats' ? GetKeyUsageStatsResponse :
  Url extends WithSetId<'/api/v3.asmx/getAdditionalImages'> ? GetAdditionalImagesResponse :
  Url extends WithSetId<'/api/v3.asmx/getInstructions'> ? GetInstructionsResponse :
  Url extends SetNumberEndpointsUrl ? GetInstructionsResponse :
  Url extends WithSetId<'/api/v3.asmx/getReviews'> ? GetReviewsResponse :
  Url extends '/api/v3.asmx/getCollection' ? GetCollectionResponse :
  Url extends SetCollectionUrl ? SetCollectionResponse :
  Url extends '/api/v3.asmx/getUserNotes' ? GetUserNotesResponse :
  Url extends '/api/v3.asmx/getUserFlagLabels' ? GetUserFlagLabelsResponse :
  Url extends SetUserFlagLabelsUrl ? SetUserFlagLabelsResponse :
  Url extends GetMinifigCollectionUrl ? GetMinifigCollectionResponse :
  Url extends SetMinifigCollectionUrl ? SetMinifigCollectionResponse :
  Url extends '/api/v3.asmx/getUserMinifigNotes' ? GetUserMinifigNotesResponse :
  Url extends GetSetsUrl ? GetSetsResponse :
  Url extends '/api/v3.asmx/getThemes' ? GetThemesResponse :
  Url extends SubthemesEndpointUrl ? GetSubthemesResponse :
  Url extends YearsEndpointUrl ? GetYearsResponse :
  unknown;

export type ValidateEndpointUrl<T extends string> = unknown extends EndpointType<T> ? 'unknown endpoint url' : T;
