import { Pressable, Text, View } from "react-native";

import {
	PERSONAL_EXPENSE_TYPE_FILTER_COLORS,
	PERSONAL_EXPENSE_TYPE_FILTER_OPTIONS,
} from "../constants/personalExpenseTypeVisuals";
import type { PersonalExpenseTypeFilter } from "../types";

type PersonalExpenseTypeFilterChipsProps = {
	value: PersonalExpenseTypeFilter;
	onChange: (value: PersonalExpenseTypeFilter) => void;
};

export function PersonalExpenseTypeFilterChips({
	value,
	onChange,
}: PersonalExpenseTypeFilterChipsProps) {
	return (
		<View
			testID="personal-expense-type-filters"
			style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
		>
			{PERSONAL_EXPENSE_TYPE_FILTER_OPTIONS.map((option) => {
				const selected = option.value === value;
				return (
					<Pressable
						key={option.value}
						accessibilityRole="button"
						accessibilityLabel={`Filtrar gastos ${option.label.toLowerCase()}`}
						accessibilityState={{ selected }}
						onPress={() => onChange(option.value)}
						testID={option.testID}
						style={{
							borderRadius: 999,
							paddingHorizontal: 12,
							paddingVertical: 6,
							backgroundColor: selected
								? PERSONAL_EXPENSE_TYPE_FILTER_COLORS.selectedBackgroundColor
								: PERSONAL_EXPENSE_TYPE_FILTER_COLORS.unselectedBackgroundColor,
						}}
					>
						<Text
							style={{
								fontSize: 12,
								fontWeight: "600",
								color: selected
									? PERSONAL_EXPENSE_TYPE_FILTER_COLORS.selectedTextColor
									: PERSONAL_EXPENSE_TYPE_FILTER_COLORS.unselectedTextColor,
							}}
						>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
