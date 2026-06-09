import { Check } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';

export type SelectOption = {
  id: string;
  label: string;
  sublabel?: string;
};

type SelectModalProps = {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  testID?: string;
};

export function SelectModal({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
  testID,
}: SelectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar selector"
        className="flex-1 justify-end bg-neutral900/40"
        onPress={onClose}
      >
        <Pressable
          className="gap-2 rounded-t-2xl bg-white px-5 pb-8 pt-4"
          onPress={() => undefined}
          testID={testID}
        >
          <Text className="pb-2 text-center text-lg font-bold text-neutral900">
            {title}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
            <View className="gap-2">
              {options.map((option) => {
                const selected = option.id === selectedId;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected }}
                    className={
                      selected
                        ? 'flex-row items-center gap-3 rounded-lg border border-primary bg-primary/10 px-4 py-4'
                        : 'flex-row items-center gap-3 rounded-lg border border-neutral200 bg-white px-4 py-4'
                    }
                    onPress={() => onSelect(option.id)}
                  >
                    <View className="flex-1">
                      <Text className="text-lg text-neutral900">{option.label}</Text>
                      {option.sublabel ? (
                        <Text className="text-sm text-neutral500">{option.sublabel}</Text>
                      ) : null}
                    </View>
                    {selected ? (
                      <Check color={colors.primary} size={22} strokeWidth={3} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
