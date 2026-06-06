import { UserPlus } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { colors } from '../../../shared/theme/colors';

type CreateGroupCardProps = {
  onPress: () => void;
};

export function CreateGroupCard({ onPress }: CreateGroupCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Crear nuevo grupo"
      onPress={onPress}
      className="items-center gap-2 rounded-lg border-2 border-dashed border-neutral200 bg-white py-8"
    >
      <UserPlus color={colors.neutral900} size={28} />
      <Text className="text-sm font-bold tracking-wide text-neutral900">CREAR NUEVO GRUPO</Text>
    </Pressable>
  );
}
