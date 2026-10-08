import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Category } from "../../types";

export const categories: Category[] = [
  { id: "party", label: "ปาร์ตี้", emoji: "🎉", colors: ["#6EA8FF", "#2BC4C4"] },
  { id: "tribe", label: "เผ่า", emoji: "⛺", colors: ["#B07CFF", "#6C5CFF"] },
  { id: "video", label: "วิดีโอ", emoji: "🎥", colors: ["#2FD6C0", "#3B9BFF"] },
  { id: "mission", label: "ภารกิจ", emoji: "⭐", colors: ["#FF8FB3", "#FF4F9A"] },
  { id: "voice", label: "เสียง", emoji: "🎙️", colors: ["#2CD3C8", "#3E8DF5"] },
];

type Props = { onSelect: (id: string) => void };

export default function CategoryBar({ onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {categories.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => onSelect(c.id)}
          style={({ pressed }) => [pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={c.label}
        >
          <LinearGradient
            colors={c.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tile}
          >
            <Text style={styles.emoji}>{c.emoji}</Text>
            <Text style={styles.label}>{c.label}</Text>
          </LinearGradient>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 12 },
  tile: {
    width: 96,
    height: 112,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emoji: { fontSize: 36 },
  label: { color: "#fff", fontSize: 18, fontWeight: "700" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
});
