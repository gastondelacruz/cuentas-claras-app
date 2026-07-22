import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import type { CalculatorKey } from "../calculatorEngine";
import { useCalculator } from "../hooks/useCalculator";

type KeyConfig = {
	key: CalculatorKey;
	label: string;
	accessibilityLabel: string;
	testId: string;
	kind: "clear" | "number" | "operator" | "equals";
};

const KEYS: KeyConfig[] = [
	{
		key: "clear",
		label: "C",
		accessibilityLabel: "Limpiar operación",
		testId: "clear",
		kind: "clear",
	},
	{
		key: "backspace",
		label: "⌫",
		accessibilityLabel: "Borrar último carácter",
		testId: "backspace",
		kind: "clear",
	},
	{
		key: "%",
		label: "%",
		accessibilityLabel: "Porcentaje",
		testId: "percent",
		kind: "operator",
	},
	{
		key: "÷",
		label: "÷",
		accessibilityLabel: "Dividir",
		testId: "divide",
		kind: "operator",
	},
	{
		key: "7",
		label: "7",
		accessibilityLabel: "Siete",
		testId: "7",
		kind: "number",
	},
	{
		key: "8",
		label: "8",
		accessibilityLabel: "Ocho",
		testId: "8",
		kind: "number",
	},
	{
		key: "9",
		label: "9",
		accessibilityLabel: "Nueve",
		testId: "9",
		kind: "number",
	},
	{
		key: "×",
		label: "×",
		accessibilityLabel: "Multiplicar",
		testId: "multiply",
		kind: "operator",
	},
	{
		key: "4",
		label: "4",
		accessibilityLabel: "Cuatro",
		testId: "4",
		kind: "number",
	},
	{
		key: "5",
		label: "5",
		accessibilityLabel: "Cinco",
		testId: "5",
		kind: "number",
	},
	{
		key: "6",
		label: "6",
		accessibilityLabel: "Seis",
		testId: "6",
		kind: "number",
	},
	{
		key: "-",
		label: "−",
		accessibilityLabel: "Restar",
		testId: "subtract",
		kind: "operator",
	},
	{
		key: "1",
		label: "1",
		accessibilityLabel: "Uno",
		testId: "1",
		kind: "number",
	},
	{
		key: "2",
		label: "2",
		accessibilityLabel: "Dos",
		testId: "2",
		kind: "number",
	},
	{
		key: "3",
		label: "3",
		accessibilityLabel: "Tres",
		testId: "3",
		kind: "number",
	},
	{
		key: "+",
		label: "+",
		accessibilityLabel: "Sumar",
		testId: "add",
		kind: "operator",
	},
	{
		key: "()",
		label: "()",
		accessibilityLabel: "Abrir o cerrar paréntesis",
		testId: "parentheses",
		kind: "number",
	},
	{
		key: "0",
		label: "0",
		accessibilityLabel: "Cero",
		testId: "0",
		kind: "number",
	},
	{
		key: ".",
		label: ".",
		accessibilityLabel: "Separador decimal",
		testId: "decimal",
		kind: "number",
	},
	{
		key: "=",
		label: "=",
		accessibilityLabel: "Calcular resultado",
		testId: "equals",
		kind: "equals",
	},
];

const DARK_GREEN = "#1b4332";
const OUTLINE = "#c1c8c2";
const SURFACE_HIGH = "#e7e8e9";
const ERROR_CONTAINER = "#ffdad6";

function keyColors(kind: KeyConfig["kind"]) {
	if (kind === "clear")
		return { backgroundColor: ERROR_CONTAINER, color: colors.error };
	if (kind === "equals")
		return { backgroundColor: DARK_GREEN, color: colors.white };
	if (kind === "operator")
		return { backgroundColor: SURFACE_HIGH, color: colors.neutral900 };
	return { backgroundColor: colors.white, color: colors.neutral900 };
}

export function CalculatorScreen() {
	const { display, error, bottomInset, pressKey, accept, goBack } =
		useCalculator();

	return (
		<ScreenContainer testID="calculator-screen">
			<InternalScreenHeader title="Calculadora" onBackPress={goBack} />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: "center",
					paddingHorizontal: 20,
					paddingTop: 16,
					paddingBottom: Math.max(bottomInset, 20),
				}}
			>
				<View style={{ width: "100%", maxWidth: 440, alignSelf: "center" }}>
					<View
						style={{
							minHeight: 88,
							borderRadius: 12,
							borderWidth: 1,
							borderColor: OUTLINE,
							backgroundColor: colors.white,
							padding: 16,
							alignItems: "flex-end",
							justifyContent: "center",
						}}
					>
						<Text
							selectable
							style={{
								color: colors.neutral500,
								fontSize: 12,
								fontWeight: "600",
							}}
						>
							Monto actual
						</Text>
						<Text
							selectable
							numberOfLines={1}
							accessibilityLiveRegion="polite"
							testID="calculator-display"
							style={{
								width: "100%",
								textAlign: "right",
								fontSize: display.length > 14 ? 24 : 32,
								lineHeight: 40,
								fontWeight: "700",
								fontVariant: ["tabular-nums"],
								color: DARK_GREEN,
							}}
						>
							{display}
						</Text>
					</View>

					<View style={{ minHeight: 22, paddingTop: 4 }}>
						{error ? (
							<Text
								selectable
								accessibilityRole="alert"
								accessibilityLiveRegion="polite"
								style={{
									color: colors.error,
									textAlign: "center",
									fontSize: 13,
								}}
							>
								{error}
							</Text>
						) : null}
					</View>

					<View
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							justifyContent: "space-between",
							rowGap: 10,
						}}
					>
						{KEYS.map((item) => {
							const palette = keyColors(item.kind);
							return (
								<Pressable
									key={item.testId}
									accessibilityRole="button"
									accessibilityLabel={item.accessibilityLabel}
									testID={`calculator-key-${item.testId}`}
									onPress={() => pressKey(item.key)}
									style={({ pressed }) => ({
										width: "22%",
										minWidth: 44,
										height: 54,
										borderRadius: 10,
										borderWidth: item.kind === "number" ? 1 : 0,
										borderColor: OUTLINE,
										backgroundColor: palette.backgroundColor,
										alignItems: "center",
										justifyContent: "center",
										opacity: pressed ? 0.72 : 1,
									})}
								>
									<Text
										style={{
											color: palette.color,
											fontSize: 21,
											fontWeight: "600",
										}}
									>
										{item.label}
									</Text>
								</Pressable>
							);
						})}
					</View>

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Aceptar resultado"
						testID="calculator-accept"
						onPress={accept}
						style={({ pressed }) => ({
							height: 54,
							minHeight: 44,
							marginTop: 18,
							borderRadius: 10,
							backgroundColor: DARK_GREEN,
							alignItems: "center",
							justifyContent: "center",
							opacity: pressed ? 0.8 : 1,
						})}
					>
						<Text
							style={{
								color: colors.white,
								fontSize: 16,
								fontWeight: "700",
								letterSpacing: 0.8,
							}}
						>
							ACEPTAR
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</ScreenContainer>
	);
}
