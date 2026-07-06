import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';
import { FloatingCreateMenu } from '../../../shared/ui/FloatingCreateMenu';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { useEmailVerificationGate } from '../../../shared/hooks/useEmailVerificationGate';
import { BalanceMiniCards } from '../components/BalanceMiniCards';
import { ExpenseRow } from '../components/ExpenseRow';
import { GroupActionButtons } from '../components/GroupActionButtons';
import { GroupDetailHeader } from '../components/GroupDetailHeader';
import { GroupTotalCard } from '../components/GroupTotalCard';
import { MemberBalanceBubble } from '../components/MemberBalanceBubble';
import { useGroupDetail } from '../hooks/useGroupDetail';
import { useGroupDetailActions } from '../hooks/useGroupDetailActions';

type GroupDetailRoute = RouteProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailNavigation = NativeStackNavigationProp<RootStackParamList>;

const RECENT_EXPENSES_LIMIT = 3;

export function GroupDetailScreen() {
  const navigation = useNavigation<GroupDetailNavigation>();
  const route = useRoute<GroupDetailRoute>();
  const { group, memberBalances, recentExpenses, totalExpensesCount, isLoading, isFetching } = useGroupDetail(route.params?.groupId);
  const { handleOpenSettings, handleOpenBalances } = useGroupDetailActions(group?.id ?? '');
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const { isEmailVerified, guard } = useEmailVerificationGate();

  if (!group && (isLoading || isFetching)) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-6" accessibilityRole="progressbar" accessibilityLabel="Cargando grupo">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text className="mt-4 text-base font-semibold text-neutral500">Cargando grupo...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!group) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center text-xl font-bold text-neutral900">Este grupo ya no está disponible</Text>
          <Text className="text-center text-base text-neutral600">
            Si lo eliminaste, no vas a poder volver a abrirlo en esta sesión.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            className="rounded-full bg-primary px-5 py-3"
          >
            <Text className="text-sm font-semibold text-white">Volver</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const canExpandExpenses = recentExpenses.length > RECENT_EXPENSES_LIMIT;
  const visibleExpenses =
    showAllExpenses || !canExpandExpenses
      ? recentExpenses
      : recentExpenses.slice(0, RECENT_EXPENSES_LIMIT);

  return (
    <ScreenContainer>
      <GroupDetailHeader
        groupName={group.name}
        settingsDisabled={!isEmailVerified}
        onPressSettings={() => guard(handleOpenSettings)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-28 pt-4">
        <View className="gap-4 px-4">
          <GroupTotalCard totalExpense={group.totalExpense} changePercent={group.totalExpenseChangePercent} />
          <BalanceMiniCards owedToYou={group.owedToYou} youOwe={group.youOwe} />
        </View>

        <GroupActionButtons
          onAddExpense={() => guard(() => navigation.navigate('AddExpense', { groupId: group.id }))}
          onSettleDebts={() => guard(handleOpenBalances)}
        />

        <View className="gap-3">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-lg font-bold text-neutral900">Balances</Text>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !isEmailVerified }} disabled={!isEmailVerified} onPress={() => guard(handleOpenBalances)}>
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
                  guard(() => navigation.navigate('AddExpense', { groupId: group.id, expenseId: expense.id }))
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
        disabled={!isEmailVerified}
        onCreateGroup={() => guard(() => navigation.navigate('NewGroup'))}
        onCreateExpense={() => guard(() => navigation.navigate('AddExpense', { groupId: group.id }))}
      />
    </ScreenContainer>
  );
}
