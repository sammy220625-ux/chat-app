import { useState } from "react";
import { View, Image, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfileStore } from "../../store/profileStore";
import { pickAndUploadAvatar } from "../../services/avatarService";
import { isUuid } from "../../services/chatService";
import { colors } from "../../constants/theme";

export default function AvatarPicker() {
  const avatar = useProfileStore((s) => s.profile.avatar);
  const userId = useProfileStore((s) => s.profile.id);
  const [busy, setBusy] = useState(false);

  const change = async () => {
    if (busy) return;
    if (!isUuid(userId)) {
      Alert.alert("ยังโหลดโปรไฟล์ไม่เสร็จ", "รอสักครู่แล้วลองใหม่อีกครั้ง");
      return;
    }
    setBusy(true);
    try {
      const res = await pickAndUploadAvatar(userId);
      if (res.status === "error") Alert.alert("อัปโหลดรูปไม่สำเร็จ", res.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={change} accessibilityLabel="เปลี่ยนรูปโปรไฟล์">
        <Image source={{ uri: avatar }} style={styles.avatar} />
        {busy && (
          <View style={styles.overlay}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
        <View style={styles.badge}>
          <Ionicons name="camera" size={16} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 8 },
  avatar: { width: 104, height: 104, borderRadius: 30, backgroundColor: colors.chip },
  overlay: {
    ...StyleSheet.absoluteFillObject, borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center",
  },
  badge: {
    position: "absolute", right: -4, bottom: -4, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
});
