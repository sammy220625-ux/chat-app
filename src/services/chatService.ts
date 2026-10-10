import { supabase } from "./supabase";
import { useUnreadStore } from "../store/unreadStore";
import type { Message } from "../types";

export type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

const COLS = "id, sender_id, recipient_id, body, created_at, read_at";

export const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const pad = (n: number) => String(n).padStart(2, "0");

export const clockTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const listTime = (iso: string) => {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return clockTime(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const toMessage = (row: MessageRow, myId: string): Message => ({
  id: row.id,
  from: row.sender_id === myId ? "me" : "them",
  text: row.body,
  time: clockTime(row.created_at),
});

export async function fetchMessages(
  myId: string,
  peerId: string
): Promise<{ messages: Message[]; error: string | null }> {
  if (!isUuid(myId) || !isUuid(peerId)) {
    return { messages: [], error: "รหัสผู้ใช้ไม่ถูกต้อง" };
  }
  const { data, error } = await supabase
    .from("messages")
    .select(COLS)
    .or(
      `and(sender_id.eq.${myId},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${myId})`
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { messages: [], error: "โหลดข้อความไม่สำเร็จ" };
  const rows = (data ?? []) as MessageRow[];
  return { messages: rows.reverse().map((r) => toMessage(r, myId)), error: null };
}

export async function sendMessage(
  peerId: string,
  text: string
): Promise<{ row: MessageRow | null; error: string | null }> {
  if (!isUuid(peerId)) return { row: null, error: "รหัสผู้ใช้ไม่ถูกต้อง" };
  const { data, error } = await supabase
    .from("messages")
    .insert({ recipient_id: peerId, body: text })
    .select(COLS)
    .single();
  if (error || !data) return { row: null, error: error?.message ?? "ส่งไม่สำเร็จ" };
  return { row: data as MessageRow, error: null };
}

export async function markRead(myId: string, peerId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", myId)
    .eq("sender_id", peerId)
    .is("read_at", null);
  useUnreadStore.getState().refresh();
}
