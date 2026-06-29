import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { MainTabParamList, RootStackParamList } from "../../../app/navigation/types";
import { colors } from "../../../shared/theme/colors";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FloatingCreateMenu } from "../../../shared/ui/FloatingCreateMenu";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { CreateGroupCard } from "../components/CreateGroupCard";
import { GroupListCard } from "../components/GroupListCard";
import { GroupsFilter, GroupsFilterTabs } from "../components/GroupsFilterTabs";
import { NetBalanceCard } from "../components/NetBalanceCard";
import { useGroupsList } from "../hooks/useGroupsList";

type GroupsListNavigation = BottomTabNavigationProp<MainTabParamList, "GroupsList">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function GroupsListScreen() {
  const navigation = useNavigation<GroupsListNavigation>();
  const { groups, netBalance, owedToYou, youOwe, currency, isLoading, isError } = useGroupsList();
  const [filter, setFilter] = useState<GroupsFilter>("all");

  const rootNavigation = navigation.getParent?.<RootNavigation>();
  const navigateToNewGroup = () => rootNavigation?.navigate("NewGroup");

  const visibleGroups = groups.filter((group) => {
    if (filter === "owed") return group.balance > 0;
    if (filter === "owe") return group.balance < 0;
    return true;
  });

  return (
    <ScreenContainer>
      <AppTopBar />
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-6" accessibilityRole="progressbar" accessibilityLabel="Cargando grupos">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text className="mt-4 text-base font-semibold text-neutral500">Cargando grupos...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-7 pb-12 pt-8" accessibilityRole="alert">
          <Text className="text-center text-3xl font-bold text-neutral900">No pudimos cargar tus grupos</Text>
          <Text className="text-center text-base leading-6 text-neutral600">Intentá nuevamente en unos minutos.</Text>
        </View>
      ) : groups.length === 0 ? (
        <EmptyState
          buttonLabel="Crear un Grupo"
          description="Crea tu primer grupo para empezar a dividir gastos con tus amigos."
          onPress={navigateToNewGroup}
          title="Aún no tienes movimientos"
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-5 px-5 pb-28 pt-5"
        >
          <NetBalanceCard currency={currency} netBalance={netBalance} owedToYou={owedToYou} youOwe={youOwe} />

          <GroupsFilterTabs value={filter} onChange={setFilter} />

          <View className="gap-4">
            {visibleGroups.map((group) => (
              <GroupListCard
                key={group.id}
                group={group}
                onPress={() =>
                  rootNavigation?.navigate("GroupDetail", { groupId: group.id })
                }
              />
            ))}
          </View>

          <CreateGroupCard onPress={navigateToNewGroup} />
        </ScrollView>
      )}

      {!isLoading && !isError && groups.length > 0 ? (
        <FloatingCreateMenu
          onCreateGroup={navigateToNewGroup}
          onCreateExpense={() => rootNavigation?.navigate("AddExpense")}
        />
      ) : null}
    </ScreenContainer>
  );
}
