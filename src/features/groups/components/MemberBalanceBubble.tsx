import { Pressable, Text, View } from 'react-native';

import { AmountText } from '../../../shared/ui/AmountText';
import { Avatar } from '../../../shared/ui/Avatar';
import { MemberBalance } from '../types';

type MemberBalanceBubbleProps = {
  member: MemberBalance;
  onPress?: () => void;
};

export function MemberBalanceBubble({ member, onPress }: MemberBalanceBubbleProps) {
  const { name, initials, avatarUrl, isCurrentUser, balance } = member;
  const showAccentFallback = isCurrentUser && !avatarUrl;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="w-20 items-center gap-1">
      {showAccentFallback ? (
        <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent">
          <Text className="text-xs font-bold text-white">{initials}</Text>
        </View>
      ) : (
        <Avatar name={name} initials={initials} sourceUrl={avatarUrl ?? undefined} />
      )}

      <Text numberOfLines={1} className="text-sm text-neutral900">
        {name}
      </Text>
      <AmountText amount={balance} />
    </Pressable>
  );
}
