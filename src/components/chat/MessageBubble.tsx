import { View, Text, StyleSheet } from "react-native";
import { Message } from "../../types";
import { colors } from "../../constants/theme";

export default function MessageBubble({ message }: { message: Message }) {
  const mine = message.from === "me";
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, mine && styles.textMine]}>{message.text}</Text>
      </View>
      <Text style={styles.time}>{message.time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, marginVertical: 4, gap: 6 },
  rowMine: { justifyContent: "flex-end", flexDirection: "row-reverse" },
  rowTheirs: { justifyContent: "flex-start" },
  bubble: { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: "#fff", borderBottomLeftRadius: 4 },
  text: { fontSize: 16, color: colors.text },
  textMine: { color: "#fff" },
  time: { fontSize: 11, color: colors.subText },
});
