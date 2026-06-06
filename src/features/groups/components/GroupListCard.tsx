import { Pressable, Text, View } from 'react-native';

import { AmountText } from '../../../shared/ui/AmountText';
import { Card } from '../../../shared/ui/Card';
import { Chip } from '../../../shared/ui/Chip';
import { GroupListItem, GroupStatus } from '../types';
import { groupCategoryVisuals } from './groupCategory';
import { MemberAvatarStack } from './MemberAvatarStack';

type GroupListCardProps = {
  group: GroupListItem;
  onPress: () => void;
};

type StatusChip = {
  label: string;
  tone: 'neutral' | 'success' | 'debt';
};

function resolveStatusChip(status: GroupStatus): StatusChip {
  switch (status.type) {
    case 'settled':
      return { label: 'Saldado', tone: 'success' };
    case 'pending':
      return { label: `${status.count} ${status.count === 1 ? 'Pendiente' : 'Pendientes'}`, tone: 'debt' };
    case 'recent':
      return { label: 'Reciente', tone: 'neutral' };
  }
}

export function GroupListCard({ group, onPress }: GroupListCardProps) {
  const { name, description, category, status, members, extraMembersCount, balance } = group;
  const { Icon, containerClassName, iconColor } = groupCategoryVisuals[category];
  const statusChip = resolveStatusChip(status);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <View className="gap-3 p-4">
          <View className="flex-row items-start justify-between">
            <View className={`h-12 w-12 items-center justify-center rounded-lg ${containerClassName}`}>
              <Icon color={iconColor} size={24} />
            </View>
            <Chip label={statusChip.label} tone={statusChip.tone} />
          </View>

          <View className="gap-1">
            <Text numberOfLines={1} className="text-lg font-bold text-neutral900">
              {name}
            </Text>
            <Text numberOfLines={1} className="text-sm text-neutral500">
              {description}
            </Text>
          </View>

          <View className="flex-row items-end justify-between">
            <MemberAvatarStack members={members} extraCount={extraMembersCount} />
            <View className="items-end">
              <Text className="text-sm text-neutral500">Balance</Text>
              <AmountText amount={balance} variant="activity" />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
