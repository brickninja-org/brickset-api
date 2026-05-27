export type Rating = {
  overall: number;
  parts: number;
  buildingExperience: number;
  playability: number;
  valueForMoney: number;
};

export type Reviews = {
  author: string;
  datePosted: string;
  rating: Rating;
  title: string;
  review: string;
  HTML: boolean;
};
