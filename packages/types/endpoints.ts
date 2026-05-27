import type { ApiKeyUsage } from "./data/api-key-usage";
import type { FlagLabel } from "./data/flag-label";
import type { GetCollection } from "./data/get-collection";
import type { GetSets } from "./data/get-sets";
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

type GetSetsUrl =
  | UrlWithParams<'/api/v3.asmx/getSets'>;

type ThemeQueryUrl<Url extends KnownEndpoint> =
  | WithParameters<Url, `theme=${string}`>;

type SetIdQueryUrl<Url extends KnownEndpoint> =
  | WithParameters<Url, `setID=${string}`>;

type SetNumberQueryUrl<Url extends KnownEndpoint> =
  | WithParameters<Url, `setNumber=${string}`>;

type SetCollectionUrl =
  | WithParameters<'/api/v3.asmx/setCollection', CombineParameters<`setID=${string}`, `params=${string}`>>;

type SetMinifigCollectionUrl =
  | WithParameters<'/api/v3.asmx/setMinifigCollection', CombineParameters<`minifigNumber=${string}`, `params=${string}`>>;

type GetMinifigCollectionUrl =
  | UrlWithParams<'/api/v3.asmx/getMinifigCollection'>;

type SetUserFlagLabelsUrl =
  | UrlWithParams<'/api/v3.asmx/setUserFlagLabels'>;

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
  Endpoint extends GetSetsUrl ? Options & ApiKeyOptions :
  Endpoint extends SetCollectionUrl ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends SetMinifigCollectionUrl ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends GetMinifigCollectionUrl ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends SetUserFlagLabelsUrl ? Options & ApiKeyOptions & AuthenticatedOptions :
  Endpoint extends SetIdQueryUrl<'/api/v3.asmx/getAdditionalImages'> ? Options & ApiKeyOptions :
  Endpoint extends SetIdQueryUrl<'/api/v3.asmx/getInstructions'> ? Options & ApiKeyOptions :
  Endpoint extends SetIdQueryUrl<'/api/v3.asmx/getReviews'> ? Options & ApiKeyOptions :
  Endpoint extends SetNumberQueryUrl<'/api/v3.asmx/getInstructions2'> ? Options & ApiKeyOptions :
  Endpoint extends ThemeQueryUrl<'/api/v3.asmx/getSubthemes'> ? Options & ApiKeyOptions :
  Endpoint extends ThemeQueryUrl<'/api/v3.asmx/getYears'> ? Options & ApiKeyOptions :
  Endpoint extends '/api/v3.asmx/getYears' ? Options & ApiKeyOptions :
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
  Url extends SetIdQueryUrl<'/api/v3.asmx/getAdditionalImages'> ? GetAdditionalImagesResponse :
  Url extends SetIdQueryUrl<'/api/v3.asmx/getInstructions'> ? GetInstructionsResponse :
  Url extends SetNumberQueryUrl<'/api/v3.asmx/getInstructions2'> ? GetInstructionsResponse :
  Url extends SetIdQueryUrl<'/api/v3.asmx/getReviews'> ? GetReviewsResponse :
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
  Url extends ThemeQueryUrl<'/api/v3.asmx/getSubthemes'> ? GetSubthemesResponse :
  Url extends '/api/v3.asmx/getYears' ? GetYearsResponse :
  Url extends ThemeQueryUrl<'/api/v3.asmx/getYears'> ? GetYearsResponse :
  unknown;

export type ValidateEndpointUrl<T extends string> = unknown extends EndpointType<T> ? 'unknown endpoint url' : T;
