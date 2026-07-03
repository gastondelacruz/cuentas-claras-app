import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { MainTabParamList, RootStackParamList } from "../../../app/navigation/types";
import { colors } from "../../../shared/theme/colors";
import { isEnhancedInitialLoadingEnabled } from "../../../shared/feature-flags/initialLoadingFlags";
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

function SkeletonBlock({ className }: { className: string }) {
  return <View className={`bg-neutral200 ${className}`} />;
}

function GroupsListSkeleton() {
  return (
    <ScrollView
      testID="groups-loading-skeleton"
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando grupos"
      accessibilityState={{ busy: true }}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-5 px-5 pb-28 pt-5"
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="gap-5"
      >
        <View className="rounded-3xl bg-white p-5">
          <SkeletonBlock className="h-4 w-36 rounded-full" />
          <SkeletonBlock className="mt-4 h-9 w-44 rounded-full" />
          <View className="mt-5 flex-row gap-3">
            <SkeletonBlock className="h-16 flex-1 rounded-2xl" />
            <SkeletonBlock className="h-16 flex-1 rounded-2xl" />
          </View>
        </View>

        <View className="flex-row gap-3">
          <SkeletonBlock className="h-10 flex-1 rounded-full" />
          <SkeletonBlock className="h-10 flex-1 rounded-full" />
          <SkeletonBlock className="h-10 flex-1 rounded-full" />
        </View>

        <View className="gap-4">
          {[0, 1, 2].map((item) => (
            <View key={item} className="rounded-3xl bg-white p-5">
              <View className="flex-row items-center gap-3">
                <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                <View className="flex-1 gap-2">
                  <SkeletonBlock className="h-4 w-2/3 rounded-full" />
                  <SkeletonBlock className="h-3 w-1/2 rounded-full" />
                </View>
                <SkeletonBlock className="h-5 w-20 rounded-full" />
              </View>
            </View>
          ))}
        </View>

        <View className="rounded-3xl border border-dashed border-neutral300 bg-white p-5">
          <SkeletonBlock className="h-4 w-40 rounded-full" />
          <SkeletonBlock className="mt-3 h-3 w-56 rounded-full" />
        </View>
      </View>
    </ScrollView>
  );
}

export function GroupsListScreen() {
  const navigation = useNavigation<GroupsListNavigation>();
  const { groups, netBalance, owedToYou, youOwe, currency, isLoading, isError } = useGroupsList();
  const [filter, setFilter] = useState<GroupsFilter>("all");
  const useSkeletonLoading = isEnhancedInitialLoadingEnabled();

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
      {isLoading && useSkeletonLoading ? (
        <GroupsListSkeleton />
      ) : isLoading ? (
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
