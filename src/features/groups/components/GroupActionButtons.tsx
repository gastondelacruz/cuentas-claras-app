import { Landmark, PlusCircle, type LucideIcon } from 'lucide-react-native';
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

type GroupActionButtonsProps = {
  onAddExpense: () => void;
  onSettleDebts: () => void;
};

export function GroupActionButtons({ onAddExpense, onSettleDebts }: GroupActionButtonsProps) {
  const actions: GroupAction[] = [
    { key: 'add-expense', label: 'Añadir Gasto', Icon: PlusCircle, variant: 'solid', onPress: onAddExpense },
    { key: 'settle', label: 'Saldar Cuentas', Icon: Landmark, variant: 'outline', onPress: onSettleDebts },
  ];

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
