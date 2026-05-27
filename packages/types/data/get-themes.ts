export type GetThemes = GetThemesBase;

export type GetThemesOptions = unknown;

export type GetThemesBase = {
  theme: string;
  setCount: number;
  subthemeCount: number;
  yearFrom: number;
  yearTo: number;
};
