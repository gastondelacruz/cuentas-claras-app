import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  TrendingUp,
  WalletCards,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../../shared/theme/colors";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { usePersonalTransactionsScreen } from "../hooks/usePersonalTransactionsScreen";
import type {
  PersonalTransactionRange,
  PersonalTransactionType,
} from "../types";

const TRANSACTION_TABS: Array<{
  value: PersonalTransactionType;
  label: string;
}> = [
  { value: "expense", label: "GASTOS" },
  { value: "income", label: "INGRESOS" },
];

const RANGE_FILTERS: Array<{
  value: PersonalTransactionRange;
  label: string;
  testID: string;
}> = [
  { value: "day", label: "Día", testID: "personal-range-day" },
  { value: "week", label: "Semana", testID: "personal-range-week" },
  { value: "month", label: "Mes", testID: "personal-range-month" },
  { value: "year", label: "Año", testID: "personal-range-year" },
  { value: "period", label: "Período", testID: "personal-range-period" },
];

const PRIMARY = colors.primary; // #0E7A3A
const GRAY = colors.neutral500; // #6B7280
const DARK = colors.neutral900; // #111827

function formatTotal(value: number, currency: string) {
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value);
  return currency === "ARS" ? `${formatted} $` : `${formatted} ${currency}`;
}

function getEmptyMessage(
  type: PersonalTransactionType,
  range: PersonalTransactionRange,
) {
  const periodLabel = range === "week" ? "esta semana" : "en este período";
  return type === "income"
    ? `No hubo ingresos ${periodLabel}`
    : `No hubo gastos ${periodLabel}`;
}

export function PersonalTransactionsScreen() {
  const {
    type,
    setType,
    range,
    setRange,
    rangeLabel,
    total,
    currency,
    transactions,
    isLoading,
    isError,
    navigateToAddTransaction,
  } = usePersonalTransactionsScreen();

  return (
    <ScreenContainer style={{ backgroundColor: "#f9f9fc" }}>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#f9f9fc" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ffffff",
            paddingHorizontal: 16,
            paddingVertical: 12,
            height: 56,
          }}
        >
          {/* Logo mark */}
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: colors.primaryBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WalletCards color={PRIMARY} size={18} strokeWidth={2.4} />
          </View>

          {/* App name */}
          <Text
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 17,
              fontWeight: "700",
              color: DARK,
            }}
          >
            Cuentas Claras
          </Text>

          {/* Search action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            hitSlop={8}
            style={{ padding: 6 }}
          >
            <Search color={GRAY} size={20} strokeWidth={2} />
          </Pressable>

          {/* Settings action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Configuración"
            hitSlop={8}
            style={{ padding: 6, marginLeft: 4 }}
          >
            <Settings color={GRAY} size={20} strokeWidth={2} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Total section ───────────────────────────────────────────────────── */}
      <View
        testID="personal-transactions-total"
        style={{
          alignItems: "center",
          paddingTop: 24,
          paddingBottom: 20,
          gap: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TrendingUp color={GRAY} size={14} strokeWidth={1.8} />
          <Text style={{ fontSize: 12, color: GRAY }}>Total •</Text>
        </View>
        <Text
          selectable
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: DARK,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatTotal(total, currency)}
        </Text>
      </View>

      {/* ── Card: tabs, filters, date nav and content ─────────────────────────── */}
      <View
        testID="personal-transactions-card"
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
        >
          {/* ── Tabs: GASTOS | INGRESOS ───────────────────────────────────────── */}
          <View
          accessibilityRole="tablist"
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
            marginHorizontal: 16,
          }}
        >
          {TRANSACTION_TABS.map((tab) => {
            const selected = tab.value === type;
            return (
              <Pressable
                key={tab.value}
                accessibilityRole="tab"
                accessibilityLabel={
                  tab.label === "GASTOS"
                    ? "Ver gastos personales"
                    : "Ver ingresos personales"
                }
                accessibilityState={{ selected }}
                onPress={() => setType(tab.value)}
                testID={`personal-tab-${tab.value}`}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: selected ? 2 : 0,
                  borderBottomColor: selected ? PRIMARY : "transparent",
                  marginBottom: -1,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    color: selected ? PRIMARY : GRAY,
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Range filters ───────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingTop: 12,
            gap: 4,
          }}
        >
          {RANGE_FILTERS.map((filter) => {
            const selected = filter.value === range;
            return (
              <Pressable
                key={filter.value}
                accessibilityRole="button"
                accessibilityLabel={`Filtro ${filter.label}`}
                accessibilityState={{ selected }}
                onPress={() => setRange(filter.value)}
                testID={filter.testID}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderBottomWidth: selected ? 2 : 0,
                  borderBottomColor: selected ? DARK : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: selected ? DARK : GRAY,
                  }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Date navigation row ─────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            gap: 16,
          }}
        >
          <ChevronLeft color={GRAY} size={18} strokeWidth={2} />
          <Text style={{ fontSize: 14, color: DARK }}>{rangeLabel}</Text>
          <ChevronRight color={GRAY} size={18} strokeWidth={2} />
        </View>

        {/* ── Content area ────────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16 }}>
          {isLoading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                paddingVertical: 64,
              }}
              accessibilityRole="progressbar"
              accessibilityLabel="Cargando transacciones personales"
            >
              <ActivityIndicator color={PRIMARY} size="large" />
              <Text style={{ fontSize: 14, color: GRAY }}>
                Cargando movimientos...
              </Text>
            </View>
          ) : isError ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                paddingVertical: 64,
              }}
              accessibilityRole="alert"
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: DARK,
                  textAlign: "center",
                }}
              >
                No pudimos cargar tus movimientos
              </Text>
              <Text style={{ fontSize: 14, color: GRAY, textAlign: "center" }}>
                Intentá nuevamente en unos minutos.
              </Text>
            </View>
          ) : transactions.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 64,
                gap: 16,
              }}
            >
              {/* Decorative circular element */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: "#E5E7EB",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.4,
                }}
              >
                <TrendingUp color={GRAY} size={32} strokeWidth={1.5} />
              </View>
              <Text style={{ fontSize: 14, color: GRAY, textAlign: "center" }}>
                {getEmptyMessage(type, range)}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "700", color: DARK }}
                  >
                    {transaction.category}
                  </Text>
                  <Text selectable style={{ fontSize: 14, color: GRAY }}>
                    {formatTotal(transaction.amount, transaction.currency)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        </ScrollView>
      </View>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Añadir transacción personal"
        onPress={navigateToAddTransaction}
        testID="add-personal-transaction-fab"
        style={{
          position: "absolute",
          bottom: 24,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: PRIMARY,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Plus color={colors.white} size={24} strokeWidth={2.6} />
      </Pressable>
    </ScreenContainer>
  );
}
