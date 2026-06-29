import { Text, View } from 'react-native';

import type { HomeSummary } from '../types';
import { AmountText } from '../../../shared/ui/AmountText';
import { Card } from '../../../shared/ui/Card';
import { Chip } from '../../../shared/ui/Chip';

type SummaryCardsProps = {
  summary: HomeSummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const items = [summary.netBalance, summary.owedToUser, summary.owedByUser];

  return (
    <View className="gap-3">
      {items.map((item) => (
        <Card key={item.id} variant="summary">
          <Text className="text-sm font-semibold text-neutral500">{item.title}</Text>
          <AmountText amount={item.amount} currency={item.currency} variant="summary" />
          <Chip label={item.detail} tone={item.tone} variant="summary" />
        </Card>
      ))}
    </View>
  );
}
