import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { Card } from '../../../shared/ui/Card';
import { formatCurrency } from '../../../shared/utils/formatAmount';

type GroupTotalCardProps = {
  totalExpense: number;
  changePercent: number;
};

export function GroupTotalCard({ totalExpense, changePercent }: GroupTotalCardProps) {
  const isPositive = changePercent >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendIconColor = isPositive ? colors.primary : colors.debt;
  const trendTextClassName = isPositive ? 'text-sm text-primary' : 'text-sm text-debt';
  const changeLabel = `${isPositive ? '+' : ''}${changePercent}% vs. la semana pasada`;

  return (
    <Card>
      <View className="p-4">
        <Text className="text-sm text-neutral500">Gasto Total del Grupo</Text>
        <Text className="mt-1 text-h1 font-bold text-neutral900">{formatCurrency(totalExpense)}</Text>
        <View className="mt-2 flex-row items-center gap-1">
          <TrendIcon color={trendIconColor} size={16} />
          <Text className={trendTextClassName}>{changeLabel}</Text>
        </View>
      </View>
    </Card>
  );
}
