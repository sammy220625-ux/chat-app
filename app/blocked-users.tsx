import { useCallback, useState } from "react";
import {
  View, Text, FlatList, Image, Pressable, Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { listBlocked, unblockUser, BlockedUser } from "../src/services/safetyService";
import { colors } from "../src/constants/theme";

export default function BlockedUsers() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await listBlocked();
    setUsers(res.users);
    setError(res.error);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmUnblock = (u: BlockedUser) => {
    Alert.alert(`ปลดบล็อก ${u.name}?`, "คุณจะเห็นโปรไฟล์และข้อความของเขาอีกครั้ง", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ปลดบล็อก",
        onPress: async () => {
          const err = await unblockUser(u.id);
          if (err) Alert.alert("ปลดบล็อกไม่สำเร็จ", err);
          else setUsers((prev) => prev.filter((x) => x.id !== u.id));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="ย้อนกลับ">
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>ผู้ใช้ที่ถูกบล็อก</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Pressable style={styles.btn} onPress={() => confirmUnblock(item)}>
                <Text style={styles.btnText}>ปลดบล็อก</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{error ?? "คุณยังไม่ได้บล็อกใคร"}</Text>
          }
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 48) + 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingBottom: 10,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.chip,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: colors.chip,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.chip },
  name: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text },
  btn: { backgroundColor: colors.chatBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  btnText: { color: colors.primary, fontWeight: "700" },
  empty: { textAlign: "center", color: colors.subText, marginTop: 48, paddingHorizontal: 24 },
});
