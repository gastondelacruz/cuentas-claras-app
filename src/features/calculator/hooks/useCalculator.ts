import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { AccessibilityInfo } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../../app/navigation/types";
import {
	CalculatorKey,
	createCalculatorState,
	evaluateExpression,
	pressCalculatorKey,
} from "../calculatorEngine";

type CalculatorNavigation = NativeStackNavigationProp<
	RootStackParamList,
	"Calculator"
>;
type CalculatorRoute = RouteProp<RootStackParamList, "Calculator">;

export function useCalculator() {
	const navigation = useNavigation<CalculatorNavigation>();
	const route = useRoute<CalculatorRoute>();
	const insets = useSafeAreaInsets();
	const [state, setState] = useState(() =>
		createCalculatorState(route.params.initialAmount),
	);

	function pressKey(key: CalculatorKey) {
		setState((current) => {
			const next = pressCalculatorKey(current, key);
			if (key === "=" && next.error) {
				AccessibilityInfo.announceForAccessibility(next.error);
			} else if (key === "=" && next.canonicalResult) {
				AccessibilityInfo.announceForAccessibility(
					`Resultado ${next.canonicalResult}`,
				);
			}
			return next;
		});
	}

	function accept() {
		const result = evaluateExpression(state.expression);
		if (!result.ok) {
			setState((current) => ({
				...current,
				error: result.error,
				canonicalResult: undefined,
			}));
			AccessibilityInfo.announceForAccessibility(result.error);
			return;
		}

		navigation.popTo("AddPersonalTransaction", {
			...route.params.sourceParams,
			calculatorResult: result.canonical,
		});
	}

	function goBack() {
		navigation.goBack();
	}

	return {
		display: state.display,
		error: state.error,
		bottomInset: insets.bottom,
		pressKey,
		accept,
		goBack,
	};
}
