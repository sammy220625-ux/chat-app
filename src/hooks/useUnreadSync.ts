import { useEffect } from "react";
import { AppState } from "react-native";
import { supabase } from "../services/supabase";
import { useUnreadStore } from "../store/unreadStore";

export function useUnreadSync(userId: string | undefined) {
  useEffect(() => {
    const { refresh, reset } = useUnreadStore.getState();
    if (!userId) {
      reset();
      return;
    }
    refresh();

    const channel = supabase
      .channel(`unread:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
        () => {
          refresh();
        }
      )
      .subscribe();

    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      supabase.removeChannel(channel);
      appSub.remove();
    };
  }, [userId]);
}
