import { useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, Alert,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { REPORT_REASONS, ReportReason, reportUser, blockUser } from "../../src/services/safetyService";
import { colors } from "../../src/constants/theme";

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason || !id) {
      Alert.alert("เลือกเหตุผล", "กรุณาเลือกเหตุผลที่รายงาน");
      return;
    }
    setBusy(true);
    const err = await reportUser(id, reason, details);
    setBusy(false);
    if (err) {
      Alert.alert("ส่งรายงานไม่สำเร็จ", err);
      return;
    }
    Alert.alert(
      "ส่งรายงานแล้ว",
      "ขอบคุณที่ช่วยดูแลชุมชน ต้องการบล็อกผู้ใช้นี้ด้วยไหม",
      [
        { text: "ไม่ต้อง", style: "cancel", onPress: () => router.back() },
        {
          text: "บล็อก",
          style: "destructive",
          onPress: async () => {
            const e = await blockUser(id);
            if (e) Alert.alert("บล็อกไม่สำเร็จ", e);
            router.replace("/");
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="ย้อนกลับ">
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>รายงานผู้ใช้</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 48) + 24 }}
      >
        <Text style={styles.label}>เหตุผลที่รายงาน</Text>
        {REPORT_REASONS.map((r) => (
          <Pressable key={r.code} style={styles.row} onPress={() => setReason(r.code)}>
            <Ionicons
              name={reason === r.code ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={reason === r.code ? colors.primary : colors.subText}
            />
            <Text style={styles.rowText}>{r.label}</Text>
          </Pressable>
        ))}

        <Text style={styles.label}>รายละเอียดเพิ่มเติม (ไม่บังคับ)</Text>
        <TextInput
          style={styles.input}
          value={details}
          onChangeText={setDetails}
          multiline
          maxLength={500}
          placeholder="เล่าสิ่งที่เกิดขึ้นสั้นๆ"
          placeholderTextColor={colors.subText}
        />
        <Text style={styles.counter}>{details.length}/500</Text>

        <Pressable style={[styles.btn, busy && { opacity: 0.7 }]} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ส่งรายงาน</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  label: { fontSize: 14, fontWeight: "600", color: colors.subText, marginTop: 16, marginBottom: 8 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8,
  },
  rowText: { flex: 1, fontSize: 16, color: colors.text },
  input: {
    backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: colors.text, minHeight: 96, textAlignVertical: "top",
  },
  counter: { alignSelf: "flex-end", fontSize: 12, color: colors.subText, marginTop: 4 },
  btn: { backgroundColor: "#DC2626", borderRadius: 16, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
