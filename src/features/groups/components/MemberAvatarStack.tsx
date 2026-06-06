import { Text, View } from 'react-native';

import { Avatar } from '../../../shared/ui/Avatar';
import { GroupMemberPreview } from '../types';

type MemberAvatarStackProps = {
  members: GroupMemberPreview[];
  extraCount: number;
};

export function MemberAvatarStack({ members, extraCount }: MemberAvatarStackProps) {
  return (
    <View className="flex-row items-center">
      {members.map((member, index) => (
        <Avatar
          key={member.id}
          name={member.name}
          initials={member.initials}
          sourceUrl={member.avatarUrl ?? undefined}
          overlap={index > 0}
        />
      ))}

      {extraCount > 0 ? (
        <View className="-ml-3 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-neutral200">
          <Text className="text-xs font-bold text-neutral500">{`+${extraCount}`}</Text>
        </View>
      ) : null}
    </View>
  );
}
