import { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, FlatList, Image, Pressable, StyleSheet, KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MessageBubble from "../../src/components/chat/MessageBubble";
import MessageInput from "../../src/components/chat/MessageInput";
import { mockUsers } from "../../src/data/mockUsers";
import { mockMessages } from "../../src/data/mockMessages";
import { Message, User } from "../../src/types";
import { supabase } from "../../src/services/supabase";
import { colors } from "../../src/constants/theme";

const nowTime = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);
  const mockUser = mockUsers.find((u) => u.id === id);
  const [fetched, setFetched] = useState<User | null>(null);
  useEffect(() => {
    if (mockUser || !id) return;
    supabase
      .from("profiles")
      .select("id, name, avatar_url, is_verified")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFetched({
            id: data.id,
            name: data.name,
            avatar: data.avatar_url ?? `https://i.pravatar.cc/200?u=${data.id}`,
            isVerified: data.is_verified,
            isOnline: false,
          });
        }
      });
  }, [id, mockUser]);
  const user = mockUser ?? fetched ?? undefined;
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSend = useCallback((text: string) => {
    const msg: Message = { id: `m${Date.now()}`, from: "me", text, time: nowTime() };
    setMessages((prev) => [...prev, msg]);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="ย้อนกลับ">
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        {user && <Image source={{ uri: user.avatar }} style={styles.avatar} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{user?.name ?? "ไม่พบผู้ใช้"}</Text>
          {user?.isOnline && <Text style={styles.online}>ออนไลน์</Text>}
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 12 }}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

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
  online: { fontSize: 12, color: colors.online },
});
