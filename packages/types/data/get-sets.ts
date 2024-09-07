export type GetSets = GetSets_Response;

export type Item = ItemBase;

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

interface GetSets_Response {
  message?: string;
  status: string;
  matches?: number;
  sets?: ItemBase[];
}

interface ItemBase {
  setID: number;
  number: string;
  numberVariant: string;
  name: string;
  year: number;
  theme: string;
  themeGroup: string;
  subtheme: string;
  category: string;
  released: boolean;
  pieces: number;
  minifigs: number;
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
  reviewCount: number;
  packagingType: string;
  availability: string;
  instructionsCount: number;
  additionalImageCount: number;
  ageRange: AgeRange;
  dimensions: Dimensions;
  barcodes: Barcodes;
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

interface ExtendedData {
  notes: string;
  tags: string[];
  description: string;
}

interface Collection {
  owned?: boolean;
  wanted?: boolean;
  qtyOwned?: number;
  rating?: number;
  notes: string;
}

interface Collections {
  ownedBy?: number;
  wantedBy?: number;
}

interface Barcodes {
  EAN: string;
  UPC: string;
}

interface AgeRange {
  min?: number;
  max?: number;
}

interface Image {
  thumbnailURL: string;
  imageURL: string;
}
