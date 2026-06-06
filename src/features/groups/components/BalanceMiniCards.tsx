import { Text, View } from 'react-native';

import { formatCurrency } from '../../../shared/utils/formatAmount';

type BalanceMiniCardsProps = {
  owedToYou: number;
  youOwe: number;
};

export function BalanceMiniCards({ owedToYou, youOwe }: BalanceMiniCardsProps) {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1 rounded-lg border border-neutral200 bg-white p-4">
        <Text className="text-sm text-neutral500">Te deben</Text>
        <Text className="mt-1 text-xl font-bold text-success">{formatCurrency(owedToYou)}</Text>
      </View>
      <View className="flex-1 rounded-lg bg-debtBg p-4">
        <Text className="text-sm text-neutral500">Debes</Text>
        <Text className="mt-1 text-xl font-bold text-debt">{formatCurrency(youOwe)}</Text>
      </View>
    </View>
  );
}
