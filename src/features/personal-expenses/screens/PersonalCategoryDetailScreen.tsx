import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useRef, useState } from "react";
import { Trash2 } from "lucide-react-native";

import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { colors } from "../../../shared/theme/colors";
import { PersonalExpenseTypeBadge } from "../components/PersonalExpenseTypeBadge";
import { PersonalExpenseTypeFilterChips } from "../components/PersonalExpenseTypeFilterChips";
import { getPersonalCategoryVisual } from "../constants/personalTransactionCategoryVisuals";
import { usePersonalCategoryDetailScreen } from "../hooks/usePersonalCategoryDetailScreen";

const PRIMARY = colors.primary;
const GRAY = colors.neutral500;
const DARK = colors.neutral900;
const SURFACE = "#ffffff";
const ERROR = colors.error;

function formatSignedAmount(
	value: number,
	currency: string,
	type: "expense" | "income",
) {
	const formatted = new Intl.NumberFormat("es-AR", {
		maximumFractionDigits: 0,
	}).format(value);

	const total =
		currency === "ARS" ? `${formatted} $` : `${formatted} ${currency}`;
	return `${type === "income" ? "+" : "-"} ${total}`;
}

export function PersonalCategoryDetailScreen() {
	const {
		category,
		type,
		rangeLabel,
		expenseKindFilter,
		setExpenseKindFilter,
		categoryVisual,
		transactions,
		displayTotalLabel,
		displayShareLabel,
		isLoading,
		isError,
		navigateToEditTransaction,
		deleteTransaction,
		formatDate,
	} = usePersonalCategoryDetailScreen();
	const Icon = categoryVisual.Icon;
	const [revealedTransactionId, setRevealedTransactionId] = useState<
		string | null
	>(null);
	const swipeStartX = useRef(0);
	const emptyMessage: string =
		type === "expense"
			? expenseKindFilter === "fixed"
				? "No hay gastos fijos en esta categoría para este período."
				: expenseKindFilter === "variable"
					? "No hay gastos variables en esta categoría para este período."
					: "No hay gastos en esta categoría para este período."
			: "No hay ingresos en esta categoría para este período.";

	return (
		<ScreenContainer style={{ backgroundColor: "#f8f9fa" }}>
			<InternalScreenHeader title={category} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ paddingBottom: 112 }}
			>
				<View
					testID="personal-category-summary-card"
					style={{
						marginHorizontal: 16,
						marginTop: 20,
						borderRadius: 24,
						backgroundColor: SURFACE,
						paddingHorizontal: 20,
						paddingVertical: 28,
						minHeight: 184,
						justifyContent: "center",
						alignItems: "center",
						gap: 14,
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
					}}
				>
					<View
						style={{
							width: 56,
							height: 56,
							borderRadius: 28,
							backgroundColor: categoryVisual.color,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Icon color="#ffffff" size={26} strokeWidth={2} />
					</View>
					<View style={{ alignItems: "center", gap: 6 }}>
						<Text style={{ fontSize: 14, fontWeight: "600", color: GRAY }}>
							{type === "expense" ? "Gasto" : "Ingreso"} · {rangeLabel}
						</Text>
						<Text
							selectable
							style={{
								fontSize: 30,
								lineHeight: 36,
								fontWeight: "700",
								color: DARK,
								fontVariant: ["tabular-nums"],
							}}
						>
							{displayTotalLabel}
						</Text>
						<View
							testID="personal-category-share-chip"
							style={{
								borderRadius: 999,
								paddingHorizontal: 12,
								paddingVertical: 6,
								backgroundColor: "rgba(77, 124, 255, 0.12)",
							}}
						>
							<Text
								selectable
								style={{
									fontSize: 12,
									lineHeight: 16,
									fontWeight: "700",
									color: PRIMARY,
								}}
							>
								{displayShareLabel}
							</Text>
						</View>
					</View>
				</View>

				<View
					testID="personal-category-transactions-section"
					style={{ paddingHorizontal: 16, paddingTop: 20, gap: 8 }}
				>
					<Text
						testID="personal-category-transactions-heading"
						style={{
							fontSize: 13,
							lineHeight: 16,
							fontWeight: "700",
							letterSpacing: 0.6,
							color: GRAY,
							textTransform: "uppercase",
						}}
					>
						Transacciones
					</Text>

					{type === "expense" ? (
						<View
							testID="personal-category-expense-filter-container"
							style={{ marginTop: 4 }}
						>
							<PersonalExpenseTypeFilterChips
								value={expenseKindFilter}
								onChange={setExpenseKindFilter}
							/>
						</View>
					) : null}

					{isLoading ? (
						<View
							accessibilityRole="progressbar"
							accessibilityLabel="Cargando transacciones de categoría"
							style={{
								alignItems: "center",
								justifyContent: "center",
								gap: 12,
								paddingVertical: 64,
							}}
						>
							<ActivityIndicator color={PRIMARY} size="large" />
							<Text style={{ fontSize: 14, color: GRAY }}>
								Cargando movimientos...
							</Text>
						</View>
					) : isError ? (
						<View
							accessibilityRole="alert"
							style={{
								alignItems: "center",
								justifyContent: "center",
								gap: 12,
								paddingVertical: 64,
							}}
						>
							<Text
								style={{
									fontSize: 18,
									fontWeight: "700",
									color: DARK,
									textAlign: "center",
								}}
							>
								No pudimos cargar esta categoría
							</Text>
							<Text style={{ fontSize: 14, color: GRAY, textAlign: "center" }}>
								Intentá nuevamente en unos minutos.
							</Text>
						</View>
					) : transactions.length === 0 ? (
						<View
							accessibilityRole="text"
							style={{
								backgroundColor: SURFACE,
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
								{emptyMessage}
							</Text>
						</View>
					) : (
						<View style={{ gap: 8 }}>
							{transactions.map((transaction) => {
								const transactionVisual = getPersonalCategoryVisual(
									transaction.type,
									transaction.category,
								);
								const amountLabel = formatSignedAmount(
									transaction.amount,
									transaction.currency,
									transaction.type,
								);
								const isExpense = transaction.type === "expense";

								return (
									<Pressable
										key={transaction.id}
										accessibilityRole="button"
										accessibilityLabel={`Editar ${isExpense ? "gasto" : "ingreso"} personal ${transaction.category} por ${amountLabel.replace(/^[-+]\s/, "")}`}
										accessibilityHint="Abre el formulario para modificar esta transacción"
										onPress={() => navigateToEditTransaction(transaction)}
										onTouchStart={(event) => {
											swipeStartX.current = event.nativeEvent.pageX;
										}}
										onTouchMove={(event) => {
											if (swipeStartX.current - event.nativeEvent.pageX > 40) {
												setRevealedTransactionId(transaction.id);
											}
										}}
										testID={`personal-category-transaction-item-${transaction.id}`}
										style={{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											backgroundColor: SURFACE,
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
													backgroundColor: transactionVisual.color,
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<transactionVisual.Icon
													color="#ffffff"
													size={22}
													strokeWidth={2}
												/>
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
													{transaction.note?.trim() || transaction.category}
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
												{isExpense ? (
													<PersonalExpenseTypeBadge
														expenseKind={transaction.expenseKind}
													/>
												) : null}
											</View>
										</View>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												gap: 8,
											}}
										>
											<Text
												selectable
												style={{
													fontSize: 16,
													lineHeight: 24,
													fontWeight: "700",
													color: isExpense ? ERROR : colors.primary,
													fontVariant: ["tabular-nums"],
												}}
											>
												{amountLabel}
											</Text>
											{revealedTransactionId === transaction.id ? (
												<Pressable
													accessibilityRole="button"
													accessibilityLabel="Eliminar transacción"
													onPress={() => deleteTransaction(transaction.id)}
													testID={`delete-personal-transaction-${transaction.id}`}
													style={{ padding: 8 }}
												>
													<Trash2 color={ERROR} size={20} />
												</Pressable>
											) : null}
										</View>
									</Pressable>
								);
							})}
						</View>
					)}
				</View>
			</ScrollView>
		</ScreenContainer>
	);
}
