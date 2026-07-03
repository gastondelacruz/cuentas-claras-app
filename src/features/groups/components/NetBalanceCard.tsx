import { Text, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { Card } from "../../../shared/ui/Card";
import { formatCurrency } from "../../../shared/utils/formatAmount";

type NetBalanceCardProps = {
  currency?: string;
  netBalance: number;
  owedToYou?: number;
  youOwe?: number;
};

export function NetBalanceCard({
  currency = "ARS",
  netBalance,
  owedToYou = 0,
  youOwe = 0,
}: NetBalanceCardProps) {
  const isPositive = netBalance >= 0;
  const amountClassName = isPositive
    ? "text-h1 font-bold text-success"
    : "text-h1 font-bold text-debt";

  return (
    <Card>
      <View className="gap-4 p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-sm text-neutral500">Balance Neto Total</Text>
            <Text className={amountClassName}>
              {formatCurrency(netBalance, currency)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-lg border border-neutral200 bg-white p-3">
            <Text className="text-sm text-neutral500">Te deben</Text>
            <Text className="mt-1 text-lg font-bold text-success">
              {formatCurrency(owedToYou, currency)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg bg-debtBg p-3">
            <Text className="text-sm text-neutral500">Debes</Text>
            <Text className="mt-1 text-lg font-bold text-debt">
              {formatCurrency(youOwe, currency)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
