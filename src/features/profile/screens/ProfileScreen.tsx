import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { LogOut } from "lucide-react-native";

import { colors } from "../../../shared/theme/colors";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { Avatar } from "../../../shared/ui/Avatar";
import { Card } from "../../../shared/ui/Card";
import { Chip } from "../../../shared/ui/Chip";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { formatAmount, formatCurrency } from "../../../shared/utils/formatAmount";
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
      <Text className={`mt-2 text-xl font-bold ${valueClassName}`}>{value}</Text>
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
        <Text className="text-center text-base font-semibold text-neutral900">{title}</Text>
        <Text selectable className="text-center text-sm text-neutral700">{message}</Text>
      </View>
    </Card>
  );
}

function FinancialSummarySection({
  summary,
  summaryError,
  summaryStatus,
}: Pick<ReturnType<typeof useProfileData>, "summary" | "summaryError" | "summaryStatus">) {
  if (summaryStatus === "loading") {
    return (
      <SummaryStateCard
        isLoading
        title="Cargando resumen financiero..."
        message="Estamos actualizando tus saldos."
      />
    );
  }

  if (summaryStatus === "error") {
    return (
      <SummaryStateCard
        title="No pudimos cargar tu resumen financiero"
        message={summaryError?.message ?? "Intentalo de nuevo en unos minutos."}
      />
    );
  }

  if (!summary) {
    return (
      <SummaryStateCard
        title="Resumen financiero no disponible"
        message="Todavía no hay datos suficientes para calcular tus saldos."
      />
    );
  }

  const netBalanceValue = formatAmount(summary.netBalance, summary.currency);
  const netBalanceTone: SummaryCardTone = summary.netBalance >= 0 ? "success" : "debt";
  const netBalanceClassName = summary.netBalance >= 0 ? "text-success" : "text-debt";

  return (
    <>
      <View className="flex-row gap-3">
        <SummaryCard
          title="Gasto Total"
          value={formatCurrency(summary.totalExpenses, summary.currency)}
          detail={`${summary.totalExpenseCount} ${summary.totalExpenseCount === 1 ? "gasto" : "gastos"} registrados`}
          valueClassName="text-neutral900"
          detailTone="success"
        />
        <SummaryCard
          title="Te deben"
          value={formatCurrency(summary.owedToYou, summary.currency)}
          detail={`${summary.activeDebtGroupsCount} ${summary.activeDebtGroupsCount === 1 ? "grupo" : "grupos"}`}
          valueClassName="text-success"
          detailTone="success"
        />
      </View>

      <View className="flex-row gap-3">
        <SummaryCard
          title="Debes"
          value={formatCurrency(summary.youOwe, summary.currency)}
          detail={summary.currency}
          valueClassName="text-debt"
          detailTone="debt"
        />
        <SummaryCard
          title="Balance Total"
          value={netBalanceValue}
          detail={summary.currency}
          valueClassName={netBalanceClassName}
          detailTone={netBalanceTone}
        />
      </View>
    </>
  );
}

export function ProfileScreen() {
  const { user, summary, summaryError, summaryStatus } = useProfileData();
  const logout = useLogout();

  return (
    <ScreenContainer>
      <AppTopBar />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 pb-28 pt-6"
      >
        <View className="gap-8 px-5">
          <ProfileCard profile={user} />

          <FinancialSummarySection summary={summary} summaryError={summaryError} summaryStatus={summaryStatus} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityState={{ busy: logout.isPending, disabled: logout.isPending }}
            disabled={logout.isPending}
            onPress={() => logout.mutate()}
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
