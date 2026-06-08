import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView } from "react-native";

import { MainTabParamList, RootStackParamList } from "../../../app/navigation/types";
import { ActiveGroupsSection } from "../components/ActiveGroupsSection";
import {
  HomeEmptyView,
  HomeErrorView,
  HomeLoadingView,
} from "../components/HomeStateViews";
import { RecentActivitySection } from "../components/RecentActivitySection";
import { SummaryCards } from "../components/SummaryCards";
import { useHomeData } from "../hooks/useHomeData";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { FloatingCreateMenu } from "../../../shared/ui/FloatingCreateMenu";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";

type HomeNavigation = BottomTabNavigationProp<MainTabParamList, "Home">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const { data, isLoading, isError, error } = useHomeData();

  const navigateToRootScreen = (screen: keyof RootStackParamList) => {
    navigation.getParent?.<RootNavigation>()?.navigate(screen);
  };

  const navigateToGroupDetail = (groupId: string) => {
    navigation.getParent?.<RootNavigation>()?.navigate("GroupDetail", { groupId });
  };

  const navigateToGroupsList = () => {
    navigation.navigate("GroupsList");
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <AppTopBar />
        <HomeLoadingView />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <AppTopBar />
        <HomeErrorView message={error?.message} />
      </ScreenContainer>
    );
  }

  const isEmpty =
    !data ||
    (data.activeGroups.length === 0 && data.recentActivity.length === 0);

  if (isEmpty) {
    return (
      <ScreenContainer>
        <AppTopBar />
        <HomeEmptyView />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppTopBar />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-5 pb-28 pt-6"
      >
        <SummaryCards summary={data.summary} />
        <ActiveGroupsSection
          groups={data.activeGroups}
          onGroupPress={navigateToGroupDetail}
          onViewAllPress={navigateToGroupsList}
        />
        <RecentActivitySection activities={data.recentActivity} onActivityPress={navigateToGroupDetail} />
      </ScrollView>

      <FloatingCreateMenu
        onCreateGroup={() => navigateToRootScreen("NewGroup")}
        onCreateExpense={() => navigateToRootScreen("AddExpense")}
      />
    </ScreenContainer>
  );
}
