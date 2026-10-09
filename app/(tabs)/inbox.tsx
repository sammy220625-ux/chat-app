import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatListItem from "../../src/components/chat/ChatListItem";
import { mockChats } from "../../src/data/mockChats";
import { mockUsers } from "../../src/data/mockUsers";
import { colors } from "../../src/constants/theme";

export default function Inbox() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = mockChats.flatMap((chat) => {
    const user = mockUsers.find((u) => u.id === chat.userId);
    return user ? [{ chat, user }] : [];
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>กล่องข้อความ</Text>
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
          <Text style={styles.empty}>ยังไม่มีแชต กดทักทายใครสักคนที่หน้า "สำหรับคุณ" ดูสิ</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, paddingHorizontal: 16, paddingBottom: 8 },
  empty: { textAlign: "center", color: colors.subText, marginTop: 48, paddingHorizontal: 24 },
});
