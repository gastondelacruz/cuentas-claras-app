import { Pressable, Text, View } from 'react-native';
import { Receipt, ShoppingBag, Ticket, Train, Utensils, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import type { HomeActivity, HomeActivityCategory } from '../types';
import { colors } from '../../../shared/theme/colors';
import { AmountText } from '../../../shared/ui/AmountText';
import { Card } from '../../../shared/ui/Card';

type RecentActivitySectionProps = {
  activities: HomeActivity[];
  onActivityPress: (groupId: string) => void;
};

const categoryIcon: Record<HomeActivityCategory, LucideIcon> = {
  food: Utensils,
  transport: Train,
  utilities: Zap,
  shopping: ShoppingBag,
  entertainment: Ticket,
  other: Receipt,
};

export function RecentActivitySection({ activities, onActivityPress }: RecentActivitySectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-lg font-bold text-neutral900">Actividad reciente</Text>
      <Card variant="activityList">
        {activities.map((activity, index) => {
          const Icon = categoryIcon[activity.category] ?? Receipt;

          return (
            <Pressable
              key={activity.id}
              accessibilityRole="button"
              accessibilityLabel={`Abrir grupo de ${activity.title}`}
              className={index > 0 ? 'flex-row items-center gap-3 border-t border-neutral200 p-4' : 'flex-row items-center gap-3 p-4'}
              onPress={() => onActivityPress(activity.groupId)}
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
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}
