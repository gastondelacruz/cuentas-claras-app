import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import {
	ChevronLeft,
	ChevronRight,
	Plus,
	WalletCards,
} from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";

import { colors } from "../../../shared/theme/colors";
import { isEnhancedInitialLoadingEnabled } from "../../../shared/feature-flags/initialLoadingFlags";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { EmailVerificationBanner } from "../../auth/components/EmailVerificationBanner";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { useEmailVerificationGate } from "../../../shared/hooks/useEmailVerificationGate";
import { PeriodSelectionModal } from "../components/PeriodSelectionModal";
import { usePersonalTransactionsScreen } from "../hooks/usePersonalTransactionsScreen";
import type {
	PersonalTransactionChartSegment,
	PersonalTransactionRange,
	PersonalTransactionType,
} from "../types";

const TRANSACTION_TABS: Array<{
	value: PersonalTransactionType;
	label: string;
}> = [
	{ value: "expense", label: "GASTOS" },
	{ value: "income", label: "INGRESOS" },
];

const RANGE_FILTERS: Array<{
	value: PersonalTransactionRange;
	label: string;
	testID: string;
}> = [
	{ value: "day", label: "Día", testID: "personal-range-day" },
	{ value: "week", label: "Semana", testID: "personal-range-week" },
	{ value: "month", label: "Mes", testID: "personal-range-month" },
	{ value: "year", label: "Año", testID: "personal-range-year" },
	{ value: "period", label: "Período", testID: "personal-range-period" },
];

const PRIMARY = colors.primary;
const STITCH_PRIMARY = "#012d1d";
const STITCH_PRIMARY_CONTAINER = "#1b4332";
const STITCH_PRIMARY_FIXED_DIM = "#a5d0b9";
const STITCH_BACKGROUND = "#f8f9fa";
const STITCH_SURFACE = "#ffffff";
const STITCH_SURFACE_VARIANT = "#e1e3e4";
const STITCH_ON_BACKGROUND = "#191c1d";
const STITCH_ON_SURFACE_VARIANT = "#414844";
const GRAY = STITCH_ON_SURFACE_VARIANT;
const DARK = STITCH_ON_BACKGROUND;

function formatTotal(value: number, currency: string) {
	const formatted = new Intl.NumberFormat("es-AR", {
		maximumFractionDigits: 0,
	}).format(value);
	return currency === "ARS" ? `${formatted} $` : `${formatted} ${currency}`;
}

function DonutChart({
	segments,
	totalLabel,
}: {
	segments: PersonalTransactionChartSegment[];
	totalLabel: string;
}) {
	return (
		<View
			testID="personal-transactions-donut-chart"
			accessible
			accessibilityRole="image"
			accessibilityLabel={`Gráfico de distribución. Total ${totalLabel}`}
			style={{
				minHeight: 300,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<View
				style={{
					width: 256,
					height: 256,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Svg
					width={256}
					height={256}
					viewBox="0 0 100 100"
					style={{ transform: [{ rotate: "-90deg" }] }}
				>
					{segments.map((segment, index) => (
						<Circle
							key={`${segment.color}-${index}`}
							cx="50"
							cy="50"
							r="40"
							fill="transparent"
							stroke={segment.color}
							strokeWidth="12"
							strokeDasharray={segment.dasharray}
							strokeDashoffset={segment.dashoffset}
						/>
					))}
				</Svg>
				<View
					style={{
						position: "absolute",
						inset: 0,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text style={{ fontSize: 12, fontWeight: "600", color: GRAY }}>
						Total
					</Text>
					<Text
						selectable
						style={{ fontSize: 20, fontWeight: "600", color: STITCH_PRIMARY }}
					>
						{totalLabel}
					</Text>
				</View>
			</View>
		</View>
	);
}

function SkeletonBlock({ style }: { style: StyleProp<ViewStyle> }) {
	return <View style={[{ backgroundColor: STITCH_SURFACE_VARIANT }, style]} />;
}

function PersonalTransactionsChartSkeleton() {
	return (
		<View
			testID="personal-transactions-loading-skeleton"
			accessibilityRole="progressbar"
			accessibilityLabel="Cargando transacciones personales"
			accessibilityState={{ busy: true }}
			style={{ minHeight: 300, alignItems: "center", justifyContent: "center" }}
		>
			<View
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
				style={{ alignItems: "center", gap: 20 }}
			>
				<View
					style={{
						width: 220,
						height: 220,
						borderRadius: 110,
						borderWidth: 28,
						borderColor: STITCH_SURFACE_VARIANT,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<SkeletonBlock style={{ width: 76, height: 12, borderRadius: 999 }} />
					<SkeletonBlock
						style={{ width: 112, height: 20, borderRadius: 999, marginTop: 12 }}
					/>
				</View>
			</View>
		</View>
	);
}

export function PersonalTransactionsScreen() {
	const {
		type,
		setType,
		range,
		selectRange,
		rangeLabel,
		periodRange,
		isPeriodModalOpen,
		applyPeriod,
		closePeriodModal,
		chartSegments,
		categoryRows,
		displayCurrency,
		displaySummaryCurrency,
		displaySummaryTotal,
		displayTotal,
		isLoading,
		isError,
		navigateToAddTransaction,
	} = usePersonalTransactionsScreen();
	const { isEmailVerified, guard } = useEmailVerificationGate();

	const useSkeletonLoading = isEnhancedInitialLoadingEnabled();
	const showLoadingSkeleton = isLoading && useSkeletonLoading && !isError;
	const totalLabel = formatTotal(displaySummaryTotal, displaySummaryCurrency);
	const chartTotalLabel = formatTotal(displayTotal, displayCurrency);
	const showFinancialSummary = (!isLoading || showLoadingSkeleton) && !isError;

	return (
		<ScreenContainer style={{ backgroundColor: STITCH_BACKGROUND }}>
			<AppTopBar />
			<EmailVerificationBanner visible={!isEmailVerified} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 112 }}
			>
				{showFinancialSummary ? (
					<View
						testID="personal-transactions-total"
						style={{
							alignItems: "center",
							paddingTop: 16,
							paddingBottom: 24,
							gap: 4,
						}}
					>
						<View
							style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
						>
							<WalletCards color={GRAY} size={16} strokeWidth={1.8} />
							<Text style={{ fontSize: 14, color: GRAY }}>Total</Text>
							<Text style={{ fontSize: 16, color: GRAY }}>⌄</Text>
						</View>
						{showLoadingSkeleton ? (
							<View
								accessibilityElementsHidden
								importantForAccessibility="no-hide-descendants"
								style={{ alignItems: "center", paddingTop: 8 }}
							>
								<SkeletonBlock
									style={{ width: 160, height: 32, borderRadius: 999 }}
								/>
							</View>
						) : (
							<Text
								selectable
								style={{
									fontSize: 28,
									fontWeight: "700",
									color: STITCH_PRIMARY,
									fontVariant: ["tabular-nums"],
								}}
							>
								{totalLabel}
							</Text>
						)}
					</View>
				) : null}

				<View
					testID="personal-transactions-card"
					style={{
						backgroundColor: STITCH_SURFACE,
						borderRadius: 12,
						marginHorizontal: 20,
						padding: 16,
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
					}}
				>
					<View>
						<View
							accessibilityRole="tablist"
							style={{
								flexDirection: "row",
								borderBottomWidth: 1,
								borderBottomColor: STITCH_SURFACE_VARIANT,
								marginBottom: 24,
							}}
						>
							{TRANSACTION_TABS.map((tab) => {
								const selected = tab.value === type;
								return (
									<Pressable
										key={tab.value}
										accessibilityRole="tab"
										accessibilityLabel={
											tab.label === "GASTOS"
												? "Ver gastos personales"
												: "Ver ingresos personales"
										}
										accessibilityState={{ selected }}
										onPress={() => setType(tab.value)}
										testID={`personal-tab-${tab.value}`}
										style={{
											flex: 1,
											alignItems: "center",
											paddingVertical: 12,
											borderBottomWidth: selected ? 2 : 0,
											borderBottomColor: selected
												? STITCH_PRIMARY
												: "transparent",
											marginBottom: -1,
										}}
									>
										<Text
											style={{
												fontSize: 13,
												fontWeight: "600",
												letterSpacing: 0.5,
												color: selected ? STITCH_PRIMARY : GRAY,
											}}
										>
											{tab.label}
										</Text>
									</Pressable>
								);
							})}
						</View>

						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: 24,
							}}
						>
							{RANGE_FILTERS.map((filter) => {
								const selected = filter.value === range;
								return (
									<Pressable
										key={filter.value}
										accessibilityRole="button"
										accessibilityLabel={`Filtro ${filter.label}`}
										accessibilityState={{ selected }}
										onPress={() => selectRange(filter.value)}
										testID={filter.testID}
										style={{
											paddingVertical: 8,
											paddingHorizontal: 0,
											borderBottomWidth: selected ? 2 : 0,
											borderBottomColor: selected
												? STITCH_PRIMARY
												: "transparent",
										}}
									>
										<Text
											style={{
												fontSize: 14,
												color: selected ? STITCH_PRIMARY : GRAY,
												fontWeight: selected ? "600" : "400",
											}}
										>
											{filter.label}
										</Text>
									</Pressable>
								);
							})}
						</View>

						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: 32,
								position: "relative",
							}}
						>
							<ChevronLeft
								color={GRAY}
								size={24}
								strokeWidth={2}
								style={{ position: "absolute", left: 0 }}
							/>
							<Text
								style={{
									fontSize: 14,
									color: GRAY,
									textDecorationLine: "underline",
								}}
							>
								{rangeLabel}
							</Text>
							<ChevronRight
								color={GRAY}
								opacity={0.3}
								size={24}
								strokeWidth={2}
								style={{ position: "absolute", right: 0 }}
							/>
						</View>

						<View>
							{showLoadingSkeleton ? (
								<PersonalTransactionsChartSkeleton />
							) : isLoading ? (
								<View
									style={{
										alignItems: "center",
										justifyContent: "center",
										gap: 12,
										paddingVertical: 64,
									}}
									accessibilityRole="progressbar"
									accessibilityLabel="Cargando transacciones personales"
								>
									<ActivityIndicator color={PRIMARY} size="large" />
									<Text style={{ fontSize: 14, color: GRAY }}>
										Cargando movimientos...
									</Text>
								</View>
							) : isError ? (
								<View
									style={{
										alignItems: "center",
										justifyContent: "center",
										gap: 12,
										paddingVertical: 64,
									}}
									accessibilityRole="alert"
								>
									<Text
										style={{
											fontSize: 18,
											fontWeight: "700",
											color: DARK,
											textAlign: "center",
										}}
									>
										No pudimos cargar tus movimientos
									</Text>
									<Text
										style={{ fontSize: 14, color: GRAY, textAlign: "center" }}
									>
										Intentá nuevamente en unos minutos.
									</Text>
								</View>
							) : (
								<DonutChart
									segments={chartSegments}
									totalLabel={chartTotalLabel}
								/>
							)}
						</View>
					</View>
				</View>

				{showFinancialSummary ? (
					<View
						style={{
							paddingHorizontal: 20,
							paddingTop: 32,
							paddingBottom: 112,
							gap: 8,
						}}
					>
						{categoryRows.map((row) => {
							const Icon = row.Icon;
							return (
								<Pressable
									key={row.category}
									accessibilityRole="button"
									accessibilityLabel={row.accessibilityLabel}
									accessibilityHint="Abre el detalle de las transacciones de esta categoría"
									accessibilityState={{ disabled: !isEmailVerified }}
									disabled={!isEmailVerified}
									onPress={() => guard(() => row.onPress())}
									style={{
										flexDirection: "row",
										alignItems: "center",
										gap: 16,
										backgroundColor: STITCH_SURFACE,
										borderRadius: 12,
										padding: 16,
										boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
									}}
								>
									<View
										style={{
											width: 40,
											height: 40,
											borderRadius: 20,
											backgroundColor: row.color,
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Icon color="#ffffff" size={22} strokeWidth={2} />
									</View>
									<View style={{ flex: 1, gap: 8 }}>
										<View
											style={{
												flexDirection: "row",
												alignItems: "flex-start",
												justifyContent: "space-between",
												gap: 12,
											}}
										>
											<View style={{ flex: 1, gap: 4 }}>
												<Text
													style={{
														fontSize: 16,
														lineHeight: 24,
														fontWeight: "600",
														color: DARK,
													}}
												>
													{row.category}
												</Text>
												<Text
													style={{
														fontSize: 12,
														lineHeight: 16,
														fontWeight: "600",
														letterSpacing: 0.6,
														color: GRAY,
													}}
												>
													{row.percentage}% del total
												</Text>
											</View>
											<Text
												selectable
												style={{
													fontSize: 16,
													lineHeight: 24,
													fontWeight: "700",
													color: STITCH_PRIMARY,
													fontVariant: ["tabular-nums"],
												}}
											>
												{formatTotal(row.amount, displayCurrency)}
											</Text>
										</View>
										<View
											accessibilityRole="progressbar"
											accessibilityLabel={`${row.category} representa ${row.percentage}% del total`}
											style={{
												height: 6,
												borderRadius: 999,
												backgroundColor: STITCH_SURFACE_VARIANT,
												overflow: "hidden",
											}}
										>
											<View
												style={{
													width: `${row.percentage}%`,
													height: "100%",
													borderRadius: 999,
													backgroundColor: row.color,
												}}
											/>
										</View>
									</View>
								</Pressable>
							);
						})}
					</View>
				) : null}
			</ScrollView>

			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Añadir transacción personal"
				accessibilityState={{ disabled: !isEmailVerified }}
				disabled={!isEmailVerified}
				onPress={() => guard(navigateToAddTransaction)}
				testID="add-personal-transaction-fab"
				style={{
					position: "absolute",
					bottom: 80,
					right: 20,
					width: 56,
					height: 56,
					borderRadius: 28,
					backgroundColor: isEmailVerified
						? STITCH_PRIMARY_CONTAINER
						: "#D1D5DB",
					alignItems: "center",
					justifyContent: "center",
					boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
				}}
			>
				<Plus color={STITCH_PRIMARY_FIXED_DIM} size={28} strokeWidth={2.6} />
			</Pressable>

			<PeriodSelectionModal
				initialRange={periodRange}
				onApply={applyPeriod}
				onClose={closePeriodModal}
				visible={isPeriodModalOpen}
			/>
		</ScreenContainer>
	);
}
