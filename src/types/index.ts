export type User = {
  id: string;
  name: string;
  age?: number;
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

export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  userId: string;
  lastMessage: string;
  time: string;
  unread: number;
};
