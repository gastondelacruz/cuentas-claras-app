import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { MainTabParamList, RootStackParamList } from "../../../app/navigation/types";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
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
  const { groups, netBalance } = useGroupsList();
  const [filter, setFilter] = useState<GroupsFilter>("all");

  const rootNavigation = navigation.getParent?.<RootNavigation>();

  const visibleGroups = groups.filter((group) => {
    if (filter === "owed") return group.balance > 0;
    if (filter === "owe") return group.balance < 0;
    return true;
  });

  return (
    <ScreenContainer>
      <AppTopBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-5 pb-28 pt-5"
      >
        <NetBalanceCard netBalance={netBalance} />

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

        <CreateGroupCard onPress={() => rootNavigation?.navigate("NewGroup")} />
      </ScrollView>

      <FloatingCreateMenu
        onCreateGroup={() => rootNavigation?.navigate("NewGroup")}
        onCreateExpense={() => rootNavigation?.navigate("AddExpense")}
      />
    </ScreenContainer>
  );
}
