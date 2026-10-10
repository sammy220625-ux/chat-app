import { View, Text, Image, ScrollView, Pressable, Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MenuItem from "../../src/components/profile/MenuItem";
import { useRouter } from "expo-router";
import { useProfileStore } from "../../src/store/profileStore";
import { colors } from "../../src/constants/theme";
import { supabase } from "../../src/services/supabase";

const soon = (title: string) => () => Alert.alert(title, "เร็วๆ นี้");

export default function Me() {
  const insets = useSafeAreaInsets();
  const p = useProfileStore((s) => s.profile);
  const router = useRouter();

  const logout = () => {
    Alert.alert("ออกจากระบบ", "ต้องการออกจากระบบใช่ไหม", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ออกจากระบบ", style: "destructive", onPress: () => { supabase.auth.signOut(); } },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32 }}
    >
      <View style={styles.profileRow}>
        <Image source={{ uri: p.avatar }} style={styles.avatar} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
          <Text style={styles.idText}>ID: {p.id.slice(0, 8)}</Text>
          <Text style={styles.bio} numberOfLines={2}>{p.bio}</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => router.push("/edit-profile")} accessibilityLabel="แก้ไขโปรไฟล์">
          <Ionicons name="create-outline" size={26} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat value={p.coins} label="เหรียญ" />
        <Stat value={p.followers} label="ผู้ติดตาม" />
        <Stat value={p.following} label="กำลังติดตาม" />
      </View>

      <Pressable style={styles.vipBanner} onPress={soon("สมาชิก SVIP")}>
        <Text style={styles.vipTitle}>อัปเกรดเป็น SVIP</Text>
        <Text style={styles.vipSub}>ปลดล็อกสิทธิ์พิเศษและป้ายสมาชิก</Text>
      </Pressable>

      <View style={styles.menu}>
        <MenuItem icon="wallet-outline" label="เติมเหรียญ" hint={`${p.coins} เหรียญ`} onPress={soon("เติมเหรียญ")} />
        <MenuItem icon="trophy-outline" label="ภารกิจ" onPress={soon("ภารกิจ")} />
        <MenuItem
          icon="shield-checkmark-outline"
          label="ยืนยันตัวตนคนจริง"
          hint={p.isVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
          onPress={soon("ยืนยันตัวตน")}
        />
        <MenuItem icon="ban-outline" label="ผู้ใช้ที่ถูกบล็อก" onPress={() => router.push("/blocked-users")} />
        <MenuItem icon="settings-outline" label="ตั้งค่า" onPress={soon("ตั้งค่า")} />
        <MenuItem icon="help-circle-outline" label="ช่วยเหลือ" onPress={soon("ช่วยเหลือ")} />
      </View>

      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.chip },
  name: { fontSize: 22, fontWeight: "800", color: colors.text },
  idText: { fontSize: 13, color: colors.subText },
  bio: { fontSize: 14, color: colors.subText },
  stats: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 8,
    backgroundColor: "#fff", borderRadius: 18, paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 13, color: colors.subText },
  vipBanner: {
    marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 18,
    backgroundColor: colors.vipBg, gap: 2,
  },
  vipTitle: { fontSize: 17, fontWeight: "800", color: colors.vipText },
  vipSub: { fontSize: 13, color: colors.vipText },
  menu: { marginTop: 16, marginHorizontal: 16, borderRadius: 18, overflow: "hidden" },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 16, paddingVertical: 14,
    borderRadius: 18, backgroundColor: "#fff", alignItems: "center",
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#DC2626" },
});
