export type User = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  bio?: string;
  distanceKm?: number;
  isVerified: boolean;
  vipLevel?: number;
  isOnline: boolean;
  inParty?: boolean;
};

export type Category = {
  id: string;
  label: string;
  emoji: string;
  colors: [string, string];
};
