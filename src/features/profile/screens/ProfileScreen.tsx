import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LogOut } from "lucide-react-native";

import { colors } from "../../../shared/theme/colors";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { Avatar } from "../../../shared/ui/Avatar";
import { Card } from "../../../shared/ui/Card";
import { Chip } from "../../../shared/ui/Chip";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import packageJson from "../../../../package.json";
import { useLogout } from "../../auth/hooks/useLogout";
import { useProfileData } from "../hooks/useProfileData";

type ProfileUser = {
  avatarUrl: string;
  email: string;
  initials: string;
  name: string;
  status: string;
};

type SummaryCardTone = "success" | "debt";

function ProfileCard({ profile }: { profile: ProfileUser }) {
  return (
    <View className="items-center rounded-lg bg-white px-5 py-8 shadow-sm">
      <View className="mb-5">
        <Avatar name={profile.name} initials={profile.initials} />
      </View>

      <Text className="text-2xl font-bold text-neutral900">{profile.name}</Text>
      <Text selectable className="mt-1 text-xl text-neutral700">
        {profile.email}
      </Text>

      <View className="mt-6 w-full flex-row items-center justify-center">
        <View className="rounded-full bg-debtBg px-5 py-2">
          <Text className="text-xl text-debt">{profile.status}</Text>
        </View>
      </View>
    </View>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  valueClassName,
  detailTone,
}: {
  title: string;
  value: string;
  detail: string;
  valueClassName: string;
  detailTone: SummaryCardTone;
}) {
  return (
    <Card variant="summary">
      <Text className="text-sm font-semibold text-neutral500">{title}</Text>
      <Text className={`mt-2 text-xl font-bold ${valueClassName}`}>
        {value}
      </Text>
      <Chip label={detail} tone={detailTone} variant="summary" />
    </Card>
  );
}

function SummaryStateCard({
  title,
  message,
  isLoading = false,
}: {
  title: string;
  message: string;
  isLoading?: boolean;
}) {
  return (
    <Card variant="summary">
      <View
        accessibilityRole={isLoading ? "progressbar" : "summary"}
        accessibilityState={isLoading ? { busy: true } : undefined}
        className="items-center gap-3 py-4"
      >
        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        <Text className="text-center text-base font-semibold text-neutral900">
          {title}
        </Text>
        <Text selectable className="text-center text-sm text-neutral700">
          {message}
        </Text>
      </View>
    </Card>
  );
}

export function ProfileScreen() {
  const { user } = useProfileData();
  const logout = useLogout();
  const version = packageJson.version;

  return (
    <ScreenContainer>
      <AppTopBar />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 pb-28 pt-6"
      >
        <View className="gap-8 px-5">
          <ProfileCard profile={user} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityState={{
              busy: logout.isPending,
              disabled: logout.isPending,
            }}
            disabled={logout.isPending}
            onPress={() => logout.mutate()}
            className="flex-row items-center justify-center gap-3 py-6"
          >
            <LogOut color={colors.debt} size={24} strokeWidth={2.2} />
            <Text className="text-xl text-debt">Cerrar Sesión</Text>
          </Pressable>

          <Text className="text-center text-lg text-neutral700">
            Versión {version}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
