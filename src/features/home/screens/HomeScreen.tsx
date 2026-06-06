import { Pressable, ScrollView, Text, View } from "react-native";
import { Plus } from "lucide-react-native";

import { ActiveGroupsSection } from "../components/ActiveGroupsSection";
import {
  HomeEmptyView,
  HomeErrorView,
  HomeLoadingView,
} from "../components/HomeStateViews";
import { RecentActivitySection } from "../components/RecentActivitySection";
import { SummaryCards } from "../components/SummaryCards";
import { useHomeData } from "../hooks/useHomeData";
import { colors } from "../../../shared/theme/colors";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";

export function HomeScreen() {
  const { data, isLoading, isError, error } = useHomeData();

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
        <ActiveGroupsSection groups={data.activeGroups} />
        <RecentActivitySection activities={data.recentActivity} />
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar gasto"
        className="absolute bottom-8 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary"
        onPress={() => undefined}
      >
        <Plus color={colors.white} size={30} />
      </Pressable>
    </ScreenContainer>
  );
}
