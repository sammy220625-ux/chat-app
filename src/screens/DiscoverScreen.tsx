import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet, StatusBar, Platform,
  RefreshControl, Alert, ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import CategoryBar from "../components/discover/CategoryBar";
import UserCard from "../components/discover/UserCard";
import { supabase } from "../services/supabase";
import { sendMessage, isUuid } from "../services/chatService";
import { useProfileStore } from "../store/profileStore";
import { User } from "../types";
import { colors } from "../constants/theme";

type Tab = "forYou" | "nearby";

export default function DiscoverScreen() {
  const router = useRouter();
  const myId = useProfileStore((s) => s.profile.id);
  const [tab, setTab] = useState<Tab>("forYou");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hiSent, setHiSent] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, bio, avatar_url, is_verified, vip_level, gender, birth_year")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      setLoadError("โหลดรายชื่อไม่สำเร็จ ลองดึงลงเพื่อรีเฟรช");
      return;
    }
    const { data: bl } = await supabase.from("blocks").select("blocked_id");
    const blockedIds = new Set((bl ?? []).map((b) => b.blocked_id as string));
    setLoadError(null);
    setAllUsers(
      (data ?? [])
        .filter((r) => r.id !== myId && !blockedIds.has(r.id))
        .map((r) => ({
          id: r.id,
          name: r.name,
          bio: r.bio,
          avatar: r.avatar_url ?? `https://i.pravatar.cc/200?u=${r.id}`,
          isVerified: r.is_verified,
          vipLevel: r.vip_level > 0 ? r.vip_level : undefined,
          gender: r.gender ?? undefined,
          age: r.birth_year ? new Date().getFullYear() - r.birth_year : undefined,
          isOnline: false,
        }))
    );
  }, [myId]);

  useEffect(() => {
    loadUsers().finally(() => setLoading(false));
  }, [loadUsers]);

  useEffect(() => {
    if (!isUuid(myId)) return;
    supabase
      .from("messages")
      .select("sender_id, recipient_id")
      .or("sender_id.eq." + myId + ",recipient_id.eq." + myId)
      .limit(500)
      .then(({ data }) => {
        if (!data) return;
        const peers = data.map(
          (r) => (r.sender_id === myId ? r.recipient_id : r.sender_id) as string
        );
        setHiSent((prev) => new Set([...prev, ...peers]));
      });
  }, [myId]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const users = useMemo(() => {
    if (tab === "nearby") {
      return allUsers
        .filter((u) => u.distanceKm !== undefined)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    return allUsers;
  }, [tab, allUsers]);

  const pending = useRef<Set<string>>(new Set());

  const handleHi = useCallback(async (id: string) => {
    if (pending.current.has(id)) return;
    pending.current.add(id);
    const res = await sendMessage(id, "สวัสดี 👋");
    pending.current.delete(id);
    if (res.error) {
      Alert.alert("ส่งไม่สำเร็จ", res.error);
      return;
    }
    setHiSent((prev) => new Set(prev).add(id));
  }, []);

  const handleCategory = (id: string) => {
    Alert.alert("เร็วๆ นี้", `หน้า "${id}" ยังไม่เปิดใช้งาน`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }, [loadUsers]);

  const emptyText = loadError
    ? loadError
    : tab === "nearby"
    ? "แท็บใกล้เคียงจะใช้ได้เมื่อมีข้อมูลตำแหน่งที่ตั้ง"
    : "ยังไม่มีผู้ใช้คนอื่น ลองสมัครอีกบัญชีเพื่อทดสอบ";

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
          loading ? (
            <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
          ) : (
            <Text style={styles.empty}>{emptyText}</Text>
          )
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
  empty: { textAlign: "center", color: colors.subText, marginTop: 48, paddingHorizontal: 24 },
});
