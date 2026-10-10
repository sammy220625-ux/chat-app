import { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, FlatList, Image, Pressable, StyleSheet,
  KeyboardAvoidingView, ActivityIndicator, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MessageBubble from "../../src/components/chat/MessageBubble";
import MessageInput from "../../src/components/chat/MessageInput";
import { supabase } from "../../src/services/supabase";
import { useSession } from "../../src/hooks/useSession";
import {
  fetchMessages, sendMessage, markRead, toMessage, isUuid, MessageRow,
} from "../../src/services/chatService";
import { Message } from "../../src/types";
import { blockUser } from "../../src/services/safetyService";
import { colors } from "../../src/constants/theme";

type Peer = { name: string; avatar: string };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);
  const { session } = useSession();
  const myId = session?.user.id;
  const [peer, setPeer] = useState<Peer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!myId || !id) return;
    if (!isUuid(id)) {
      setError("ไม่พบผู้ใช้นี้");
      setLoading(false);
      return;
    }
    let active = true;

    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", id)
        .maybeSingle();
      if (active && p) {
        setPeer({ name: p.name, avatar: p.avatar_url ?? `https://i.pravatar.cc/200?u=${id}` });
      }
      const res = await fetchMessages(myId, id);
      if (!active) return;
      if (res.error) setError(res.error);
      else setMessages(res.messages);
      setLoading(false);
      markRead(myId, id);
    })();

    const channel = supabase
      .channel(`chat:${myId}:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${myId}` },
        (payload) => {
          const row = payload.new as MessageRow;
          if (row.sender_id !== id) return;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, toMessage(row, myId)]
          );
          markRead(myId, id);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [myId, id]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!myId || !id) return;
      const res = await sendMessage(id, text);
      if (res.error || !res.row) {
        Alert.alert("ส่งไม่สำเร็จ", res.error ?? "ลองใหม่อีกครั้ง");
        return;
      }
      const msg = toMessage(res.row, myId);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    },
    [myId, id]
  );
  const confirmBlock = () => {
    if (!id) return;
    Alert.alert(
      "บล็อกผู้ใช้นี้?",
      "คุณจะไม่เห็นโปรไฟล์และข้อความของเขา และข้อความจากเขาจะไม่ถึงคุณ ปลดบล็อกได้ภายหลังจากหน้า ฉัน",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "บล็อก",
          style: "destructive",
          onPress: async () => {
            const err = await blockUser(id);
            if (err) Alert.alert("บล็อกไม่สำเร็จ", err);
            else router.back();
          },
        },
      ]
    );
  };

  const openMenu = () => {
    if (!id) return;
    Alert.alert(peer?.name ?? "ผู้ใช้", undefined, [
      { text: "รายงานผู้ใช้", onPress: () => router.push("/report/" + id) },
      { text: "บล็อกผู้ใช้", style: "destructive", onPress: confirmBlock },
      { text: "ยกเลิก", style: "cancel" },
    ]);
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="ย้อนกลับ">
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        {peer && <Image source={{ uri: peer.avatar }} style={styles.avatar} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {peer?.name ?? (loading ? "กำลังโหลด..." : "ผู้ใช้")}
          </Text>
        </View>
        <Pressable onPress={openMenu} hitSlop={10} accessibilityLabel="ตัวเลือก">
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : error ? (
        <Text style={styles.info}>{error}</Text>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListEmptyComponent={<Text style={styles.info}>ยังไม่มีข้อความ ลองทักทายได้เลย 👋</Text>}
          contentContainerStyle={{ paddingVertical: 12 }}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <MessageInput onSend={handleSend} bottomInset={insets.bottom} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingBottom: 10,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.chip,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.chip },
  name: { fontSize: 17, fontWeight: "700", color: colors.text },
  info: { textAlign: "center", color: colors.subText, marginTop: 48, paddingHorizontal: 24 },
});
