import { BarChart2, Landmark, PlusCircle, type LucideIcon } from 'lucide-react-native';
import { FlatList, Pressable, Text } from 'react-native';

import { colors } from '../../../shared/theme/colors';

type ActionVariant = 'solid' | 'outline';

type GroupAction = {
  key: string;
  label: string;
  Icon: LucideIcon;
  variant: ActionVariant;
  onPress: () => void;
};

const actions: GroupAction[] = [
  { key: 'add-expense', label: 'Añadir Gasto', Icon: PlusCircle, variant: 'solid', onPress: () => {} },
  { key: 'settle', label: 'Saldar Cuentas', Icon: Landmark, variant: 'outline', onPress: () => {} },
  { key: 'summary', label: 'Ver Resumen', Icon: BarChart2, variant: 'outline', onPress: () => {} },
];

export function GroupActionButtons() {
  return (
    <FlatList
      horizontal
      data={actions}
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 px-4"
      renderItem={({ item }) => {
        const isSolid = item.variant === 'solid';
        const containerClassName = isSolid
          ? 'flex-row items-center gap-2 rounded-full bg-primary px-4 py-2'
          : 'flex-row items-center gap-2 rounded-full border border-primary px-4 py-2';
        const textClassName = isSolid ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-primary';
        const iconColor = isSolid ? colors.white : colors.primary;

        return (
          <Pressable accessibilityRole="button" onPress={item.onPress} className={containerClassName}>
            <item.Icon color={iconColor} size={18} />
            <Text className={textClassName}>{item.label}</Text>
          </Pressable>
        );
      }}
    />
  );
}
