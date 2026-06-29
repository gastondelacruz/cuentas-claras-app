import { ComponentProps } from 'react';
import { Text } from 'react-native';

import { formatAmount } from '../utils/formatAmount';

type AmountTextProps = Omit<ComponentProps<typeof Text>, 'className'> & {
  amount: number;
  currency?: string;
  variant?: 'default' | 'summary' | 'activity';
};

const amountTextClassNames = {
  default: {
    positive: 'text-success',
    negative: 'text-debt',
  },
  summary: {
    positive: 'mt-2 text-xl font-bold text-success',
    negative: 'mt-2 text-xl font-bold text-debt',
  },
  activity: {
    positive: 'font-bold text-success',
    negative: 'font-bold text-debt',
  },
};

export function AmountText({ amount, currency, variant = 'default', ...props }: AmountTextProps) {
  const tone = amount >= 0 ? 'positive' : 'negative';

  return (
    <Text className={amountTextClassNames[variant][tone]} {...props}>
      {formatAmount(amount, currency)}
    </Text>
  );
}
