import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatListItem from "../../src/components/chat/ChatListItem";
import { supabase } from "../../src/services/supabase";
import { useSession } from "../../src/hooks/useSession";
import { MessageRow, listTime } from "../../src/services/chatService";
import { Conversation, User } from "../../src/types";
import { colors } from "../../src/constants/theme";

type Item = { chat: Conversation; user: User };

export default function Inbox() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const myId = session?.user.id;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!myId) return;
    const { data, error: err } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, created_at, read_at")
      .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
      .order("created_at", { ascending: false })
      .limit(300);
    if (err) {
      setError("โหลดข้อความไม่สำเร็จ ลองใหม่อีกครั้ง");
      setLoading(false);
      return;
    }

    const byPeer = new Map<string, Conversation>();
    for (const r of (data ?? []) as MessageRow[]) {
      const peerId = r.sender_id === myId ? r.recipient_id : r.sender_id;
      let c = byPeer.get(peerId);
      if (!c) {
        c = {
          id: peerId,
          userId: peerId,
          lastMessage: (r.sender_id === myId ? "คุณ: " : "") + r.body,
          time: listTime(r.created_at),
          unread: 0,
        };
        byPeer.set(peerId, c);
      }
      if (r.recipient_id === myId && !r.read_at) c.unread += 1;
    }

    const ids = [...byPeer.keys()];
    if (ids.length === 0) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, is_verified")
      .in("id", ids);
    const profMap = new Map((profs ?? []).map((p) => [p.id, p] as const));

    setItems(
      ids.flatMap((pid): Item[] => {
        const p = profMap.get(pid);
        const chat = byPeer.get(pid);
        if (!p || !chat) return [];
        return [{
          chat,
          user: {
            id: p.id,
            name: p.name,
            avatar: p.avatar_url ?? `https://i.pravatar.cc/200?u=${p.id}`,
            isVerified: p.is_verified,
            isOnline: false,
          },
        }];
      })
    );
    setError(null);
    setLoading(false);
  }, [myId]);

  useFocusEffect(
    useCallback(() => {
      if (!myId) return;
      load();
      const channel = supabase
        .channel(`inbox:${myId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${myId}` },
          () => { load(); }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [load, myId])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>กล่องข้อความ</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.chat.id}
          renderItem={({ item }) => (
            <ChatListItem
              user={item.user}
              chat={item.chat}
              onPress={(userId) => router.push(`/chat/${userId}`)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error ?? "ยังไม่มีแชต กดทักทายใครสักคนที่หน้า \"สำหรับคุณ\" ดูสิ"}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, paddingHorizontal: 16, paddingBottom: 8 },
  empty: { textAlign: "center", color: colors.subText, marginTop: 48, paddingHorizontal: 24 },
});
