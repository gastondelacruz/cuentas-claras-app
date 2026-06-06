import { ScrollView } from "react-native";

import { ActivityFeedSection } from "../components/ActivityFeedSection";
import { ActivitySummaryCards } from "../components/ActivitySummaryCards";
import { activityMock } from "../mocks/activity.mock";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";

export function ActivityScreen() {
  return (
    <ScreenContainer>
      <AppTopBar />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-5 pb-28 pt-6"
      >
        <ActivitySummaryCards summary={activityMock.summary} />

        {activityMock.sections.map((section) => (
          <ActivityFeedSection key={section.id} section={section} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
