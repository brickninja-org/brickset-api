export type GetCollection = {
  setID: number;
  owned?: boolean;
  wanted?: boolean;
  qtyOwned: number;
  qtyWanted: number;
  qtyOwnedNew: number;
  qtyOwnedUsed: number;
  wantedPriority: number;
  rating?: number;
  notes: string;
  flags: Flag[];
};

type Flag = {
  flagNo: number;
  value: boolean;
};
