import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";
import { useProfileStore } from "../store/profileStore";

export type AvatarResult =
  | { status: "cancelled" }
  | { status: "ok" }
  | { status: "error"; message: string };

const MAX_BASE64_CHARS = 2_600_000; // ประมาณ 1.9 MB

export async function pickAndUploadAvatar(userId: string): Promise<AvatarResult> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
    base64: true,
  });
  if (picked.canceled) return { status: "cancelled" };

  const asset = picked.assets[0];
  if (!asset?.base64) {
    return { status: "error", message: "อ่านรูปไม่สำเร็จ ลองเลือกรูปอื่น" };
  }
  if (asset.base64.length > MAX_BASE64_CHARS) {
    return { status: "error", message: "รูปใหญ่เกินไป (ไม่เกิน 2 MB)" };
  }

  const mime =
    asset.mimeType === "image/png" || asset.mimeType === "image/webp"
      ? asset.mimeType
      : "image/jpeg";
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const up = await supabase.storage
    .from("avatars")
    .upload(path, decode(asset.base64), { contentType: mime });
  if (up.error) return { status: "error", message: up.error.message };

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: pub.publicUrl })
    .eq("id", userId)
    .select("id");

  if (error || !data || data.length === 0) {
    await supabase.storage.from("avatars").remove([path]);
    return { status: "error", message: error?.message ?? "บันทึกรูปไม่สำเร็จ" };
  }

  await useProfileStore.getState().loadProfile(userId);
  return { status: "ok" };
}
