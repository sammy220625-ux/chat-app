import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { User, Conversation } from "../../types";
import { colors } from "../../constants/theme";

type Props = {
  user: User;
  chat: Conversation;
  onPress: (userId: string) => void;
};

export default function ChatListItem({ user, chat, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(user.id)}
    >
      <View>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        {user.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.time}>{chat.time}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text
            style={[styles.last, chat.unread > 0 && styles.lastUnread]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
          {chat.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  pressed: { backgroundColor: colors.chip },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.chip },
  onlineDot: {
    position: "absolute", bottom: 2, right: 2, width: 14, height: 14,
    borderRadius: 7, backgroundColor: colors.online, borderWidth: 2, borderColor: "#fff",
  },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  name: { flex: 1, fontSize: 17, fontWeight: "700", color: colors.text },
  time: { fontSize: 12, color: colors.subText },
  bottomRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  last: { flex: 1, fontSize: 14, color: colors.subText },
  lastUnread: { color: colors.text, fontWeight: "600" },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6,
    backgroundColor: colors.hiText, alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
