import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { FloatingCreateMenu } from '../../../shared/ui/FloatingCreateMenu';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { BalanceMiniCards } from '../components/BalanceMiniCards';
import { ExpenseRow } from '../components/ExpenseRow';
import { GroupActionButtons } from '../components/GroupActionButtons';
import { GroupDetailHeader } from '../components/GroupDetailHeader';
import { GroupTotalCard } from '../components/GroupTotalCard';
import { MemberBalanceBubble } from '../components/MemberBalanceBubble';
import { useGroupDetail } from '../hooks/useGroupDetail';

type GroupDetailRoute = RouteProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailNavigation = NativeStackNavigationProp<RootStackParamList>;

// How many expenses the "Gastos Recientes" section shows before the list can be
// expanded to reveal the full set.
const RECENT_EXPENSES_LIMIT = 3;

export function GroupDetailScreen() {
  const navigation = useNavigation<GroupDetailNavigation>();
  const route = useRoute<GroupDetailRoute>();
  const { group, memberBalances, recentExpenses, totalExpensesCount } = useGroupDetail(route.params?.groupId);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  const canExpandExpenses = recentExpenses.length > RECENT_EXPENSES_LIMIT;
  const visibleExpenses =
    showAllExpenses || !canExpandExpenses
      ? recentExpenses
      : recentExpenses.slice(0, RECENT_EXPENSES_LIMIT);

  return (
    <ScreenContainer>
      <GroupDetailHeader groupName={group.name} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-28 pt-4">
        <View className="gap-4 px-4">
          <GroupTotalCard totalExpense={group.totalExpense} changePercent={group.totalExpenseChangePercent} />
          <BalanceMiniCards owedToYou={group.owedToYou} youOwe={group.youOwe} />
        </View>

        <GroupActionButtons />

        <View className="gap-3">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-lg font-bold text-neutral900">Balances</Text>
            <Pressable accessibilityRole="button" onPress={() => {}}>
              <Text className="text-sm text-primary">Ver quién debe a quién</Text>
            </Pressable>
          </View>

          <FlatList
            horizontal
            data={memberBalances}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4 px-4"
            renderItem={({ item }) => <MemberBalanceBubble member={item} onPress={() => {}} />}
          />
        </View>

        <View className="gap-3 px-4">
          <Text className="text-lg font-bold text-neutral900">Gastos Recientes</Text>

          <View className="gap-3">
            {visibleExpenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                testID={`group-expense-${expense.id}`}
                onPress={() =>
                  navigation.navigate('AddExpense', { groupId: group.id, expenseId: expense.id })
                }
              />
            ))}
          </View>

          {canExpandExpenses ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: showAllExpenses }}
              onPress={() => setShowAllExpenses((current) => !current)}
              className="items-center rounded-lg border border-dashed border-primary py-3"
              testID="group-expenses-toggle"
            >
              <Text className="text-sm text-primary">
                {showAllExpenses ? 'Ver menos' : `Ver los ${totalExpensesCount} gastos`}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <FloatingCreateMenu
        onCreateGroup={() => navigation.navigate('NewGroup')}
        onCreateExpense={() => navigation.navigate('AddExpense', { groupId: group.id })}
      />
    </ScreenContainer>
  );
}
