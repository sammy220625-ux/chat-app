import { useState } from "react";
import {
  View, Text, Pressable, Alert, ActivityIndicator, ScrollView, StyleSheet, Platform,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { supabase } from "../src/services/supabase";
import { useSession } from "../src/hooks/useSession";
import { useProfileStore } from "../src/store/profileStore";
import { colors } from "../src/constants/theme";

const GENDERS = [
  { code: "female", label: "หญิง" },
  { code: "male", label: "ชาย" },
  { code: "other", label: "อื่นๆ" },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const showDate = (d: Date) =>
  `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} (พ.ศ. ${d.getFullYear() + 543})`;

function ageOn(birth: Date) {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, loading } = useSession();
  const profile = useProfileStore((s) => s.profile);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const [birth, setBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;
  if (profile.birthYear != null) return <Redirect href="/" />;

  const defaultDate = new Date(new Date().getFullYear() - 25, 0, 1);

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: birth ?? defaultDate,
        mode: "date",
        maximumDate: new Date(),
        minimumDate: new Date(1920, 0, 1),
        onChange: (e, d) => {
          if (e.type === "set" && d) setBirth(d);
        },
      });
    } else {
      setShowIos(true);
    }
  };

  const submit = async () => {
    if (!birth || !gender) {
      Alert.alert("กรอกข้อมูลให้ครบ", "กรุณาเลือกวันเกิดและเพศ");
      return;
    }
    if (ageOn(birth) < 18) {
      Alert.alert("ขออภัย", "แอปนี้สำหรับผู้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("complete_profile", {
      p_birth_date: toIsoDate(birth),
      p_gender: gender,
    });
    if (error && !String(error.message).includes("already_set")) {
      setBusy(false);
      const under18 = String(error.message).includes("under_18");
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        under18 ? "แอปนี้สำหรับผู้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น" : error.message
      );
      return;
    }
    await loadProfile(session.user.id);
    setBusy(false);
    router.replace("/");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: 24,
        paddingTop: insets.top + 32,
        paddingBottom: Math.max(insets.bottom, 48) + 24,
      }}
    >
      <Text style={styles.title}>ข้อมูลของคุณ</Text>
      <Text style={styles.sub}>
        แอปนี้สำหรับผู้ที่มีอายุ 18 ปีขึ้นไป กรุณากรอกวันเกิดและเพศเพื่อเริ่มใช้งาน
      </Text>

      <Text style={styles.label}>วันเกิด</Text>
      <Pressable style={styles.field} onPress={openPicker}>
        <Text style={birth ? styles.fieldText : styles.placeholder}>
          {birth ? showDate(birth) : "แตะเพื่อเลือกวันเกิด"}
        </Text>
      </Pressable>
      {showIos && (
        <DateTimePicker
          value={birth ?? defaultDate}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          onChange={(_e, d) => {
            if (d) setBirth(d);
          }}
        />
      )}

      <Text style={styles.label}>เพศ</Text>
      <View style={styles.chips}>
        {GENDERS.map((g) => (
          <Pressable
            key={g.code}
            style={[styles.chip, gender === g.code && styles.chipActive]}
            onPress={() => setGender(g.code)}
          >
            <Text style={[styles.chipText, gender === g.code && styles.chipTextActive]}>
              {g.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.note}>
        วันเกิดของคุณจะไม่แสดงให้ผู้ใช้อื่นเห็น (แสดงเฉพาะอายุโดยประมาณ) และแก้ไขเองภายหลังไม่ได้
        กรุณากรอกตามความจริง
      </Text>

      <Pressable style={[styles.btn, busy && { opacity: 0.7 }]} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ยืนยันและเริ่มใช้งาน</Text>}
      </Pressable>

      <Pressable onPress={() => supabase.auth.signOut()} hitSlop={10}>
        <Text style={styles.link}>ออกจากระบบ</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  sub: { fontSize: 15, color: colors.subText, marginTop: 6 },
  label: { fontSize: 14, fontWeight: "600", color: colors.subText, marginTop: 24, marginBottom: 8 },
  field: { backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 16 },
  fieldText: { fontSize: 16, color: colors.text },
  placeholder: { fontSize: 16, color: colors.subText },
  chips: { flexDirection: "row", gap: 10 },
  chip: { flex: 1, backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 16, fontWeight: "700", color: colors.text },
  chipTextActive: { color: "#fff" },
  note: { fontSize: 13, color: colors.subText, marginTop: 20, lineHeight: 20 },
  btn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  link: { textAlign: "center", color: colors.subText, fontWeight: "600", marginTop: 20 },
});
