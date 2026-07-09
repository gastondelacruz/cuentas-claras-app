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
import { PersonalExpenseTypeBadge } from "../components/PersonalExpenseTypeBadge";
import { PersonalExpenseTypeFilterChips } from "../components/PersonalExpenseTypeFilterChips";
import { getPersonalCategoryVisual } from "../constants/personalTransactionCategoryVisuals";
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

const PRIMARY = colors.primary; // #0E7A3A
const STITCH_PRIMARY = "#012d1d";
const STITCH_PRIMARY_CONTAINER = "#1b4332";
const STITCH_SECONDARY = "#116c4a";
const STITCH_PRIMARY_FIXED_DIM = "#a5d0b9";
const STITCH_BACKGROUND = "#f8f9fa";
const STITCH_SURFACE = "#ffffff";
const STITCH_SURFACE_VARIANT = "#e1e3e4";
const STITCH_ON_BACKGROUND = "#191c1d";
const STITCH_ON_SURFACE_VARIANT = "#414844";
const STITCH_ERROR = "#ba1a1a";
const GRAY = STITCH_ON_SURFACE_VARIANT;
const DARK = STITCH_ON_BACKGROUND;

function formatTotal(value: number, currency: string) {
	const formatted = new Intl.NumberFormat("es-AR", {
		maximumFractionDigits: 0,
	}).format(value);
	return currency === "ARS" ? `${formatted} $` : `${formatted} ${currency}`;
}

function formatSignedAmount(
	value: number,
	currency: string,
	type: PersonalTransactionType,
) {
	return `${type === "income" ? "+" : "-"} ${formatTotal(value, currency)}`;
}

function formatDate(value: string) {
	const date = new Date(value);
	return new Intl.DateTimeFormat("es-AR", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	})
		.format(date)
		.replace(".", "");
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

function RecentTransactionsSkeleton() {
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			style={{ gap: 8 }}
		>
			{[0, 1, 2].map((item) => (
				<View
					key={item}
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						backgroundColor: STITCH_SURFACE,
						borderRadius: 12,
						padding: 16,
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
					}}
				>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
						<SkeletonBlock
							style={{ width: 40, height: 40, borderRadius: 20 }}
						/>
						<View style={{ gap: 8 }}>
							<SkeletonBlock
								style={{ width: 104, height: 16, borderRadius: 999 }}
							/>
							<SkeletonBlock
								style={{ width: 72, height: 12, borderRadius: 999 }}
							/>
						</View>
					</View>
					<SkeletonBlock style={{ width: 80, height: 16, borderRadius: 999 }} />
				</View>
			))}
		</View>
	);
}

export function PersonalTransactionsScreen() {
	const {
		type,
		setType,
		expenseKindFilter,
		setExpenseKindFilter,
		range,
		selectRange,
		rangeLabel,
		periodRange,
		isPeriodModalOpen,
		applyPeriod,
		closePeriodModal,
		chartSegments,
		displayCurrency,
		displaySummaryCurrency,
		displaySummaryTotal,
		displayTotal,
		displayTransactions,
		isLoading,
		isError,
		navigateToAddTransaction,
		navigateToEditTransaction,
	} = usePersonalTransactionsScreen();
	const { isEmailVerified, guard } = useEmailVerificationGate();

	const useSkeletonLoading = isEnhancedInitialLoadingEnabled();
	const showLoadingSkeleton = isLoading && useSkeletonLoading && !isError;
	const totalLabel = formatTotal(displaySummaryTotal, displaySummaryCurrency);
	const chartTotalLabel = formatTotal(displayTotal, displayCurrency);
	const showFinancialSummary = (!isLoading || showLoadingSkeleton) && !isError;
	const emptyRecentTransactionsMessage =
		type === "income"
			? "No hay ingresos para este período."
			: expenseKindFilter === "fixed"
				? "No hay gastos fijos para este período."
				: expenseKindFilter === "variable"
					? "No hay gastos variables para este período."
					: "No hay gastos para este período.";

	return (
		<ScreenContainer style={{ backgroundColor: STITCH_BACKGROUND }}>
			<AppTopBar />
			<EmailVerificationBanner visible={!isEmailVerified} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 112 }}
			>
				{/* ── Total section ───────────────────────────────────────────────────── */}
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

				{/* ── Card: tabs, filters, date nav and content ─────────────────────────── */}
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
						{/* ── Tabs: GASTOS | INGRESOS ───────────────────────────────────────── */}
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

						{/* ── Range filters ───────────────────────────────────────────────────── */}
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

						{/* ── Date navigation row ─────────────────────────────────────────────── */}
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

						{/* ── Content area ────────────────────────────────────────────────────── */}
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
							gap: 16,
						}}
					>
						<View style={{ gap: 10, paddingHorizontal: 8 }}>
							<Text
								style={{
									fontSize: 20,
									lineHeight: 28,
									fontWeight: "600",
									color: DARK,
								}}
							>
								{type === "income" ? "Ingresos Recientes" : "Gastos Recientes"}
							</Text>
							{type === "expense" ? (
								<PersonalExpenseTypeFilterChips
									value={expenseKindFilter}
									onChange={setExpenseKindFilter}
								/>
							) : null}
						</View>
						<View style={{ gap: 8 }}>
							{showLoadingSkeleton ? (
								<RecentTransactionsSkeleton />
							) : displayTransactions.length === 0 ? (
								<View
									accessibilityRole="text"
									style={{
										backgroundColor: STITCH_SURFACE,
										borderRadius: 12,
										padding: 16,
										boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
									}}
								>
									<Text
										style={{
											fontSize: 14,
											lineHeight: 20,
											color: GRAY,
											textAlign: "center",
										}}
									>
										{emptyRecentTransactionsMessage}
									</Text>
								</View>
							) : (
								displayTransactions.map((transaction) => {
									const categoryVisual = getPersonalCategoryVisual(
										transaction.type,
										transaction.category,
									);
									const Icon = categoryVisual.Icon;
									const isIncome = transaction.type === "income";
									return (
										<Pressable
											key={transaction.id}
											accessibilityRole="button"
											accessibilityLabel={`Editar ${transaction.type === "income" ? "ingreso" : "gasto"} personal ${transaction.category} por ${formatTotal(transaction.amount, transaction.currency)}`}
											accessibilityHint="Abre el formulario para modificar esta transacción"
											accessibilityState={{ disabled: !isEmailVerified }}
											disabled={!isEmailVerified}
											onPress={() =>
												guard(() => navigateToEditTransaction(transaction))
											}
											testID={`personal-transaction-item-${transaction.id}`}
											style={{
												flexDirection: "row",
												alignItems: "center",
												justifyContent: "space-between",
												backgroundColor: STITCH_SURFACE,
												borderRadius: 12,
												padding: 16,
												boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
											}}
										>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													gap: 16,
												}}
											>
												<View
													style={{
														width: 40,
														height: 40,
														borderRadius: 20,
														backgroundColor: categoryVisual.color,
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<Icon color="#ffffff" size={22} strokeWidth={2} />
												</View>
												<View style={{ gap: 4 }}>
													<Text
														style={{
															fontSize: 16,
															lineHeight: 24,
															fontWeight: "600",
															color: DARK,
														}}
													>
														{transaction.category}
													</Text>
													<Text
														selectable
														style={{
															fontSize: 12,
															lineHeight: 16,
															fontWeight: "600",
															letterSpacing: 0.6,
															color: GRAY,
														}}
													>
														{formatDate(transaction.occurredAt)}
													</Text>
													{!isIncome ? (
														<PersonalExpenseTypeBadge
															expenseKind={transaction.expenseKind}
														/>
													) : null}
												</View>
											</View>
											<Text
												selectable
												style={{
													fontSize: 16,
													lineHeight: 24,
													fontWeight: "700",
													color: isIncome ? STITCH_SECONDARY : STITCH_ERROR,
													fontVariant: ["tabular-nums"],
												}}
											>
												{formatSignedAmount(
													transaction.amount,
													transaction.currency,
													transaction.type,
												)}
											</Text>
										</Pressable>
									);
								})
							)}
						</View>
					</View>
				) : null}
			</ScrollView>

			{/* ── FAB ─────────────────────────────────────────────────────────────── */}

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
