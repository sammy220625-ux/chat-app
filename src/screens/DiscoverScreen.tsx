import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet,
  StatusBar, Platform, RefreshControl, Alert,
} from "react-native";
import CategoryBar from "../components/discover/CategoryBar";
import UserCard from "../components/discover/UserCard";
import { mockUsers } from "../data/mockUsers";
import { colors } from "../constants/theme";

type Tab = "forYou" | "nearby";

export default function DiscoverScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("forYou");
  const [hiSent, setHiSent] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const users = useMemo(() => {
    if (tab === "nearby") {
      return mockUsers
        .filter((u) => u.distanceKm !== undefined)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    return mockUsers;
  }, [tab]);

  const handleHi = useCallback((id: string) => {
    setHiSent((prev) => new Set(prev).add(id));
  }, []);

  const handleCategory = (id: string) => {
    Alert.alert("เร็วๆ นี้", `หน้า "${id}" ยังไม่เปิดใช้งาน`);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const Header = (
    <View>
      <View style={styles.categoryWrap}>
        <CategoryBar onSelect={handleCategory} />
      </View>

      <View style={styles.tabRow}>
        <View style={styles.tabs}>
          <TabButton label="เพื่อคุณ" active={tab === "forYou"} onPress={() => setTab("forYou")} />
          <TabButton label="ใกล้เคียง" active={tab === "nearby"} onPress={() => setTab("nearby")} />
        </View>
        <View style={styles.actions}>
          <Pressable hitSlop={8} onPress={() => Alert.alert("อันดับ", "เร็วๆ นี้")}>
            <Text style={styles.actionIcon}>🏆</Text>
          </Pressable>
          <Pressable hitSlop={8} onPress={() => Alert.alert("ตัวกรองภูมิภาค", "เร็วๆ นี้")}>
            <Text style={styles.actionIcon}>🌏</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            hiSent={hiSent.has(item.id)}
            onHi={handleHi}
            onOpenChat={(id) => router.push(`/chat/${id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>ยังไม่มีผู้ใช้ใกล้คุณ ลองดึงลงเพื่อรีเฟรช</Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <Text style={[styles.tabText, active ? styles.tabActive : styles.tabInactive]}>{label}</Text>
      <View style={[styles.underline, active && styles.underlineActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 48,
  },
  categoryWrap: { paddingTop: 8, paddingBottom: 16 },
  tabRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 4,
  },
  tabs: { flexDirection: "row", gap: 24 },
  tabBtn: { alignItems: "flex-start" },
  tabText: { fontSize: 22 },
  tabActive: { fontWeight: "800", color: colors.text },
  tabInactive: { fontWeight: "500", color: colors.subText },
  underline: { height: 4, width: 28, borderRadius: 2, marginTop: 4, backgroundColor: "transparent" },
  underlineActive: { backgroundColor: colors.primary },
  actions: { flexDirection: "row", gap: 16 },
  actionIcon: { fontSize: 26 },
  empty: { textAlign: "center", color: colors.subText, marginTop: 48 },
});
