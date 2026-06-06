import { Text, View } from 'react-native';
import { Train, Utensils, Zap } from 'lucide-react-native';

import type { HomeActivity } from '../types';
import { colors } from '../../../shared/theme/colors';
import { AmountText } from '../../../shared/ui/AmountText';
import { Card } from '../../../shared/ui/Card';

type RecentActivitySectionProps = {
  activities: HomeActivity[];
};

const categoryIcon = {
  food: Utensils,
  transport: Train,
  utilities: Zap,
};

export function RecentActivitySection({ activities }: RecentActivitySectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-lg font-bold text-neutral900">Actividad reciente</Text>
      <Card variant="activityList">
        {activities.map((activity, index) => {
          const Icon = categoryIcon[activity.category];

          return (
            <View
              key={activity.id}
              className={index > 0 ? 'flex-row items-center gap-3 border-t border-neutral200 p-4' : 'flex-row items-center gap-3 p-4'}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-neutral100">
                <Icon color={colors.primary} size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-neutral900">{activity.title}</Text>
                <Text className="mt-1 text-sm text-neutral500">{activity.context}</Text>
              </View>
              <View className="items-end">
                <AmountText amount={activity.amount} variant="activity" />
                <Text className="mt-1 text-xs text-neutral500">{activity.timeLabel}</Text>
              </View>
            </View>
          );
        })}
      </Card>
    </View>
  );
}
