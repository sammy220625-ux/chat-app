import { Conversation } from "../types";

export const mockChats: Conversation[] = [
  { id: "c1", userId: "1", lastMessage: "เจ๋งมากเลย อยากเห็นจัง", time: "20:05", unread: 2 },
  { id: "c2", userId: "3", lastMessage: "เจอกันในปาร์ตี้นะ 🎉", time: "18:42", unread: 0 },
  { id: "c3", userId: "4", lastMessage: "ไปทะเลสุดสัปดาห์นี้ไหม", time: "เมื่อวาน", unread: 1 },
  { id: "c4", userId: "2", lastMessage: "ขอบคุณที่ทักมานะคะ", time: "จันทร์", unread: 0 },
];
