import { Calculator, CalendarDays, Check } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { colors } from "../../../shared/theme/colors";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { KeyboardAwareScrollView } from "../../../shared/ui/KeyboardAwareScrollView";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { PERSONAL_CATEGORY_CONFIGS } from "../constants/personalTransactionCategoryVisuals";
import { PersonalExpenseTypeSelector } from "../components/PersonalExpenseTypeSelector";
import { useAddPersonalTransactionForm } from "../hooks/useAddPersonalTransactionForm";
import type { PersonalTransactionType } from "../types";

const FORM_TABS: Array<{ value: PersonalTransactionType; label: string }> = [
	{ value: "expense", label: "GASTOS" },
	{ value: "income", label: "INGRESOS" },
];

const PRIMARY = colors.primary; // #0E7A3A
const GRAY = colors.neutral500; // #6B7280
const DARK = colors.neutral900; // #111827
const OUTLINE = "#bbcbbb";

export function AddPersonalTransactionScreen() {
	const {
		type,
		changeType,
		amount,
		changeAmount,
		note,
		changeNote,
		notePlaceholder,
		expenseKind,
		setExpenseKind,
		selectedCategory,
		setSelectedCategory,
		dateChips,
		selectedDateId,
		setSelectedDateId,
		customDate,
		showDatePicker,
		setShowDatePicker,
		handleDatePickerChange,
		submit,
		submitError,
		isSubmitting,
		isEditMode,
	} = useAddPersonalTransactionForm();

	const categoryConfigs = PERSONAL_CATEGORY_CONFIGS[type];

	return (
		<ScreenContainer>
			<InternalScreenHeader
				title={isEditMode ? "Editar transacción" : "Añadir transacciones"}
			/>

			<KeyboardAwareScrollView
				showsVerticalScrollIndicator={false}
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ paddingBottom: 96 }}
			>
				{/* ── Tabs: GASTOS | INGRESOS ─────────────────────────────────────────── */}
				<View
					accessibilityRole="tablist"
					style={{
						flexDirection: "row",
						borderBottomWidth: 1,
						borderBottomColor: "#E5E7EB",
						marginHorizontal: 16,
						marginTop: 20,
					}}
				>
					{FORM_TABS.map((tab) => {
						const selected = tab.value === type;
						return (
							<Pressable
								key={tab.value}
								accessibilityRole="tab"
								accessibilityLabel={
									tab.label === "GASTOS"
										? "Añadir gasto personal"
										: "Añadir ingreso personal"
								}
								accessibilityState={{ selected }}
								onPress={() => changeType(tab.value)}
								testID={`personal-form-tab-${tab.value}`}
								style={{
									flex: 1,
									alignItems: "center",
									paddingVertical: 12,
									borderBottomWidth: selected ? 2 : 0,
									borderBottomColor: selected ? PRIMARY : "transparent",
									marginBottom: -1,
								}}
							>
								<Text
									style={{
										fontSize: 13,
										fontWeight: "600",
										letterSpacing: 0.5,
										color: selected ? PRIMARY : GRAY,
									}}
								>
									{tab.label}
								</Text>
							</Pressable>
						);
					})}
				</View>

				{/* ── Amount input ────────────────────────────────────────────────────── */}
				<View
					style={{
						alignItems: "center",
						paddingHorizontal: 16,
						paddingTop: 32,
						paddingBottom: 8,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							width: "100%",
							borderBottomWidth: 1,
							borderBottomColor: OUTLINE,
							paddingBottom: 12,
						}}
					>
						{/* The amount input is centered; ARS + icon sit at the right */}
						<View style={{ flex: 1, alignItems: "center" }}>
							<TextInput
								accessibilityLabel="Monto de la transacción personal"
								keyboardType="decimal-pad"
								placeholder="0"
								placeholderTextColor={GRAY}
								style={{
									fontSize: 28,
									fontWeight: "500",
									color: DARK,
									textAlign: "center",
									fontVariant: ["tabular-nums"],
									minWidth: 80,
								}}
								onChangeText={changeAmount}
								value={amount}
								testID="personal-transaction-amount-input"
							/>
						</View>
						{/* Currency + calculator */}
						<View
							style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
						>
							<Text style={{ fontSize: 13, color: GRAY, fontWeight: "500" }}>
								ARS
							</Text>
							<Calculator color={GRAY} size={16} strokeWidth={1.8} />
						</View>
					</View>

					{submitError ? (
						<Text
							accessibilityLiveRegion="polite"
							selectable
							style={{ fontSize: 13, color: colors.error, marginTop: 8 }}
						>
							{submitError}
						</Text>
					) : null}
				</View>

				{/* ── Descripción (note) field ────────────────────────────────────────── */}
				<View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
					<Text
						style={{
							fontSize: 12,
							fontWeight: "600",
							color: GRAY,
							marginBottom: 4,
						}}
					>
						Descripción
					</Text>
					<TextInput
						accessibilityLabel="Descripción"
						placeholder={notePlaceholder}
						placeholderTextColor={GRAY}
						maxLength={200}
						style={{
							fontSize: 14,
							color: DARK,
							borderBottomWidth: 1,
							borderBottomColor: OUTLINE,
							paddingBottom: 8,
						}}
						onChangeText={changeNote}
						value={note}
						testID="personal-note-input"
					/>
				</View>

				{/* ── Account row ─────────────────────────────────────────────────────── */}
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						paddingHorizontal: 16,
						paddingVertical: 16,
						gap: 8,
					}}
				>
					<Text style={{ fontSize: 12, fontWeight: "600", color: GRAY }}>
						Cuenta
					</Text>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Seleccionar cuenta"
					>
						<Text style={{ fontSize: 14, color: PRIMARY, fontWeight: "500" }}>
							Pesos
						</Text>
					</Pressable>
				</View>

				{/* ── Categories grid ─────────────────────────────────────────────────── */}
				<View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
					<Text
						style={{
							fontSize: 12,
							fontWeight: "600",
							color: GRAY,
							marginBottom: 16,
							letterSpacing: 0.3,
						}}
					>
						Categorías
					</Text>

					{/* 4-column grid */}
					<View
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							gap: 8,
						}}
					>
						{categoryConfigs.map((config) => {
							const selected = selectedCategory === config.name;
							return (
								<Pressable
									key={config.name}
									accessibilityRole="button"
									accessibilityLabel={`Categoría ${config.name}`}
									accessibilityState={{ selected }}
									onPress={() => setSelectedCategory(config.name)}
									testID={`personal-category-${config.name}`}
									style={{
										width: "23%",
										alignItems: "center",
										gap: 6,
										padding: 8,
										borderRadius: 16,
										backgroundColor: selected ? config.color : "transparent",
									}}
								>
									{/* Colored circle with icon */}
									<View
										style={{
											width: 52,
											height: 52,
											borderRadius: 26,
											backgroundColor: config.color,
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<config.Icon color="#ffffff" size={22} strokeWidth={1.8} />
									</View>
									{/* Category label */}
									<Text
										numberOfLines={1}
										style={{
											fontSize: 11,
											color: selected ? "#ffffff" : DARK,
											textAlign: "center",
										}}
									>
										{config.name}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				{type === "expense" ? (
					<PersonalExpenseTypeSelector
						value={expenseKind}
						onChange={setExpenseKind}
					/>
				) : null}

				{/* ── Date chips row ──────────────────────────────────────────────────── */}
				<View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
					<Text
						style={{
							fontSize: 12,
							fontWeight: "600",
							color: GRAY,
							marginBottom: 12,
							letterSpacing: 0.3,
						}}
					>
						Fecha
					</Text>

					<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
						{dateChips.map((chip) => {
							const selected = selectedDateId === chip.id;
							return (
								<Pressable
									key={chip.id}
									accessibilityRole="button"
									accessibilityLabel={
										chip.subLabel
											? `Fecha ${chip.label} ${chip.subLabel}`
											: `Fecha ${chip.label}`
									}
									accessibilityState={{ selected }}
									onPress={() => setSelectedDateId(chip.id)}
									testID={
										chip.id === "custom"
											? "date-chip-custom"
											: `personal-date-${chip.id}`
									}
									style={{
										paddingVertical: chip.subLabel ? 4 : 6,
										paddingHorizontal: 12,
										borderRadius: 8,
										borderWidth: selected ? 0 : 1,
										borderColor: "#d1d5db",
										backgroundColor: selected ? "#2ecc71" : "#ffffff",
										alignItems: "center",
										justifyContent: "center",
										minWidth: 56,
									}}
								>
									<Text
										style={{
											fontSize: 12,
											color: DARK,
											fontWeight: selected ? "600" : "400",
											textAlign: "center",
										}}
									>
										{chip.label}
									</Text>
									{chip.subLabel ? (
										<Text
											style={{
												fontSize: 10,
												color: DARK,
												fontWeight: selected ? "600" : "400",
												textAlign: "center",
											}}
										>
											{chip.subLabel}
										</Text>
									) : null}
								</Pressable>
							);
						})}

						{/* Calendar icon button */}
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Abrir calendario"
							accessibilityHint="Seleccionar otra fecha"
							accessibilityState={{ disabled: false }}
							onPress={() => setShowDatePicker(true)}
							testID="personal-date-calendar"
							style={{ padding: 6 }}
						>
							<CalendarDays color={DARK} size={22} strokeWidth={2} />
						</Pressable>
					</View>

					{showDatePicker ? (
						<DateTimePicker
							value={customDate ?? new Date()}
							mode="date"
							display="spinner"
							onChange={(_, date) => handleDatePickerChange(date)}
							testID="personal-date-picker"
						/>
					) : null}
				</View>
			</KeyboardAwareScrollView>

			{/* ── Sticky CTA button ───────────────────────────────────────────────── */}
			<View
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					paddingHorizontal: 16,
					paddingBottom: 32,
					paddingTop: 12,
					backgroundColor: colors.neutral100,
				}}
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={
						isEditMode
							? "Guardar cambios"
							: type === "income"
								? "Añadir ingreso"
								: "Añadir transacción"
					}
					accessibilityState={{ disabled: isSubmitting }}
					disabled={isSubmitting}
					onPress={submit}
					testID="submit-personal-transaction-button"
					style={{
						height: 52,
						borderRadius: 12,
						backgroundColor: PRIMARY,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						gap: 6,
						opacity: isSubmitting ? 0.7 : 1,
					}}
				>
					<Check color="#ffffff" size={18} strokeWidth={2.5} />
					<Text
						style={{
							fontSize: 16,
							fontWeight: "600",
							color: "#ffffff",
						}}
					>
						{isEditMode
							? "Guardar cambios"
							: type === "income"
								? "Añadir Ingreso"
								: "Añadir"}
					</Text>
				</Pressable>
			</View>
		</ScreenContainer>
	);
}
