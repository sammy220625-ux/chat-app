import { useState } from "react";
import {
  View, Text, TextInput, Pressable, Alert, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, ScrollView,
} from "react-native";
import { Redirect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../src/hooks/useSession";
import { supabase } from "../src/services/supabase";
import { colors } from "../src/constants/theme";

const thaiError = (msg: string) => {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("already registered")) return "อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน";
  if (m.includes("not confirmed")) return "ยังไม่ได้ยืนยันอีเมล กรุณาตรวจกล่องจดหมาย";
  if (m.includes("rate limit")) return "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
  return msg;
};

export default function Login() {
  const insets = useSafeAreaInsets();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (session) return <Redirect href="/" />;

  const isLogin = mode === "login";

  const submit = async () => {
    const e = email.trim();
    if (!e.includes("@")) {
      Alert.alert("อีเมลไม่ถูกต้อง", "กรุณาตรวจสอบอีเมลอีกครั้ง");
      return;
    }
    if (password.length < 6) {
      Alert.alert("รหัสผ่านสั้นเกินไป", "ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setBusy(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: e, password });
        if (error) Alert.alert("เข้าสู่ระบบไม่สำเร็จ", thaiError(error.message));
      } else {
        const { data, error } = await supabase.auth.signUp({ email: e, password });
        if (error) {
          Alert.alert("สมัครไม่สำเร็จ", thaiError(error.message));
        } else if (!data.session) {
          Alert.alert("ตรวจอีเมลของคุณ", "เราส่งลิงก์ยืนยันไปที่อีเมลแล้ว กดยืนยันก่อนเข้าสู่ระบบ");
        }
      }
    } finally {
      setBusy(false);
    }
  };
return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: Math.max(insets.bottom, 48) + 24 }]}
      >
        <Text style={styles.emoji}>💬</Text>
        <Text style={styles.title}>{isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Text>
        <Text style={styles.sub}>
          {isLogin ? "ยินดีต้อนรับกลับมา" : "สร้างบัญชีใหม่ด้วยอีเมลของคุณ"}
        </Text>

        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.subText}
        />

        <Text style={styles.label}>รหัสผ่าน</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="อย่างน้อย 6 ตัวอักษร"
          placeholderTextColor={colors.subText}
        />

        <Pressable
          style={[styles.btn, busy && styles.btnBusy]}
          onPress={submit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(isLogin ? "register" : "login")} hitSlop={10}>
          <Text style={styles.switch}>
            {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24 },
  emoji: { fontSize: 56, textAlign: "center" },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, textAlign: "center", marginTop: 8 },
  sub: { fontSize: 15, color: colors.subText, textAlign: "center", marginTop: 4, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: colors.subText, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 16, color: colors.text,
  },
  btn: {
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 15,
    alignItems: "center", marginTop: 28,
  },
  btnBusy: { opacity: 0.7 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  switch: { textAlign: "center", color: colors.primary, fontWeight: "700", marginTop: 20 },
});
