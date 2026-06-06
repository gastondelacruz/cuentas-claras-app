import { Pressable, Text, View } from 'react-native';

export type GroupsFilter = 'all' | 'owed' | 'owe';

const options: { key: GroupsFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'owed', label: 'Me deben' },
  { key: 'owe', label: 'Debo' },
];

type GroupsFilterTabsProps = {
  value: GroupsFilter;
  onChange: (value: GroupsFilter) => void;
};

export function GroupsFilterTabs({ value, onChange }: GroupsFilterTabsProps) {
  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const isActive = option.key === value;
        const containerClassName = isActive
          ? 'rounded-full bg-primary px-4 py-2'
          : 'rounded-full border border-neutral200 bg-white px-4 py-2';
        const textClassName = isActive ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-neutral900';

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.key)}
            className={containerClassName}
          >
            <Text className={textClassName}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
