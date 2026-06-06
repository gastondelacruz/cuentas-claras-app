import { Image, Text, View } from 'react-native';

import type { ActivityFeedItem, ActivitySection } from '../types';
import { colors } from '../../../shared/theme/colors';
import { formatAmount } from '../../../shared/utils/formatAmount';
import { Card } from '../../../shared/ui/Card';

type ActivityFeedSectionProps = {
  section: ActivitySection;
};

const iconClassNames: Record<ActivityFeedItem['iconTone'], string> = {
  success: 'bg-success',
  debt: 'bg-debt',
  primary: 'bg-primary',
};

function ActivityAvatar({ item }: { item: ActivityFeedItem }) {
  const Icon = item.icon;

  return (
    <View className="relative h-14 w-14">
      {item.actorAvatarUrl ? (
        <Image accessibilityLabel={item.actorName} className="h-12 w-12 rounded-full bg-neutral200" source={{ uri: item.actorAvatarUrl }} />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral200">
          <Text className="text-base font-bold text-primary">{item.actorInitials}</Text>
        </View>
      )}
      <View className={`absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-white ${iconClassNames[item.iconTone]}`}>
        <Icon color={colors.white} size={13} strokeWidth={2.5} />
      </View>
    </View>
  );
}

function ActivityMessage({ item }: { item: ActivityFeedItem }) {
  return (
    <View className="flex-1 gap-1">
      <View className="flex-row flex-wrap items-baseline gap-x-1">
        <Text className="font-bold text-neutral900">{item.actorName}</Text>
        <Text className="text-neutral700">{item.action}</Text>
        {item.subject ? <Text className="font-semibold text-primary">'{item.subject}'</Text> : null}
      </View>

      {typeof item.amount === 'number' ? (
        <Text className={item.amount >= 0 ? 'text-xl font-bold text-success' : 'text-xl font-bold text-neutral900'}>{formatAmount(item.amount)}</Text>
      ) : null}

      {item.tag ? (
        <View className="self-start rounded-md bg-success/10 px-2 py-1">
          <Text className="text-xs font-bold uppercase text-success">{item.tag}</Text>
        </View>
      ) : null}

      {item.quote ? <Text className="text-base italic text-neutral700">&quot;{item.quote}&quot;</Text> : null}
    </View>
  );
}

export function ActivityFeedSection({ section }: ActivityFeedSectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-bold uppercase tracking-wide text-neutral500">{section.title}</Text>
      <View className="gap-4">
        {section.items.map((item) => (
          <Card key={item.id} variant="activityList">
            <View className="flex-row gap-3 p-4">
              <ActivityAvatar item={item} />
              <ActivityMessage item={item} />
              <Text className="text-sm text-neutral500">{item.timeLabel}</Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
