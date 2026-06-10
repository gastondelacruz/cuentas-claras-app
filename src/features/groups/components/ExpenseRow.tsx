import { Pressable, Text, View } from 'react-native';

import { Card } from '../../../shared/ui/Card';
import { formatCurrency } from '../../../shared/utils/formatAmount';
import { GroupExpense } from '../types';
import { categoryVisuals } from './expenseCategory';

type ExpenseRowProps = {
  expense: GroupExpense;
  onPress?: (expense: GroupExpense) => void;
  testID?: string;
};

export function ExpenseRow({ expense, onPress, testID }: ExpenseRowProps) {
  const { title, paidByLabel, timeLabel, totalAmount, category, userRelation } = expense;
  const { Icon, containerClassName, iconColor } = categoryVisuals[category];

  const content = (
    <View className="flex-row items-center gap-3 p-3">
        <View className={`h-10 w-10 items-center justify-center rounded-full ${containerClassName}`}>
          <Icon color={iconColor} size={20} />
        </View>

        <View className="flex-1">
          <Text numberOfLines={1} className="font-bold text-neutral900">
            {title}
          </Text>
          <Text numberOfLines={1} className="text-sm text-neutral500">
            {`${paidByLabel} • ${timeLabel}`}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-bold text-neutral900">{formatCurrency(totalAmount)}</Text>
          {userRelation.type === 'share' ? (
            <Text className="text-sm text-neutral500">{`Tu parte: ${formatCurrency(userRelation.amount)}`}</Text>
          ) : null}
          {userRelation.type === 'lent' ? (
            <Text className="text-sm font-bold text-success">{`Prestaste ${formatCurrency(userRelation.amount)}`}</Text>
          ) : null}
        </View>
      </View>
  );

  if (!onPress) {
    return <Card>{content}</Card>;
  }

  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Editar gasto ${title}`}
        onPress={() => onPress(expense)}
        testID={testID}
      >
        {content}
      </Pressable>
    </Card>
  );
}
