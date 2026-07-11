import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { RootStackParamList } from "../../../app/navigation/types";
import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import {
	personalTransactionsCategoryDetailQueryOptions,
	personalTransactionsFilteredTotalsQueryOptions,
} from "../api/personalTransactionQueryOptions";
import { getPersonalCategoryVisual } from "../constants/personalTransactionCategoryVisuals";
import { rememberMockEditablePersonalTransaction } from "../mocks/personalTransactionEditMock";
import { useDeletePersonalTransaction } from "./useDeletePersonalTransaction";
import { computeDateRange } from "../utils/computeDateRange";
import {
	filterPersonalExpenseTransactions,
	resolvePersonalExpenseType,
} from "../utils/personalExpenseType";
import type { PersonalExpenseTypeFilter } from "../types";
import type { PersonalTransactionDto } from "../schemas/personalTransactionSchema";

const MONTHS_ES_SHORT = [
	"ene",
	"feb",
	"mar",
	"abr",
	"may",
	"jun",
	"jul",
	"ago",
	"sep",
	"oct",
	"nov",
	"dic",
] as const;

function formatPeriodLabel(from: Date, to: Date) {
	const label = (date: Date) =>
		`${date.getUTCDate()} ${MONTHS_ES_SHORT[date.getUTCMonth()]}`;
	return `${label(from)} – ${label(to)} ${to.getUTCFullYear()}`;
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

function formatTotal(value: number, currency: string) {
	const formatted = new Intl.NumberFormat("es-AR", {
		maximumFractionDigits: 0,
	}).format(value);
	return currency === "ARS" ? `${formatted} $` : `${formatted} ${currency}`;
}

type PersonalCategoryDetailRoute = RouteProp<
	RootStackParamList,
	"PersonalCategoryDetail"
>;

type PersonalCategoryDetailNavigation =
	NativeStackNavigationProp<RootStackParamList>;

export function usePersonalCategoryDetailScreen() {
	const route = useRoute<PersonalCategoryDetailRoute>();
	const navigation = useNavigation<PersonalCategoryDetailNavigation>();
	const protectedDataEnabled = useProtectedDataEnabled();
	const deleteMutation = useDeletePersonalTransaction();
	const [expenseKindFilter, setExpenseKindFilter] =
		useState<PersonalExpenseTypeFilter>(route.params.expenseKind ?? "all");

	const queryFilters = useMemo(
		() => ({
			type: route.params.type,
			category: route.params.category,
			range: route.params.range,
			from: route.params.from,
			to: route.params.to,
			expenseKind:
				route.params.type === "expense" && expenseKindFilter !== "all"
					? expenseKindFilter
					: undefined,
		}),
		[
			expenseKindFilter,
			route.params.category,
			route.params.from,
			route.params.range,
			route.params.to,
			route.params.type,
		],
	);

	const query = useQuery({
		...personalTransactionsCategoryDetailQueryOptions(queryFilters),
		enabled: protectedDataEnabled,
	});
	const { category: _category, ...globalFilters } = queryFilters;
	const globalTotalsQuery = useQuery({
		...personalTransactionsFilteredTotalsQueryOptions(globalFilters),
		enabled: protectedDataEnabled && route.params.type === "expense",
	});

	const data = protectedDataEnabled ? query.data : undefined;
	const transactions = (data?.transactions ?? []).map((transaction) => {
		if (transaction.type !== "expense") {
			return transaction;
		}

		return {
			...transaction,
			expenseKind: resolvePersonalExpenseType(transaction.expenseKind),
		};
	});

	const filteredTransactions = useMemo(() => {
		const categoryTransactions = transactions.filter(
			(transaction) => transaction.category === route.params.category,
		);

		if (route.params.type !== "expense") {
			return categoryTransactions;
		}

		return filterPersonalExpenseTransactions(
			categoryTransactions,
			expenseKindFilter,
		);
	}, [
		expenseKindFilter,
		route.params.category,
		route.params.type,
		transactions,
	]);

	const displayTotal = filteredTransactions.reduce(
		(sum, transaction) => sum + transaction.amount,
		0,
	);
	const displayCurrency = data?.currency ?? "ARS";
	const percentage =
		route.params.type === "expense"
			? globalTotalsQuery.data?.expenseTotal
				? Math.round(
						(displayTotal / globalTotalsQuery.data.expenseTotal) * 10000,
					) / 100
				: 0
			: route.params.percentage;
	const categoryVisual = getPersonalCategoryVisual(
		route.params.type,
		route.params.category,
	);
	const rangeLabel = useMemo(() => {
		if (
			route.params.range === "period" &&
			route.params.from &&
			route.params.to
		) {
			return formatPeriodLabel(
				new Date(route.params.from),
				new Date(route.params.to),
			);
		}

		return computeDateRange(route.params.range).rangeLabel;
	}, [route.params.from, route.params.range, route.params.to]);

	function deleteTransaction(transactionId: string) {
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

	function navigateToEditTransaction(transaction: PersonalTransactionDto) {
		rememberMockEditablePersonalTransaction(transaction);
		navigation.navigate("AddPersonalTransaction", {
			type: transaction.type,
			transactionId: transaction.id,
		});
	}

	return {
		category: route.params.category,
		type: route.params.type,
		rangeLabel,
		expenseKindFilter,
		setExpenseKindFilter,
		categoryVisual,
		transactions: filteredTransactions,
		displayTotal,
		displayCurrency,
		displayTotalLabel: formatTotal(displayTotal, displayCurrency),
		displayShareLabel: `${percentage}% del total`,
		isLoading: protectedDataEnabled && query.isLoading,
		isError: protectedDataEnabled && query.isError,
		error: protectedDataEnabled ? query.error : null,
		hasFetchedTransactions: data !== undefined,
		navigateToEditTransaction,
		deleteTransaction,
		formatDate,
	};
}
