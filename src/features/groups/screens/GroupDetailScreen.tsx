import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

export function GroupDetailScreen() {
  const navigation = useNavigation<GroupDetailNavigation>();
  const route = useRoute<GroupDetailRoute>();
  const { group, memberBalances, recentExpenses, totalExpensesCount } = useGroupDetail(route.params?.groupId);

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
            {recentExpenses.map((expense) => (
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

          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            className="items-center rounded-lg border border-dashed border-primary py-3"
          >
            <Text className="text-sm text-primary">{`Ver los ${totalExpensesCount} gastos`}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <FloatingCreateMenu
        onCreateGroup={() => navigation.navigate('NewGroup')}
        onCreateExpense={() => navigation.navigate('AddExpense', { groupId: group.id })}
      />
    </ScreenContainer>
  );
}
