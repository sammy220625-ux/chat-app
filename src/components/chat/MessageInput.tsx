import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";

type Props = {
  onSend: (text: string) => void;
  bottomInset?: number;
};

export default function MessageInput({ onSend, bottomInset = 0 }: Props) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0;

  // บน Android เว้นขอบล่างอย่างน้อย 48 กันปุ่มระบบทับ แม้ระบบรายงานค่า inset เป็น 0
  const safeBottom = Platform.OS === "android" ? Math.max(bottomInset, 48) : bottomInset;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View style={[styles.bar, { paddingBottom: safeBottom + 8 }]}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="พิมพ์ข้อความ..."
        placeholderTextColor={colors.subText}
        multiline
        maxLength={1000}
      />
      <Pressable
        onPress={submit}
        disabled={!canSend}
        style={[styles.sendBtn, !canSend && styles.sendDisabled]}
        accessibilityLabel="ส่งข้อความ"
      >
        <Ionicons name="send" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: "#fff", borderTopWidth: 2, borderTopColor: colors.primary,
  },
  input: {
    flex: 1, maxHeight: 120, minHeight: 44,
    backgroundColor: colors.chip, borderRadius: 22,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    fontSize: 16, color: colors.text,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  sendDisabled: { backgroundColor: "#C9C3E8" },
});
