import { Redirect, Tabs } from "expo-router";
import { useSession } from "../../src/hooks/useSession";
import { useUnreadSync } from "../../src/hooks/useUnreadSync";
import { useUnreadStore } from "../../src/store/unreadStore";
import { useProfileStore } from "../../src/store/profileStore";
import { isUuid } from "../../src/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (title: string, icon: IconName, iconActive: IconName, badge?: number | string) => ({
  title,
  tabBarBadge: badge,
  tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? iconActive : icon} size={size} color={color} />
  ),
});

export default function TabsLayout() {
  const { session, loading } = useSession();
  useUnreadSync(session?.user.id);
  const unread = useUnreadStore((s) => s.count);
  const profile = useProfileStore((s) => s.profile);
  const profileLoaded = useProfileStore((s) => s.loaded);
  if (loading) return null;
  if (!session) return <Redirect href="/login" />;
  if (!profileLoaded) return null;
  if (isUuid(profile.id) && profile.birthYear == null) return <Redirect href="/onboarding" />;

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
      <Tabs.Screen name="inbox" options={tab("กล่องข้อความ", "mail-outline", "mail", unread > 0 ? (unread > 99 ? "99+" : unread) : undefined)} />
      <Tabs.Screen name="me" options={tab("ฉัน", "happy-outline", "happy")} />
    </Tabs>
  );
}
