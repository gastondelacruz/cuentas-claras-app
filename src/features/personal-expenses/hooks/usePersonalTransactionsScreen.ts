import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';

import type { MainTabParamList, RootStackParamList } from '../../../app/navigation/types';
import { getPersonalCategoryVisual } from '../constants/personalTransactionCategoryVisuals';
import type { PersonalTransactionSummaryResponseDto } from '../schemas/personalTransactionSchema';
import { computeDateRange } from '../utils/computeDateRange';
import { rememberMockEditablePersonalTransaction } from '../mocks/personalTransactionEditMock';
import { usePersonalTransactions } from './usePersonalTransactions';
import { usePersonalTransactionsSummary } from './usePersonalTransactionsSummary';
import type { PersonalTransactionDto } from '../schemas/personalTransactionSchema';
import type {
  PersonalTransactionChartSegment,
  PersonalTransactionRange,
  PersonalTransactionType,
} from '../types';

type PersonalTransactionsNavigation = BottomTabNavigationProp<MainTabParamList, 'PersonalExpenses'>;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

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
    .map((item) => {
      const length = DONUT_CIRCUMFERENCE * Math.min(item.percentage, 100) / 100;
      // Each slice uses the same color the category shows on the add-transaction
      // screen, so the chart legend and the category grid always match.
      const segment = {
        color: getPersonalCategoryVisual(type, item.category).color,
        dasharray: `${formatDashValue(length)} ${formatDashValue(DONUT_CIRCUMFERENCE - length)}`,
        ...(offset > 0 ? { dashoffset: `-${formatDashValue(offset)}` } : {}),
      };
      offset += length;
      return segment;
    });
}

const MONTHS_ES_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

function startOfDayIso(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  ).toISOString();
}

function endOfDayIso(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  ).toISOString();
}

function formatPeriodLabel(from: Date, to: Date) {
  const label = (d: Date) => `${d.getUTCDate()} ${MONTHS_ES_SHORT[d.getUTCMonth()]}`;
  return `${label(from)} – ${label(to)} ${to.getUTCFullYear()}`;
}

type PeriodRange = { from: Date; to: Date };

export function usePersonalTransactionsScreen() {
  const navigation = useNavigation<PersonalTransactionsNavigation>();
  const rootNavigation = navigation.getParent?.<RootNavigation>();
  const [type, setType] = useState<PersonalTransactionType>('expense');
  const [range, setRange] = useState<PersonalTransactionRange>('week');
  const [periodRange, setPeriodRange] = useState<PeriodRange | null>(null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const isPeriod = range === 'period';

  // Bug 7 fix: only send from/to to the backend for the custom "period" range.
  // For day/week/month/year the backend computes the window itself; sending our
  // own date-only bounds narrowed the window to nothing (e.g. "day" showed empty).
  const from = isPeriod && periodRange ? startOfDayIso(periodRange.from) : undefined;
  const to = isPeriod && periodRange ? endOfDayIso(periodRange.to) : undefined;

  const rangeLabel = useMemo(() => {
    if (isPeriod && periodRange) {
      return formatPeriodLabel(periodRange.from, periodRange.to);
    }
    return computeDateRange(range).rangeLabel;
  }, [isPeriod, periodRange, range]);

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

  function selectRange(nextRange: PersonalTransactionRange) {
    if (nextRange === 'period') {
      // The period range only becomes active once the user confirms dates.
      setIsPeriodModalOpen(true);
      return;
    }
    setRange(nextRange);
  }

  function applyPeriod(nextFrom: Date, nextTo: Date) {
    const [orderedFrom, orderedTo] =
      nextFrom.getTime() <= nextTo.getTime() ? [nextFrom, nextTo] : [nextTo, nextFrom];
    setPeriodRange({ from: orderedFrom, to: orderedTo });
    setRange('period');
    setIsPeriodModalOpen(false);
  }

  function closePeriodModal() {
    setIsPeriodModalOpen(false);
  }

  function navigateToAddTransaction() {
    rootNavigation?.navigate('AddPersonalTransaction', { type });
  }

  function navigateToEditTransaction(transaction: PersonalTransactionDto) {
    rememberMockEditablePersonalTransaction(transaction);
    rootNavigation?.navigate('AddPersonalTransaction', {
      type: transaction.type,
      transactionId: transaction.id,
    });
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
    selectRange,
    rangeLabel,
    periodRange,
    isPeriodModalOpen,
    applyPeriod,
    closePeriodModal,
    navigateToAddTransaction,
    navigateToEditTransaction,
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
