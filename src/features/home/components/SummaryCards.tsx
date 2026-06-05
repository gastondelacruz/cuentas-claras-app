import { Text, View } from 'react-native';

import type { HomeSummary } from '../types';
import { AmountText } from '../../../shared/ui/AmountText';
import { Card } from '../../../shared/ui/Card';
import { Chip } from '../../../shared/ui/Chip';

type SummaryCardsProps = {
  summary: HomeSummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const items = [summary.owedToUser, summary.owedByUser];

  return (
    <View className="flex-row gap-3">
      {items.map((item) => (
        <Card key={item.id} variant="summary">
          <Text className="text-sm font-semibold text-neutral500">{item.title}</Text>
          <AmountText amount={item.amount} variant="summary" />
          <Chip label={item.detail} tone={item.amount >= 0 ? 'success' : 'debt'} variant="summary" />
        </Card>
      ))}
    </View>
  );
}
