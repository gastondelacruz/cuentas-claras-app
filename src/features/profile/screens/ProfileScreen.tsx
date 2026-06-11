import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { LogOut, Pencil } from "lucide-react-native";

import { colors } from "../../../shared/theme/colors";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { Card } from "../../../shared/ui/Card";
import { Chip } from "../../../shared/ui/Chip";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { formatAmount, formatCurrency } from "../../../shared/utils/formatAmount";
import { useProfileData } from "../hooks/useProfileData";

type ProfileUser = {
  avatarUrl: string;
  email: string;
  name: string;
  status: string;
};

function ProfileCard({ profile }: { profile: ProfileUser }) {
  return (
    <View className="items-center rounded-lg bg-white px-5 py-8 shadow-sm">
      <View className="relative mb-5">
        <View className="h-32 w-32 items-center justify-center rounded-full bg-neutral200 p-2">
          <Image
            accessibilityLabel={profile.name}
            className="h-full w-full rounded-full"
            source={{ uri: profile.avatarUrl }}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar foto de perfil"
          className="absolute bottom-0 right-0 h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-primary"
        >
          <Pencil color={colors.white} size={22} strokeWidth={2.6} />
        </Pressable>
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
  detailTone: "success" | "debt";
}) {
  return (
    <Card variant="summary">
      <Text className="text-sm font-semibold text-neutral500">{title}</Text>
      <Text className={`mt-2 text-xl font-bold ${valueClassName}`}>{value}</Text>
      <Chip label={detail} tone={detailTone} variant="summary" />
    </Card>
  );
}

export function ProfileScreen() {
  const { user, summary } = useProfileData();
  const activeDebtsValue = summary.youOwe > 0 ? formatAmount(-summary.youOwe) : formatCurrency(0);

  return (
    <ScreenContainer>
      <AppTopBar />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 pb-28 pt-6"
      >
        <View className="gap-8 px-5">
          <ProfileCard profile={user} />

          <View className="flex-row gap-3">
            <SummaryCard
              title="Gasto Total"
              value={formatCurrency(summary.totalExpenses)}
              detail={`${summary.totalExpenseCount} ${summary.totalExpenseCount === 1 ? "gasto" : "gastos"} registrados`}
              valueClassName="text-neutral900"
              detailTone="success"
            />
            <SummaryCard
              title="Deudas Activas"
              value={activeDebtsValue}
              detail={`${summary.activeDebtGroupsCount} ${summary.activeDebtGroupsCount === 1 ? "grupo" : "grupos"} pendientes`}
              valueClassName="text-debt"
              detailTone="debt"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            className="flex-row items-center justify-center gap-3 py-6"
          >
            <LogOut color={colors.debt} size={24} strokeWidth={2.2} />
            <Text className="text-xl text-debt">Cerrar Sesión</Text>
          </Pressable>

          <Text className="text-center text-lg text-neutral700">
            Versión 2.4.1 (Compilación 829)
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
