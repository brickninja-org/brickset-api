export type GetSets = GetSetsBase;

export type GetSetsOptions = {
  setID?: number;
  query?: {
    setNumber?: string;
    theme?: string;
    subtheme?: string;
  };
  theme?: string | string[];
  subtheme?: string | string[];
  setNumber?: string | string[];
  year?: number | number[];
  tag?: string;
  owned?: boolean;
  wanted?: boolean;
  updatedSince?: string;
  orderBy?: string; // TODO: define possible values
  pageSize?: number; // TODO: limit to 500
  pageNumber?: number;
  extendedData?: boolean;
};

interface GetSetsBase {
  setID: number;
  number: string;
  numberVariant: number;
  name: string;
  year: number;
  theme: string;
  themeGroup: string;
  subtheme: string;
  category: string;
  released: boolean;
  pieces?: number;
  minifigs?: number;
  image: Image;
  bricksetURL: string;
  collection: Collection;
  collections: Collections;
  LEGOCom: {
    US: LEGOComDetails;
    UK: LEGOComDetails;
    CA: LEGOComDetails;
    DE: LEGOComDetails;
  };
  rating: number;
  ratingCount: number;
  reviewCount: number;
  launchDate?: string;
  exitDate?: string;
  packagingType: string;
  availability: string;
  instructionsCount: number;
  additionalImageCount: number;
  ageRange: AgeRange;
  dimensions: Dimensions;
  modelDimensions: ModelDimensions;
  barcode: Barcodes;
  itemNumber: ItemNumbers;
  extendedData: ExtendedData;
  lastUpdated: string;
}

interface LEGOComDetails {
  retailPrice?: number;
  dateFirstAvailable?: string;
  dateLastAvailable?: string;
}

interface Dimensions {
  height?: number;
  width?: number;
  depth?: number;
  weight?: number;
}

interface ModelDimensions {
  dimension1?: number;
  dimension2?: number;
  dimension3?: number;
}

interface ExtendedData {
  notes: string;
  tags: string[];
  description: string;
}

interface Collection {
  setID?: number;
  owned?: boolean;
  wanted?: boolean;
  qtyOwned?: number;
  qtyWanted?: number;
  qtyOwnedNew?: number;
  qtyOwnedUsed?: number;
  wantedPriority?: number;
  rating?: number;
  notes: string;
  flags?: Flag[];
}

interface Collections {
  ownedBy?: number;
  wantedBy?: number;
}

interface Flag {
  flagNo: number;
  value: boolean;
}

interface Barcodes {
  EAN: string;
  UPC: string;
}

interface ItemNumbers {
  NA: string;
  EU: string;
}

interface AgeRange {
  min?: number;
  max?: number;
}

interface Image {
  thumbnailURL: string;
  imageURL: string;
}
