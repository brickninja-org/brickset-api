export type GetSets = GetSets_Response;

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
  sets?: GetSets_Base[];
}

interface GetSets_Base {
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
  image: {
    thumbnailURL: string;
    imageURL: string;
  };
  bricksetURL: string;
  collection: {}
  collections: {
    ownedBy: number;
    wantedBy: number;
  };
  LEGOCom: {
    US: {
      retailPrice: number;
      dateFirstAvailable: string;
      dateLastAvailable: string;
    };
    UK: {
      retailPrice: number;
      dateFirstAvailable: string;
      dateLastAvailable: string;
    };
    CA: {
      retailPrice: number;
      dateFirstAvailable: string;
      dateLastAvailable: string;
    };
    DE: {
      retailPrice: number;
      dateFirstAvailable: string;
      dateLastAvailable: string;
    };
  };
  rating: number;
  reviewCount: number;
  packagingType: string;
  availability: string;
  instructionsCount: number;
  additionalImageCount: number;
  ageRange: {
    min: number;
    max: number;
  };
  dimensions: {
    height: number;
    width: number;
    depth: number;
    weight: number;
  };
  barcodes: {
    EAN: string;
    UPC: string;
  };
  extendedData: {};
  lastUpdated: string;
}
