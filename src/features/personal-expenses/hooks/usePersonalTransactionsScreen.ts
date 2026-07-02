import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';

import type { MainTabParamList, RootStackParamList } from '../../../app/navigation/types';
import { computeDateRange } from '../utils/computeDateRange';
import { usePersonalTransactions } from './usePersonalTransactions';
import type { PersonalTransactionRange, PersonalTransactionType } from '../types';

type PersonalTransactionsNavigation = BottomTabNavigationProp<MainTabParamList, 'PersonalExpenses'>;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

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

  function navigateToAddTransaction() {
    rootNavigation?.navigate('AddPersonalTransaction', { type });
  }

  return {
    type,
    setType,
    range,
    setRange,
    rangeLabel,
    navigateToAddTransaction,
    ...transactionQuery,
  };
}
