import { create } from "zustand";
import { supabase } from "../services/supabase";

type State = {
  count: number;
  refresh: () => Promise<void>;
  reset: () => void;
};

export const useUnreadStore = create<State>((set) => ({
  count: 0,

  refresh: async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) {
      set({ count: 0 });
      return;
    }
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", uid)
      .is("read_at", null);
    if (!error) set({ count: count ?? 0 });
  },

  reset: () => set({ count: 0 }),
}));
