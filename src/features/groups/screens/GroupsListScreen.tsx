import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search, WalletCards } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { CreateGroupCard } from '../components/CreateGroupCard';
import { GroupListCard } from '../components/GroupListCard';
import { GroupsFilter, GroupsFilterTabs } from '../components/GroupsFilterTabs';
import { NetBalanceCard } from '../components/NetBalanceCard';
import { useGroupsList } from '../hooks/useGroupsList';

type GroupsListNavigation = NativeStackNavigationProp<RootStackParamList>;

export function GroupsListScreen() {
  const navigation = useNavigation<GroupsListNavigation>();
  const { groups, netBalance } = useGroupsList();
  const [filter, setFilter] = useState<GroupsFilter>('all');

  const visibleGroups = groups.filter((group) => {
    if (filter === 'owed') return group.balance > 0;
    if (filter === 'owe') return group.balance < 0;
    return true;
  });

  return (
    <ScreenContainer>
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-5 px-5 pb-28 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <WalletCards color={colors.primary} size={28} />
              <Text className="text-h1 font-bold text-primary">Cuentas Claras</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buscar"
              className="h-11 w-11 items-center justify-center rounded-full bg-neutral200"
            >
              <Search color={colors.neutral900} size={22} />
            </Pressable>
          </View>

          <NetBalanceCard netBalance={netBalance} />

          <GroupsFilterTabs value={filter} onChange={setFilter} />

          <View className="gap-4">
            {visibleGroups.map((group) => (
              <GroupListCard
                key={group.id}
                group={group}
                onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
              />
            ))}
          </View>

          <CreateGroupCard onPress={() => navigation.navigate('NewGroup')} />
        </ScrollView>
      </SafeAreaView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Crear grupo"
        onPress={() => navigation.navigate('NewGroup')}
        className="absolute bottom-8 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary"
      >
        <Plus color={colors.white} size={30} />
      </Pressable>
    </ScreenContainer>
  );
}
