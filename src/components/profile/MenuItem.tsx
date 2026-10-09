import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  icon: IconName;
  label: string;
  hint?: string;
  onPress: () => void;
};

export default function MenuItem({ icon, label, hint, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
      <Ionicons name="chevron-forward" size={20} color={colors.subText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
  },
  pressed: { backgroundColor: colors.chip },
  iconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.chatBg, alignItems: "center", justifyContent: "center",
  },
  label: { flex: 1, fontSize: 16, color: colors.text, fontWeight: "600" },
  hint: { fontSize: 13, color: colors.subText },
});
