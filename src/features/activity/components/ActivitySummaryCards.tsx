import { Text, View } from 'react-native';

import type { ActivitySummaryItem } from '../types';
import { formatCurrency } from '../../../shared/utils/formatAmount';
import { Card } from '../../../shared/ui/Card';

type ActivitySummaryCardsProps = {
  summary: ActivitySummaryItem[];
};

export function ActivitySummaryCards({ summary }: ActivitySummaryCardsProps) {
  return (
    <View className="flex-row gap-3">
      {summary.map((item) => (
        <Card key={item.id} variant="summary">
          <Text className="text-sm font-semibold text-neutral600">{item.title}</Text>
          <Text className={item.tone === 'success' ? 'mt-2 text-3xl font-bold text-success' : 'mt-2 text-3xl font-bold text-debt'}>
            {formatCurrency(item.amount)}
          </Text>
        </Card>
      ))}
    </View>
  );
}
