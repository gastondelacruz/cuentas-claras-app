import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import { useMemo, useState } from "react";

import type { RootStackParamList } from "../../../app/navigation/types";
import { maskAmountInput } from "../../expenses/utils/maskAmountInput";
import { getPersonalTransactionCategories } from "../constants/personalTransactionCategories";
import type { PersonalExpenseType, PersonalTransactionType } from "../types";
import { getMockEditablePersonalTransaction } from "../mocks/personalTransactionEditMock";
import { DEFAULT_PERSONAL_EXPENSE_TYPE } from "../utils/personalExpenseType";
import { useCreatePersonalTransaction } from "./useCreatePersonalTransaction";
import { useUpdatePersonalTransaction } from "./useUpdatePersonalTransaction";
import { useDeletePersonalTransaction } from "./useDeletePersonalTransaction";

type AddPersonalTransactionNavigation = NativeStackNavigationProp<
	RootStackParamList,
	"AddPersonalTransaction"
>;
type AddPersonalTransactionRoute = RouteProp<
	RootStackParamList,
	"AddPersonalTransaction"
>;

const CURRENCY = "ARS";

type DateChipId = "today" | "yesterday" | "last" | "custom";

type DateChip = {
	id: DateChipId;
	label: string;
	subLabel?: string;
	date: Date;
};

function formatShortDate(date: Date) {
	return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
}

/**
 * Builds the date chip options relative to `now`.
 * All dates use noon UTC so they remain unambiguous across timezones.
 */
function getDateChips(now: Date, customDate: Date | null): DateChip[] {
	const todayNoon = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate(),
			12,
			0,
			0,
		),
	);
	const yesterdayNoon = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() - 1,
			12,
			0,
			0,
		),
	);

	const todayLabel = `${formatShortDate(now)} hoy`;
	const yesterdayLabel = `${formatShortDate(yesterdayNoon)} ayer`;

	const chips: DateChip[] = [
		{ id: "today", label: todayLabel, date: todayNoon },
		{ id: "yesterday", label: yesterdayLabel, date: yesterdayNoon },
		// "último" is a static placeholder for the most-recent past transaction date.
		// TODO: derive from the user's transaction history once the API supports it.
		{
			id: "last",
			label: "14/9 último",
			date: new Date("2025-09-14T12:00:00.000Z"),
		},
	];

	if (customDate) {
		const customNoon = new Date(
			Date.UTC(
				customDate.getUTCFullYear(),
				customDate.getUTCMonth(),
				customDate.getUTCDate(),
				12,
				0,
				0,
			),
		);
		chips.push({
			id: "custom",
			label: formatShortDate(customNoon),
			subLabel: "elegida",
			date: customNoon,
		});
	}

	return chips;
}

function parseAmount(value: string) {
	const normalized = value.replace(/\./g, "").replace(",", ".");
	const amount = Number(normalized);

	return Number.isFinite(amount) ? amount : 0;
}

function formatAmountInput(value: number) {
	return maskAmountInput(String(value));
}

const NOTE_PLACEHOLDERS: Record<PersonalTransactionType, string> = {
	expense: "¿En qué gastaste?",
	income: "¿De qué es este ingreso?",
};

export function useAddPersonalTransactionForm() {
	const navigation = useNavigation<AddPersonalTransactionNavigation>();
	const route = useRoute<AddPersonalTransactionRoute>();
	const transactionId = route.params?.transactionId;
	const editableTransaction = useMemo(
		() =>
			transactionId
				? getMockEditablePersonalTransaction(transactionId)
				: undefined,
		[transactionId],
	);
	const isEditMode = transactionId !== undefined;
	const initialType =
		editableTransaction?.type ?? route.params?.type ?? "expense";
	const [type, setType] = useState<PersonalTransactionType>(initialType);
	const [expenseKind, setExpenseKind] = useState<PersonalExpenseType>(
		editableTransaction?.expenseKind ?? DEFAULT_PERSONAL_EXPENSE_TYPE,
	);
	const categories = useMemo(
		() =>
			getPersonalTransactionCategories(type).filter(
				(category) => category !== "Más",
			),
		[type],
	);
	const [selectedCategory, setSelectedCategory] = useState<string>(() => {
		if (
			editableTransaction &&
			categories.includes(editableTransaction.category)
		) {
			return editableTransaction.category;
		}

		return categories[0];
	});
	const [amount, setAmount] = useState(() =>
		editableTransaction ? formatAmountInput(editableTransaction.amount) : "",
	);
	const [note, setNote] = useState(() => editableTransaction?.note ?? "");
	const notePlaceholder = NOTE_PLACEHOLDERS[type];

	// Date chips are computed relative to the moment the form opens so labels stay
	// stable during the form session. new Date() is intercepted by jest.useFakeTimers in tests.
	const [now] = useState(() => new Date());
	const [customDate, setCustomDate] = useState<Date | null>(() =>
		editableTransaction ? new Date(editableTransaction.occurredAt) : null,
	);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const dateChips = useMemo(
		() => getDateChips(now, customDate),
		[now, customDate],
	);
	const [selectedDateId, setSelectedDateId] = useState<DateChipId>(
		editableTransaction ? "custom" : "today",
	);

	const [submitError, setSubmitError] = useState<string | undefined>();
	const createMutation = useCreatePersonalTransaction();
	const updateMutation = useUpdatePersonalTransaction();
	const deleteMutation = useDeletePersonalTransaction();

	function changeType(nextType: PersonalTransactionType) {
		setType(nextType);
		setSelectedCategory(
			getPersonalTransactionCategories(nextType).filter(
				(category) => category !== "Más",
			)[0],
		);
	}

	function changeAmount(value: string) {
		setAmount(maskAmountInput(value));
	}

	function changeNote(value: string) {
		setNote(value);
	}

	function applyCustomDate(date: Date) {
		const normalizedDate = new Date(
			Date.UTC(
				date.getUTCFullYear(),
				date.getUTCMonth(),
				date.getUTCDate(),
				12,
			),
		);
		setCustomDate(normalizedDate);
		setSelectedDateId("custom");
		setShowDatePicker(false);
	}

	const calendarInitialDate =
		customDate ??
		dateChips.find((chip) => chip.id === selectedDateId)?.date ??
		dateChips[0].date;

	function deleteTransaction() {
		if (!transactionId) return;
		Alert.alert(
			"Eliminar transacción",
			"¿Seguro que querés eliminar esta transacción? Esta acción no se puede deshacer.",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: () =>
						deleteMutation.mutate(transactionId, {
							onSuccess: () => navigation.goBack(),
							onError: () =>
								Alert.alert(
									"No pudimos eliminar la transacción",
									"Intentá de nuevo.",
								),
						}),
				},
			],
		);
	}

	function submit() {
		setSubmitError(undefined);
		const parsedAmount = parseAmount(amount);

		if (parsedAmount <= 0) {
			setSubmitError("Ingresá un monto mayor a 0");
			return;
		}

		const selectedChip =
			dateChips.find((chip) => chip.id === selectedDateId) ?? dateChips[0];
		const trimmedNote = note.trim();

		if (transactionId) {
			updateMutation.mutate(
				{
					transactionId,
					type,
					...(type === "expense" ? { expenseKind } : {}),
					amount: parsedAmount,
					currency: CURRENCY,
					category: selectedCategory,
					occurredAt: selectedChip.date.toISOString(),
					// Edit mode always sends `note`: the trimmed value, or `null` to explicitly
					// clear it on the backend. Omitting it here would leave the existing note
					// untouched (PATCH is a partial update), which is not what an emptied field means.
					note: trimmedNote ? trimmedNote : null,
				},
				{
					onSuccess: () => navigation.goBack(),
					onError: () =>
						setSubmitError("No pudimos guardar los cambios. Intentá de nuevo."),
				},
			);
			return;
		}

		createMutation.mutate(
			{
				type,
				...(type === "expense" ? { expenseKind } : {}),
				amount: parsedAmount,
				currency: CURRENCY,
				category: selectedCategory,
				// accountId intentionally omitted: the backend defaults to the
				// user's default account when it's not provided (see swagger-spec.json).
				occurredAt: selectedChip.date.toISOString(),
				...(trimmedNote ? { note: trimmedNote } : {}),
			},
			{
				onSuccess: () => navigation.goBack(),
				onError: () =>
					setSubmitError("No pudimos añadir la transacción. Intentá de nuevo."),
			},
		);
	}

	return {
		type,
		changeType,
		expenseKind,
		setExpenseKind,
		amount,
		changeAmount,
		note,
		changeNote,
		notePlaceholder,
		selectedCategory,
		setSelectedCategory,
		dateChips,
		selectedDateId,
		setSelectedDateId,
		customDate,
		calendarInitialDate,
		showDatePicker,
		setShowDatePicker,
		applyCustomDate,
		submit,
		deleteTransaction,
		submitError,
		isSubmitting:
			createMutation.isPending ||
			updateMutation.isPending ||
			deleteMutation.isPending,
		isEditMode,
	};
}
