import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';

import type { MainTabParamList, RootStackParamList } from '../../../app/navigation/types';
import type { PersonalTransactionSummaryResponseDto } from '../schemas/personalTransactionSchema';
import { computeDateRange } from '../utils/computeDateRange';
import { usePersonalTransactions } from './usePersonalTransactions';
import { usePersonalTransactionsSummary } from './usePersonalTransactionsSummary';
import type {
  PersonalTransactionChartSegment,
  PersonalTransactionRange,
  PersonalTransactionType,
} from '../types';

type PersonalTransactionsNavigation = BottomTabNavigationProp<MainTabParamList, 'PersonalExpenses'>;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const CHART_COLORS: Record<PersonalTransactionType, string[]> = {
  expense: ['#1b4332', '#116c4a', '#86d7ad', '#c1ecd4'],
  income: ['#116c4a', '#ffba27', '#a1f4c8', '#c1ecd4'],
};

const DONUT_CIRCUMFERENCE = 251.3;

function formatDashValue(value: number) {
  return value.toFixed(1).replace(/\.0$/, '');
}

function buildChartSegments(
  breakdown: PersonalTransactionSummaryResponseDto['breakdown'],
  type: PersonalTransactionType,
): PersonalTransactionChartSegment[] {
  let offset = 0;

  return breakdown
    .filter((item) => item.type === type && item.amount > 0 && item.percentage > 0)
    .map((item, index) => {
      const length = DONUT_CIRCUMFERENCE * Math.min(item.percentage, 100) / 100;
      const segment = {
        color: CHART_COLORS[type][index % CHART_COLORS[type].length],
        dasharray: `${formatDashValue(length)} ${formatDashValue(DONUT_CIRCUMFERENCE - length)}`,
        ...(offset > 0 ? { dashoffset: `-${formatDashValue(offset)}` } : {}),
      };
      offset += length;
      return segment;
    });
}

export function usePersonalTransactionsScreen() {
  const navigation = useNavigation<PersonalTransactionsNavigation>();
  const rootNavigation = navigation.getParent?.<RootNavigation>();
  const [type, setType] = useState<PersonalTransactionType>('expense');
  const [range, setRange] = useState<PersonalTransactionRange>('week');

  const { from, to, rangeLabel } = useMemo(() => computeDateRange(range), [range]);

  const transactionQuery = usePersonalTransactions({
    type,
    range,
    from,
    to,
  });
  const summaryQuery = usePersonalTransactionsSummary({
    range,
    from,
    to,
  });

  function navigateToAddTransaction() {
    rootNavigation?.navigate('AddPersonalTransaction', { type });
  }

  const shouldUseBackendTransactions = transactionQuery.hasFetchedTransactions;
  const summary = summaryQuery.summary;
  const shouldUseSummary = summaryQuery.hasFetchedSummary && summary !== undefined;
  const displayTransactions = shouldUseBackendTransactions
    ? transactionQuery.transactions
    : [];
  const displayTotal = shouldUseSummary
    ? type === 'income'
      ? summary.incomeTotal
      : summary.expenseTotal
    : 0;
  const displaySummaryTotal = shouldUseSummary
    ? summary.total
    : 0;
  const displaySummaryCurrency = shouldUseSummary
    ? summary.currency
    : 'ARS';
  const displayCurrency = shouldUseSummary
    ? summary.currency
    : 'ARS';
  const chartSegments = shouldUseSummary
    ? buildChartSegments(summary.breakdown, type)
    : [];

  return {
    type,
    setType,
    range,
    setRange,
    rangeLabel,
    navigateToAddTransaction,
    chartSegments,
    displayTransactions,
    displayTotal,
    displaySummaryTotal,
    displaySummaryCurrency,
    displayCurrency,
    isLoading: transactionQuery.isLoading || summaryQuery.isLoading,
    isError: transactionQuery.isError || summaryQuery.isError,
    error: transactionQuery.error ?? summaryQuery.error,
  };
}
