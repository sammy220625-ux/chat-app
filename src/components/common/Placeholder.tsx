import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/theme";

type Props = { emoji: string; title: string; note: string };

export default function Placeholder({ emoji, title, note }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.note}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, padding: 24 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  note: { marginTop: 6, fontSize: 15, color: colors.subText, textAlign: "center" },
});
