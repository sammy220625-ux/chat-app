import { create } from "zustand";
import { supabase } from "../services/supabase";

export type Profile = {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  coins: number;
  followers: number;
  following: number;
  isVerified: boolean;
  vipLevel: number;
};

const EMPTY_ID = "00000000";

const emptyProfile: Profile = {
  id: EMPTY_ID,
  name: "",
  bio: "",
  avatar: "https://i.pravatar.cc/200?img=12",
  coins: 0,
  followers: 0,
  following: 0,
  isVerified: false,
  vipLevel: 0,
};

type State = {
  profile: Profile;
  loading: boolean;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (changes: { name?: string; bio?: string }) => Promise<string | null>;
  reset: () => void;
};

export const useProfileStore = create<State>((set, get) => ({
  profile: emptyProfile,
  loading: false,

  loadProfile: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, bio, avatar_url, coins, is_verified, vip_level")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) {
      set({ loading: false });
      return;
    }
    set({
      loading: false,
      profile: {
        id: data.id,
        name: data.name,
        bio: data.bio,
        avatar: data.avatar_url ?? `https://i.pravatar.cc/200?u=${data.id}`,
        coins: data.coins,
        followers: 0,
        following: 0,
        isVerified: data.is_verified,
        vipLevel: data.vip_level,
      },
    });
  },

  updateProfile: async (changes) => {
    const id = get().profile.id;
    if (id === EMPTY_ID) return "ยังโหลดโปรไฟล์ไม่เสร็จ ลองใหม่อีกครั้ง";
    const { data, error } = await supabase
      .from("profiles")
      .update(changes)
      .eq("id", id)
      .select("id");
    if (error) return error.message;
    if (!data || data.length === 0) return "บันทึกไม่สำเร็จ ไม่พบโปรไฟล์ของคุณ";
    set((s) => ({ profile: { ...s.profile, ...changes } }));
    return null;
  },

  reset: () => set({ profile: emptyProfile, loading: false }),
}));

// โหลดโปรไฟล์เมื่อล็อกอิน และล้างเมื่อออกจากระบบ
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    useProfileStore.getState().reset();
  } else if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
    const uid = session.user.id;
    setTimeout(() => useProfileStore.getState().loadProfile(uid), 0);
  }
});
