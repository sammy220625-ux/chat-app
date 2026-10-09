import { Redirect, Tabs } from "expo-router";
import { useSession } from "../../src/hooks/useSession";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (title: string, icon: IconName, iconActive: IconName, badge?: number) => ({
  title,
  tabBarBadge: badge,
  tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? iconActive : icon} size={size} color={color} />
  ),
});

export default function TabsLayout() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: colors.chip },
      }}
    >
      <Tabs.Screen name="index" options={tab("สำหรับคุณ", "heart-outline", "heart")} />
      <Tabs.Screen name="moments" options={tab("โมเมนต์", "aperture-outline", "aperture")} />
      <Tabs.Screen name="rooms" options={tab("ห้องแชท", "chatbubbles-outline", "chatbubbles")} />
      <Tabs.Screen name="inbox" options={tab("กล่องข้อความ", "mail-outline", "mail", 24)} />
      <Tabs.Screen name="me" options={tab("ฉัน", "happy-outline", "happy")} />
    </Tabs>
  );
}
