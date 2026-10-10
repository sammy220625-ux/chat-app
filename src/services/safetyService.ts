import { supabase } from "./supabase";
import { isUuid } from "./chatService";

export const REPORT_REASONS = [
  { code: "spam", label: "สแปมหรือโฆษณา" },
  { code: "harassment", label: "คุกคามหรือล่วงละเมิด" },
  { code: "inappropriate", label: "เนื้อหาไม่เหมาะสมหรือลามก" },
  { code: "scam", label: "หลอกลวงหรือขอเงิน" },
  { code: "fake", label: "แอบอ้างเป็นผู้อื่นหรือโปรไฟล์ปลอม" },
  { code: "minor", label: "อาจเป็นผู้เยาว์ (อายุต่ำกว่า 18 ปี)" },
  { code: "other", label: "อื่นๆ" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["code"];

export type BlockedUser = { id: string; name: string; avatar: string };

export async function blockUser(userId: string): Promise<string | null> {
  if (!isUuid(userId)) return "รหัสผู้ใช้ไม่ถูกต้อง";
  const { error } = await supabase.from("blocks").insert({ blocked_id: userId });
  if (error && error.code !== "23505") return error.message;
  return null;
}

export async function unblockUser(userId: string): Promise<string | null> {
  const { error } = await supabase.from("blocks").delete().eq("blocked_id", userId);
  return error ? error.message : null;
}

export async function listBlocked(): Promise<{ users: BlockedUser[]; error: string | null }> {
  const { data, error } = await supabase
    .from("blocks")
    .select("blocked_id, created_at")
    .order("created_at", { ascending: false });
  if (error) return { users: [], error: "โหลดรายชื่อไม่สำเร็จ" };

  const ids = (data ?? []).map((r) => r.blocked_id as string);
  if (ids.length === 0) return { users: [], error: null };

  const { data: profs } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", ids);
  const map = new Map((profs ?? []).map((p) => [p.id as string, p] as const));

  return {
    users: ids.map((id) => {
      const p = map.get(id);
      return {
        id,
        name: p?.name ?? "ผู้ใช้",
        avatar: p?.avatar_url ?? `https://i.pravatar.cc/200?u=${id}`,
      };
    }),
    error: null,
  };
}

export async function reportUser(
  userId: string,
  reason: ReportReason,
  details: string
): Promise<string | null> {
  if (!isUuid(userId)) return "รหัสผู้ใช้ไม่ถูกต้อง";
  const { error } = await supabase
    .from("reports")
    .insert({ reported_id: userId, reason, details: details.trim() || null });
  if (error) {
    if (error.code === "23505") return "คุณเคยรายงานผู้ใช้นี้ด้วยเหตุผลนี้แล้ว";
    return error.message;
  }
  return null;
}
