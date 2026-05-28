import type { EndpointType, OptionsByEndpoint } from './endpoints';

type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

type LoginOptions = OptionsByEndpoint<'/api/v3.asmx/login'>;
type _LoginHasApiKey = Assert<HasKey<LoginOptions, 'apiKey'>>;
type _LoginHasUsername = Assert<HasKey<LoginOptions, 'username'>>;
type _LoginHasPassword = Assert<HasKey<LoginOptions, 'password'>>;

type GetSetsOptions = OptionsByEndpoint<'/api/v3.asmx/getSets?params={"query":"technic"}'>;
type _GetSetsHasParams = Assert<HasKey<GetSetsOptions, 'params'>>;
type _GetSetsHasApiKey = Assert<HasKey<GetSetsOptions, 'apiKey'>>;

type SetCollectionOptions = OptionsByEndpoint<'/api/v3.asmx/setCollection?setID=1234&params={"own":1}'>;
type _SetCollectionHasSetId = Assert<HasKey<SetCollectionOptions, 'setID'>>;
type _SetCollectionHasParams = Assert<HasKey<SetCollectionOptions, 'params'>>;
type _SetCollectionHasUserHash = Assert<HasKey<SetCollectionOptions, 'userHash'>>;

type YearsDefault = EndpointType<'/api/v3.asmx/getYears'>;
type YearsByTheme = EndpointType<'/api/v3.asmx/getYears?theme=Star Wars'>;
type _YearsShapeStable = Assert<IsEqual<YearsDefault, YearsByTheme>>;

type InstructionsBySetId = EndpointType<'/api/v3.asmx/getInstructions?setID=75192-1'>;
type InstructionsBySetNumber = EndpointType<'/api/v3.asmx/getInstructions2?setNumber=75192-1'>;
type _InstructionsShapeStable = Assert<IsEqual<InstructionsBySetId, InstructionsBySetNumber>>;

type _UnknownEndpointIsUnknown = Assert<IsEqual<EndpointType<'/api/v3.asmx/notReal'>, unknown>>;

type _CheckKeyOptions = Assert<HasKey<OptionsByEndpoint<'/api/v3.asmx/checkKey'>, 'apiKey'>>;
type _CheckUserHashOptions = Assert<HasKey<OptionsByEndpoint<'/api/v3.asmx/checkUserHash'>, 'userHash'>>;
type _GetCollectionOptions = Assert<HasKey<OptionsByEndpoint<'/api/v3.asmx/getCollection'>, 'userHash'>>;
type _GetAdditionalImagesOptions = Assert<HasKey<OptionsByEndpoint<'/api/v3.asmx/getAdditionalImages?setID=10276'>, 'setID'>>;
type _GetReviewsOptions = Assert<HasKey<OptionsByEndpoint<'/api/v3.asmx/getReviews?setID=10276'>, 'setID'>>;
type _GetSubthemesOptions = Assert<HasKey<OptionsByEndpoint<'/api/v3.asmx/getSubthemes?theme=Technic'>, 'theme'>>;
