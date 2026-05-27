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
  | '/api/v3.asmx/login'
  ;

export type KnownEndpoint = KnownAuthenticatedEndpoint | KnownUnauthorizedEndpoint;

// helper types for parameters
type CombineParameters<P1 extends string, P2 extends string> = `${P1}&${P2}` | `${P2}&${P1}`;

type WithParameters<Url extends string, Parameters extends string | undefined = undefined> =
  Parameters extends undefined ? Url : `${Url}?${Parameters}`;

type UrlWithParams<Url extends KnownEndpoint> =
  | WithParameters<Url, `params=${string}`>;

type WithSingleQueryParam<Url extends KnownEndpoint, ParamName extends string> =
  Url | WithParameters<Url, `${ParamName}=${string}`>;

type WithDoubleQueryParams<Url extends KnownEndpoint, P1 extends string, P2 extends string> =
  Url | WithParameters<Url, CombineParameters<`${P1}=${string}`, `${P2}=${string}`>>;

type ThemeQueryUrl<Url extends KnownEndpoint> =
  | WithParameters<Url, `theme=${string}`>;

type SetIdQueryUrl<Url extends KnownEndpoint> =
  | WithParameters<Url, `setID=${string}`>;

type SetNumberQueryUrl<Url extends KnownEndpoint> =
  | WithParameters<Url, `setNumber=${string}`>;

type GetSetsUrl =
  | '/api/v3.asmx/getSets'
  | UrlWithParams<'/api/v3.asmx/getSets'>;

type SetCollectionUrl = WithDoubleQueryParams<'/api/v3.asmx/setCollection', 'setID', 'params'>;

type SetMinifigCollectionUrl = WithDoubleQueryParams<'/api/v3.asmx/setMinifigCollection', 'minifigNumber', 'params'>;

type GetMinifigCollectionUrl =
  | '/api/v3.asmx/getMinifigCollection'
  | UrlWithParams<'/api/v3.asmx/getMinifigCollection'>;

type SetUserFlagLabelsUrl =
  | '/api/v3.asmx/setUserFlagLabels'
  | UrlWithParams<'/api/v3.asmx/setUserFlagLabels'>;

type SetIdEndpoints = '/api/v3.asmx/getAdditionalImages' | '/api/v3.asmx/getInstructions' | '/api/v3.asmx/getReviews';
type SetIdEndpointsUrl = WithSingleQueryParam<SetIdEndpoints, 'setID'>;

type SetNumberEndpointsUrl = WithSingleQueryParam<'/api/v3.asmx/getInstructions2', 'setNumber'>;
type SubthemesEndpointUrl = WithSingleQueryParam<'/api/v3.asmx/getSubthemes', 'theme'>;
type YearsEndpointUrl = '/api/v3.asmx/getYears' | ThemeQueryUrl<'/api/v3.asmx/getYears'>;

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

export type SetUserFlagLabelsParams = Partial<Record<'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8', string>>;

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
  Endpoint extends KnownAuthenticatedEndpoint ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends GetSetsUrl ? Options & ApiKeyOptions & { params: GetSetsOptions; userHash?: string } :
  Endpoint extends SetCollectionUrl ? Options & ApiKeyOptions & AuthenticatedOptions & { setID: number; params: SetCollectionParams } :
  Endpoint extends SetMinifigCollectionUrl ? Options & ApiKeyOptions & AuthenticatedOptions & { minifigNumber: string; params: SetMinifigCollectionParams } :
  Endpoint extends GetMinifigCollectionUrl ? Options & ApiKeyOptions & AuthenticatedOptions & { params: GetMinifigCollectionParams } :
  Endpoint extends SetUserFlagLabelsUrl ? Options & ApiKeyOptions & AuthenticatedOptions & { params: SetUserFlagLabelsParams } :
  Endpoint extends SetIdEndpointsUrl ? Options & ApiKeyOptions & { setID: number } :
  Endpoint extends SetNumberEndpointsUrl ? Options & ApiKeyOptions & { setNumber: string } :
  Endpoint extends SubthemesEndpointUrl ? Options & ApiKeyOptions & { theme: string } :
  Endpoint extends ThemeQueryUrl<'/api/v3.asmx/getYears'> ? Options & ApiKeyOptions & { theme: string } :
  Endpoint extends YearsEndpointUrl ? Options & ApiKeyOptions :
  Endpoint extends KnownEndpoint ? Options & ApiKeyOptions :
  Partial<ApiKeyOptions>;

// Common Brickset API v3 response
export type ApiResponse<T> = { status: 'success' } & T | { status: 'error'; message: string };

type LoginResponse = ApiResponse<{ hash: string }>;
type CheckKeyResponse = ApiResponse<Record<string, never>>;
type CheckUserHashResponse = ApiResponse<Record<string, never>>;
type GetKeyUsageStatsResponse = ApiResponse<{ matches: number; apiKeyUsage: ApiKeyUsage[] }>;
type GetAdditionalImagesResponse = ApiResponse<{ matches: number; additionalImages: Image[] }>;
type GetInstructionsResponse = ApiResponse<{ matches: number; instructions: Instructions[] }>;
type GetReviewsResponse = ApiResponse<{ matches: number; reviews: Reviews[] }>;
type SetCollectionResponse = ApiResponse<Record<string, never>>;
type GetCollectionResponse = ApiResponse<{ matches: number; sets: GetCollection[] }>;
type GetSetsResponse = ApiResponse<{ matches: number; sets: GetSets[] }>;
type GetThemesResponse = ApiResponse<{ matches: number; themes: GetThemes[] }>;
type GetSubthemesResponse = ApiResponse<{ matches: number; subthemes: GetSubthemes[] }>;
type GetYearsResponse = ApiResponse<{ matches: number; years: Years[] }>;
type GetUserNotesResponse = ApiResponse<{ matches: number; userNotes: UserNotes[] }>;
type GetUserFlagLabelsResponse = ApiResponse<{ matches: number; flags: FlagLabel[] }>;
type SetUserFlagLabelsResponse = ApiResponse<Record<string, never>>;
type GetMinifigCollectionResponse = ApiResponse<{ matches: number; minifigs: MinifigCollection[] }>;
type SetMinifigCollectionResponse = ApiResponse<Record<string, never>>;
type GetUserMinifigNotesResponse = ApiResponse<{ matches: number; userMinifigNotes: UserMinifigNotes[] }>;

// Brickset API v3 

// result type for endpoint
export type EndpointType<Url extends KnownEndpoint | (string & {})> =
  Url extends '/api/v3.asmx/checkKey' ? CheckKeyResponse :
  Url extends '/api/v3.asmx/login' ? LoginResponse :
  Url extends '/api/v3.asmx/checkUserHash' ? CheckUserHashResponse :
  Url extends '/api/v3.asmx/getKeyUsageStats' ? GetKeyUsageStatsResponse :
  Url extends WithSingleQueryParam<'/api/v3.asmx/getAdditionalImages', 'setID'> ? GetAdditionalImagesResponse :
  Url extends WithSingleQueryParam<'/api/v3.asmx/getInstructions', 'setID'> ? GetInstructionsResponse :
  Url extends SetNumberEndpointsUrl ? GetInstructionsResponse :
  Url extends WithSingleQueryParam<'/api/v3.asmx/getReviews', 'setID'> ? GetReviewsResponse :
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
