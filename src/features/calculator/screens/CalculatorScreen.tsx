import { ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../../shared/theme/colors";
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
		kind: "operator",
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

const KEY_ROWS = [
	KEYS.slice(0, 4),
	KEYS.slice(4, 8),
	KEYS.slice(8, 12),
	KEYS.slice(12, 16),
	KEYS.slice(16, 20),
];

const DARK_GREEN = "#1b4332";
const OUTLINE = "#c1c8c2";
const SURFACE = "#f8f9fa";
const SURFACE_LOWEST = "#ffffff";
const SURFACE_HIGH = "#e7e8e9";
const ON_SURFACE = "#191c1d";
const ERROR = "#ba1a1a";
const ERROR_CONTAINER = "#ffdad6";

const styles = StyleSheet.create({
	headerBack: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 22,
		overflow: "hidden",
	},
	key: {
		flex: 1,
		maxWidth: 64,
		minWidth: 44,
		height: 64,
		minHeight: 44,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	keyClear: {
		borderWidth: 0,
		borderColor: OUTLINE,
		backgroundColor: ERROR_CONTAINER,
	},
	keyOperator: {
		borderWidth: 0,
		borderColor: OUTLINE,
		backgroundColor: SURFACE_HIGH,
	},
	keyNumber: {
		borderWidth: 1,
		borderColor: OUTLINE,
		backgroundColor: SURFACE_LOWEST,
	},
	keyEquals: {
		borderWidth: 0,
		borderColor: OUTLINE,
		backgroundColor: DARK_GREEN,
	},
	accept: {
		width: "100%",
		height: 54,
		minHeight: 44,
		marginTop: 18,
		borderRadius: 10,
		backgroundColor: DARK_GREEN,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
});

const KEY_KIND_STYLES = {
	clear: styles.keyClear,
	number: styles.keyNumber,
	operator: styles.keyOperator,
	equals: styles.keyEquals,
} satisfies Record<KeyConfig["kind"], object>;

function keyTextColor(kind: KeyConfig["kind"]) {
	if (kind === "clear") return ERROR;
	if (kind === "equals") return SURFACE_LOWEST;
	return ON_SURFACE;
}

function CalculatorHeader({ onBackPress }: { onBackPress: () => void }) {
	return (
		<View style={{ backgroundColor: SURFACE }}>
			<SafeAreaView edges={["top"]} style={{ backgroundColor: SURFACE }} />
			<View
				testID="calculator-header"
				style={{
					height: 56,
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 20,
					columnGap: 16,
					backgroundColor: SURFACE,
				}}
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Volver"
					testID="calculator-header-back"
					hitSlop={8}
					onPress={onBackPress}
					android_ripple={{ color: "rgba(27, 67, 50, 0.12)", borderless: true }}
					style={styles.headerBack}
				>
					<ArrowLeft color={DARK_GREEN} size={24} strokeWidth={2} />
				</Pressable>
				<Text
					numberOfLines={1}
					testID="calculator-header-title"
					style={{
						flexShrink: 1,
						fontSize: 24,
						lineHeight: 32,
						fontWeight: "700",
						textAlign: "left",
						color: DARK_GREEN,
					}}
				>
					Calculadora
				</Text>
			</View>
		</View>
	);
}

export function CalculatorScreen() {
	const { display, error, bottomInset, pressKey, accept, goBack } =
		useCalculator();

	return (
		<ScreenContainer testID="calculator-screen">
			<CalculatorHeader onBackPress={goBack} />
			<ScrollView
				testID="calculator-scroll"
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: "flex-start",
					paddingHorizontal: 20,
					paddingTop: 12,
					paddingBottom: Math.max(bottomInset, 20),
				}}
			>
				<View style={{ width: "100%", maxWidth: 440, alignSelf: "center" }}>
					<View
						testID="calculator-display-card"
						style={{
							minHeight: 88,
							borderRadius: 12,
							borderWidth: 1,
							borderColor: OUTLINE,
							backgroundColor: SURFACE_LOWEST,
							padding: 16,
							alignItems: "flex-end",
							justifyContent: "center",
							shadowColor: "#000000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.06,
							shadowRadius: 8,
							elevation: 2,
						}}
					>
						<Text
							selectable
							style={{
								color: colors.neutral500,
								fontSize: 12,
								fontWeight: "600",
								textAlign: "right",
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

					<View testID="calculator-keypad" style={{ rowGap: 16 }}>
						{KEY_ROWS.map((row, rowIndex) => (
							<View
								key={`row-${rowIndex + 1}`}
								testID={`calculator-row-${rowIndex + 1}`}
								style={{
									flexDirection: "row",
									justifyContent: "center",
									columnGap: 16,
								}}
							>
								{row.map((item) => {
									return (
										<Pressable
											key={item.testId}
											accessibilityRole="button"
											accessibilityLabel={item.accessibilityLabel}
											testID={`calculator-key-${item.testId}`}
											onPress={() => pressKey(item.key)}
											android_ripple={{ color: "rgba(25, 28, 29, 0.12)" }}
											style={[styles.key, KEY_KIND_STYLES[item.kind]]}
										>
											<Text
												style={{
													color: keyTextColor(item.kind),
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
						))}
					</View>

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Aceptar resultado"
						testID="calculator-accept"
						onPress={accept}
						android_ripple={{ color: "rgba(255, 255, 255, 0.16)" }}
						style={styles.accept}
					>
						<Text
							style={{
								color: SURFACE_LOWEST,
								fontSize: 16,
								textAlign: "center",
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
