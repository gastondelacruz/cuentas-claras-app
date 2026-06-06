import { Pressable, ScrollView, Text, View } from 'react-native';
import { ClipboardList, Search } from 'lucide-react-native';

import { ActivityFeedSection } from '../components/ActivityFeedSection';
import { ActivitySummaryCards } from '../components/ActivitySummaryCards';
import { activityMock } from '../mocks/activity.mock';
import { colors } from '../../../shared/theme/colors';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';

export function ActivityScreen() {
  return (
    <ScreenContainer>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-6 px-5 pb-28 pt-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <ClipboardList color={colors.primary} size={28} strokeWidth={2.4} />
            <Text className="text-h1 font-bold text-primary">Actividad</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Buscar actividad" className="h-12 w-12 items-center justify-center rounded-full bg-white">
            <Search color={colors.neutral900} size={22} />
          </Pressable>
        </View>

        <ActivitySummaryCards summary={activityMock.summary} />

        {activityMock.sections.map((section) => (
          <ActivityFeedSection key={section.id} section={section} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
