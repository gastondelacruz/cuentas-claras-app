import { Pressable, Text, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { PERSONAL_EXPENSE_TYPE_LABELS } from "../constants/personalExpenseTypeVisuals";
import type { PersonalExpenseType } from "../types";

const GRAY = colors.neutral500;
const DARK = colors.neutral900;
const BORDER = "#e5e7eb";
const SELECTED_BACKGROUND = "#b8ebc9";
const SELECTED_TEXT = "#1b6a49";

const OPTIONS: PersonalExpenseType[] = ["variable", "fixed"];

type PersonalExpenseTypeSelectorProps = {
	value: PersonalExpenseType;
	onChange: (value: PersonalExpenseType) => void;
};

export function PersonalExpenseTypeSelector({
	value,
	onChange,
}: PersonalExpenseTypeSelectorProps) {
	return (
		<View
			testID="personal-expense-type-selector"
			style={{ paddingHorizontal: 16, paddingTop: 16 }}
		>
			<Text
				style={{
					fontSize: 12,
					fontWeight: "600",
					color: GRAY,
					marginBottom: 8,
				}}
			>
				Tipo de Gasto
			</Text>
			<View
				accessibilityRole="tablist"
				style={{
					flexDirection: "row",
					overflow: "hidden",
					borderRadius: 8,
					backgroundColor: "#f3f4f6",
					borderWidth: 1,
					borderColor: BORDER,
				}}
			>
				{OPTIONS.map((option) => {
					const selected = option === value;
					return (
						<Pressable
							key={option}
							accessibilityRole="tab"
							accessibilityLabel={
								option === "variable"
									? "Seleccionar gasto variable"
									: "Seleccionar gasto fijo"
							}
							accessibilityState={{ selected }}
							onPress={() => onChange(option)}
							testID={`personal-expense-type-${option}`}
							style={{
								flex: 1,
								alignItems: "center",
								paddingVertical: 8,
								backgroundColor: selected ? SELECTED_BACKGROUND : "transparent",
							}}
						>
							<Text
								style={{
									fontSize: 13,
									fontWeight: "600",
									color: selected ? SELECTED_TEXT : DARK,
								}}
							>
								{PERSONAL_EXPENSE_TYPE_LABELS[option]}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
