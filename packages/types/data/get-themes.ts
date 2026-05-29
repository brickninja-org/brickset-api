export type GetThemes = GetThemesBase;

export type GetThemesOptions = Record<string, never>;

export type GetThemesBase = {
  theme: string;
  setCount: number;
  subthemeCount: number;
  yearFrom: number;
  yearTo: number;
};
