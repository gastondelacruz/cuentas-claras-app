import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { Card } from '../../../shared/ui/Card';
import { formatCurrency } from '../../../shared/utils/formatAmount';

type NetBalanceCardProps = {
  currency?: string;
  netBalance: number;
  owedToYou?: number;
  youOwe?: number;
};

export function NetBalanceCard({ currency = 'ARS', netBalance, owedToYou = 0, youOwe = 0 }: NetBalanceCardProps) {
  const isPositive = netBalance >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const amountClassName = isPositive ? 'text-h1 font-bold text-success' : 'text-h1 font-bold text-debt';
  const pillClassName = isPositive
    ? 'flex-row items-center gap-1 rounded-full bg-primaryBg px-3 py-1'
    : 'flex-row items-center gap-1 rounded-full bg-debtBg px-3 py-1';
  const pillTextClassName = isPositive ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-debt';
  const pillIconColor = isPositive ? colors.success : colors.debt;
  const pillLabel = isPositive ? 'Te deben' : 'Debes';

  return (
    <Card>
      <View className="gap-4 p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-sm text-neutral500">Balance Neto Total</Text>
            <Text className={amountClassName}>{formatCurrency(netBalance, currency)}</Text>
          </View>

          <View className={pillClassName}>
            <TrendIcon color={pillIconColor} size={16} />
            <Text className={pillTextClassName}>{pillLabel}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-lg border border-neutral200 bg-white p-3">
            <Text className="text-sm text-neutral500">Te deben</Text>
            <Text className="mt-1 text-lg font-bold text-success">{formatCurrency(owedToYou, currency)}</Text>
          </View>
          <View className="flex-1 rounded-lg bg-debtBg p-3">
            <Text className="text-sm text-neutral500">Debes</Text>
            <Text className="mt-1 text-lg font-bold text-debt">{formatCurrency(youOwe, currency)}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
