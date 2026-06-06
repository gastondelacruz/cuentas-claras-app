import { Image, ScrollView, Text, View } from 'react-native';

import type { HomeGroup } from '../types';
import { Avatar } from '../../../shared/ui/Avatar';
import { Card } from '../../../shared/ui/Card';

type ActiveGroupsSectionProps = {
  groups: HomeGroup[];
};

export function ActiveGroupsSection({ groups }: ActiveGroupsSectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-lg font-bold text-neutral900">Grupos activos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pr-6">
        {groups.map((group) => (
          <Card key={group.id} variant="groupPreview">
            <Image accessibilityLabel={group.name} className="h-32 w-full bg-neutral200" source={{ uri: group.coverUrl }} />
            <View className="gap-2 p-4">
              <Text className="text-sm font-semibold text-primary">{group.category}</Text>
              <Text className="text-lg font-bold text-neutral900">{group.name}</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {group.members.map((member, index) => (
                    <Avatar
                      key={member.id}
                      name={member.name}
                      initials={member.initials}
                      sourceUrl={member.avatarUrl}
                      overlap={index > 0}
                    />
                  ))}
                  {group.extraMembersCount > 0 ? (
                    <View className="-ml-3 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-neutral900">
                      <Text className="text-xs font-bold text-white">+{group.extraMembersCount}</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-sm font-semibold text-neutral500">{group.activeDebtsLabel}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
