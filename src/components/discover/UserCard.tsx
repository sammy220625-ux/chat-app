import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { User } from "../../types";
import { colors, radius } from "../../constants/theme";

type Props = {
  user: User;
  hiSent: boolean;
  onHi: (id: string) => void;
  onOpenChat: (id: string) => void;
  onOpenProfile?: (id: string) => void;
};

export default function UserCard({ user, hiSent, onHi, onOpenChat, onOpenProfile }: Props) {
  return (
    <Pressable style={styles.row} onPress={() => onOpenProfile?.(user.id)}>
      <View>
        <Image
          source={{ uri: user.avatar }}
          style={[styles.avatar, user.inParty && styles.avatarParty]}
        />
        {user.isOnline && <View style={styles.onlineDot} />}
        {user.inParty && (
          <View style={styles.partyTag}>
            <Text style={styles.partyText}>ในปาร์ตี้</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          {user.isVerified && (
            <View style={[styles.badge, { backgroundColor: colors.verifiedBg }]}>
              <Text style={[styles.badgeText, { color: colors.verifiedText }]}>✓ คนจริง</Text>
            </View>
          )}
          {!!user.vipLevel && (
            <View style={[styles.badge, { backgroundColor: colors.vipBg }]}>
              <Text style={[styles.badgeText, { color: colors.vipText }]}>SVIP {user.vipLevel}</Text>
            </View>
          )}
        </View>

        <View style={styles.chipRow}>
          {user.distanceKm !== undefined && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{user.distanceKm.toFixed(2)}km</Text>
            </View>
          )}
          {user.age !== undefined && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{user.gender === "male" ? "♂" : user.gender === "other" ? "⚧" : "♀"} {user.age}</Text>
            </View>
          )}
        </View>

        {!!user.bio && <Text style={styles.bio} numberOfLines={1}>{user.bio}</Text>}
      </View>

      {hiSent ? (
        <Pressable style={styles.chatBtn} onPress={() => onOpenChat(user.id)}>
          <Text style={styles.chatIcon}>💬</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.hiBtn} onPress={() => onHi(user.id)}>
          <Text style={styles.hiText}>Hi</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  avatar: { width: 88, height: 88, borderRadius: 20, backgroundColor: colors.chip },
  avatarParty: { borderWidth: 2, borderColor: colors.primary },
  onlineDot: {
    position: "absolute", bottom: 6, right: 6, width: 14, height: 14,
    borderRadius: 7, backgroundColor: colors.online, borderWidth: 2, borderColor: "#fff",
  },
  partyTag: {
    position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center",
    backgroundColor: "rgba(124,92,255,0.85)", borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
    paddingVertical: 2,
  },
  partyText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  info: { flex: 1, marginLeft: 12, gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 17, fontWeight: "700", color: colors.text, flexShrink: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.sm },
  badgeText: { fontSize: 11, fontWeight: "700" },
  chipRow: { flexDirection: "row", gap: 6 },
  chip: { backgroundColor: colors.chip, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.md },
  chipText: { fontSize: 13, color: colors.text },
  bio: { fontSize: 14, color: colors.subText },
  hiBtn: {
    backgroundColor: colors.hiBg, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: radius.pill, marginLeft: 8,
  },
  hiText: { color: colors.hiText, fontWeight: "800", fontSize: 16 },
  chatBtn: {
    backgroundColor: colors.chatBg, width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
  chatIcon: { fontSize: 20 },
});
