import { Text, View } from "react-native";

import {
	PERSONAL_EXPENSE_TYPE_BADGE_COLORS,
	PERSONAL_EXPENSE_TYPE_LABELS,
} from "../constants/personalExpenseTypeVisuals";
import { resolvePersonalExpenseType } from "../utils/personalExpenseType";
import type { PersonalExpenseType } from "../types";

type PersonalExpenseTypeBadgeProps = {
	expenseKind?: PersonalExpenseType | null;
};

export function PersonalExpenseTypeBadge({
	expenseKind,
}: PersonalExpenseTypeBadgeProps) {
	const resolvedType = resolvePersonalExpenseType(expenseKind);
	const colors = PERSONAL_EXPENSE_TYPE_BADGE_COLORS[resolvedType];

	return (
		<View
			accessibilityRole="text"
			style={{
				alignSelf: "flex-start",
				borderRadius: 999,
				paddingHorizontal: 8,
				paddingVertical: 3,
				backgroundColor: colors.backgroundColor,
			}}
		>
			<Text
				style={{
					fontSize: 10,
					lineHeight: 14,
					fontWeight: "700",
					letterSpacing: 0.6,
					color: colors.textColor,
				}}
			>
				{PERSONAL_EXPENSE_TYPE_LABELS[resolvedType].toUpperCase()}
			</Text>
		</View>
	);
}
