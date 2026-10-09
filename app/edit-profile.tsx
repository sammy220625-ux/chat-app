import { useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, Alert,
  StyleSheet, KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useProfileStore } from "../src/store/profileStore";
import { colors } from "../src/constants/theme";

export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);

  const save = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      Alert.alert("ชื่อสั้นเกินไป", "กรุณาใส่ชื่ออย่างน้อย 2 ตัวอักษร");
      return;
    }
    const err = await updateProfile({
      name: trimmed,
      bio: bio.trim() || "ยังไม่ได้เขียนแนะนำตัว",
    });
    if (err) {
      Alert.alert("บันทึกไม่สำเร็จ", err);
      return;
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="ย้อนกลับ">
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>แก้ไขโปรไฟล์</Text>
        <Pressable onPress={save} hitSlop={10} accessibilityLabel="บันทึก">
          <Text style={styles.save}>บันทึก</Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 48) + 24 }}
      >
        <Text style={styles.label}>ชื่อที่แสดง</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          maxLength={20}
          placeholder="ชื่อของคุณ"
          placeholderTextColor={colors.subText}
        />
        <Text style={styles.counter}>{name.length}/20</Text>

        <Text style={styles.label}>แนะนำตัว</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          maxLength={100}
          multiline
          placeholder="เขียนอะไรสั้นๆ เกี่ยวกับตัวคุณ"
          placeholderTextColor={colors.subText}
        />
        <Text style={styles.counter}>{bio.length}/100</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingBottom: 10,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.chip,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  save: { fontSize: 16, fontWeight: "700", color: colors.primary },
  label: { fontSize: 14, fontWeight: "600", color: colors.subText, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 16, color: colors.text,
  },
  bioInput: { minHeight: 96, textAlignVertical: "top" },
  counter: { alignSelf: "flex-end", fontSize: 12, color: colors.subText, marginTop: 4 },
});
