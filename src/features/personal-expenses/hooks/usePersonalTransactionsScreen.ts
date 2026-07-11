import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";

import type {
	MainTabParamList,
	RootStackParamList,
} from "../../../app/navigation/types";
import { isEnhancedInitialLoadingEnabled } from "../../../shared/feature-flags/initialLoadingFlags";
import { getPersonalCategoryVisual } from "../constants/personalTransactionCategoryVisuals";
import type { PersonalTransactionSummaryResponseDto } from "../schemas/personalTransactionSchema";
import { computeDateRange } from "../utils/computeDateRange";
import { rememberMockEditablePersonalTransaction } from "../mocks/personalTransactionEditMock";
import { prefetchAlternatePersonalTransactions } from "../api/personalTransactionPrefetch";
import { filterPersonalExpenseTransactions } from "../utils/personalExpenseType";
import { usePersonalTransactions } from "./usePersonalTransactions";
import { usePersonalTransactionsSummary } from "./usePersonalTransactionsSummary";
import type { PersonalTransactionDto } from "../schemas/personalTransactionSchema";
import type {
	PersonalExpenseTypeFilter,
	PersonalTransactionChartSegment,
	PersonalTransactionRange,
	PersonalTransactionType,
} from "../types";

type PersonalTransactionsNavigation = BottomTabNavigationProp<
	MainTabParamList,
	"PersonalExpenses"
>;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const DONUT_CIRCUMFERENCE = 251.3;

function formatDashValue(value: number) {
	return value.toFixed(1).replace(/\.0$/, "");
}

function buildChartSegments(
	breakdown: PersonalTransactionSummaryResponseDto["breakdown"],
	type: PersonalTransactionType,
): PersonalTransactionChartSegment[] {
	let offset = 0;

	return breakdown
		.filter(
			(item) => item.type === type && item.amount > 0 && item.percentage > 0,
		)
		.map((item) => {
			const length =
				(DONUT_CIRCUMFERENCE * Math.min(item.percentage, 100)) / 100;
			const segment = {
				color: getPersonalCategoryVisual(type, item.category).color,
				dasharray: `${formatDashValue(length)} ${formatDashValue(DONUT_CIRCUMFERENCE - length)}`,
				...(offset > 0 ? { dashoffset: `-${formatDashValue(offset)}` } : {}),
			};
			offset += length;
			return segment;
		});
}

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

function startOfDayIso(date: Date) {
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			0,
			0,
			0,
			0,
		),
	).toISOString();
}

function endOfDayIso(date: Date) {
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			23,
			59,
			59,
			999,
		),
	).toISOString();
}

function formatPeriodLabel(from: Date, to: Date) {
	const label = (d: Date) =>
		`${d.getUTCDate()} ${MONTHS_ES_SHORT[d.getUTCMonth()]}`;
	return `${label(from)} – ${label(to)} ${to.getUTCFullYear()}`;
}

type PeriodRange = { from: Date; to: Date };

export function usePersonalTransactionsScreen() {
	const navigation = useNavigation<PersonalTransactionsNavigation>();
	const rootNavigation = navigation.getParent?.<RootNavigation>();
	const [type, setType] = useState<PersonalTransactionType>("expense");
	const [expenseKindFilter, setExpenseKindFilter] =
		useState<PersonalExpenseTypeFilter>("all");
	const [range, setRange] = useState<PersonalTransactionRange>("week");
	const [periodRange, setPeriodRange] = useState<PeriodRange | null>(null);
	const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

	const isPeriod = range === "period";

	const from =
		isPeriod && periodRange ? startOfDayIso(periodRange.from) : undefined;
	const to = isPeriod && periodRange ? endOfDayIso(periodRange.to) : undefined;

	const rangeLabel = useMemo(() => {
		if (isPeriod && periodRange) {
			return formatPeriodLabel(periodRange.from, periodRange.to);
		}
		return computeDateRange(range).rangeLabel;
	}, [isPeriod, periodRange, range]);

	const transactionQuery = usePersonalTransactions({
		type,
		range,
		from,
		to,
	});
	const summaryQuery = usePersonalTransactionsSummary({
		range,
		from,
		to,
	});

	useEffect(() => {
		if (!isEnhancedInitialLoadingEnabled()) return;

		prefetchAlternatePersonalTransactions({ type, range, from, to });
	}, [from, range, to, type]);

	function selectRange(nextRange: PersonalTransactionRange) {
		if (nextRange === "period") {
			setIsPeriodModalOpen(true);
			return;
		}
		setRange(nextRange);
	}

	function applyPeriod(nextFrom: Date, nextTo: Date) {
		const [orderedFrom, orderedTo] =
			nextFrom.getTime() <= nextTo.getTime()
				? [nextFrom, nextTo]
				: [nextTo, nextFrom];
		setPeriodRange({ from: orderedFrom, to: orderedTo });
		setRange("period");
		setIsPeriodModalOpen(false);
	}

	function closePeriodModal() {
		setIsPeriodModalOpen(false);
	}

	function navigateToAddTransaction() {
		rootNavigation?.navigate("AddPersonalTransaction", { type });
	}

	function navigateToEditTransaction(transaction: PersonalTransactionDto) {
		rememberMockEditablePersonalTransaction(transaction);
		rootNavigation?.navigate("AddPersonalTransaction", {
			type: transaction.type,
			transactionId: transaction.id,
		});
	}

	function navigateToCategoryDetail(category: string, percentage: number) {
		rootNavigation?.navigate("PersonalCategoryDetail", {
			type,
			category,
			range,
			from,
			to,
			expenseKind:
				type === "expense" && expenseKindFilter !== "all"
					? expenseKindFilter
					: undefined,
			percentage,
		});
	}

	const shouldUseBackendTransactions = transactionQuery.hasFetchedTransactions;
	const summary = summaryQuery.summary;
	const shouldUseSummary =
		summaryQuery.hasFetchedSummary && summary !== undefined;
	const backendTransactions = shouldUseBackendTransactions
		? transactionQuery.transactions
		: [];
	const displayTransactions =
		type === "expense"
			? filterPersonalExpenseTransactions(
					backendTransactions,
					expenseKindFilter,
				)
			: backendTransactions;
	const displayTotal = shouldUseSummary
		? type === "income"
			? summary.incomeTotal
			: summary.expenseTotal
		: 0;
	const displaySummaryTotal = shouldUseSummary ? summary.total : 0;
	const displaySummaryCurrency = shouldUseSummary ? summary.currency : "ARS";
	const displayCurrency = shouldUseSummary ? summary.currency : "ARS";
	const chartSegments = shouldUseSummary
		? buildChartSegments(summary.breakdown, type)
		: [];
	const categoryRows = shouldUseSummary
		? summary.breakdown
				.filter(
					(item) =>
						item.type === type && item.amount > 0 && item.percentage > 0,
				)
				.map((item) => {
					const visual = getPersonalCategoryVisual(type, item.category);
					return {
						category: item.category,
						amount: item.amount,
						percentage: item.percentage,
						color: visual.color,
						Icon: visual.Icon,
						accessibilityLabel: `Ver detalle de la categoría ${item.category}`,
						onPress: () =>
							navigateToCategoryDetail(item.category, item.percentage),
					};
				})
		: [];

	return {
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
		navigateToAddTransaction,
		navigateToEditTransaction,
		navigateToCategoryDetail,
		chartSegments,
		categoryRows,
		displayTransactions,
		displayTotal,
		displaySummaryTotal,
		displaySummaryCurrency,
		displayCurrency,
		isLoading: transactionQuery.isLoading || summaryQuery.isLoading,
		isError: transactionQuery.isError || summaryQuery.isError,
		error: transactionQuery.error ?? summaryQuery.error,
	};
}
