import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { Card } from '../../../shared/ui/Card';
import { formatCurrency } from '../../../shared/utils/formatAmount';

type NetBalanceCardProps = {
  netBalance: number;
};

export function NetBalanceCard({ netBalance }: NetBalanceCardProps) {
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
      <View className="flex-row items-center justify-between p-5">
        <View className="flex-1 gap-1">
          <Text className="text-sm text-neutral500">Balance Neto Total</Text>
          <Text className={amountClassName}>{formatCurrency(netBalance)}</Text>
        </View>

        <View className={pillClassName}>
          <TrendIcon color={pillIconColor} size={16} />
          <Text className={pillTextClassName}>{pillLabel}</Text>
        </View>
      </View>
    </Card>
  );
}
