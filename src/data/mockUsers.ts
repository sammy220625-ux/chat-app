import { User } from "../types";

export const mockUsers: User[] = [
  { id: "1", name: "ตัวอย่าง หนึ่ง", age: 24, avatar: "https://i.pravatar.cc/200?img=47",
    bio: "ทักมาคุยได้เลยนะ 😄", isVerified: true, isOnline: true },
  { id: "2", name: "ตัวอย่าง สอง", age: 36, avatar: "https://i.pravatar.cc/200?img=32",
    distanceKm: 19.09, bio: "อยากทักมาไม่ต้องมีข้ออ้างก็ได้",
    isVerified: true, vipLevel: 1, isOnline: true },
  { id: "3", name: "ตัวอย่าง สาม", age: 28, avatar: "https://i.pravatar.cc/200?img=45",
    distanceKm: 17.59, isVerified: true, vipLevel: 2, isOnline: false, inParty: true },
  { id: "4", name: "ตัวอย่าง สี่", age: 26, avatar: "https://i.pravatar.cc/200?img=44",
    distanceKm: 27.79, bio: "ชอบเที่ยวทะเล", isVerified: true, isOnline: true },
  { id: "5", name: "ตัวอย่าง ห้า", age: 22, avatar: "https://i.pravatar.cc/200?img=49",
    distanceKm: 4.2, bio: "เพิ่งย้ายมากรุงเทพ", isVerified: false, isOnline: false },
];
