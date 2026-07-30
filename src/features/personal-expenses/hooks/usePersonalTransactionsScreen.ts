import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
	MainTabParamList,
	RootStackParamList,
} from "../../../app/navigation/types";
import { isEnhancedInitialLoadingEnabled } from "../../../shared/feature-flags/initialLoadingFlags";
import { getPersonalCategoryVisual } from "../constants/personalTransactionCategoryVisuals";
import { usePersonalCategories } from "./usePersonalCategories";
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
	getCategoryVisual: (
		type: PersonalTransactionType,
		categoryName: string,
	) => ReturnType<typeof getPersonalCategoryVisual>,
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
				color: getCategoryVisual(type, item.category).color,
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
	const { categories } = usePersonalCategories();
	const getCategoryVisual = useCallback(
		(categoryType: PersonalTransactionType, categoryName: string) =>
			getPersonalCategoryVisual(
				categoryType,
				categoryName,
				categories.find(
					(category) =>
						category.type === categoryType && category.name === categoryName,
				),
				categories,
			),
		[categories],
	);
	const [range, setRange] = useState<PersonalTransactionRange>("month");
	const [periodRange, setPeriodRange] = useState<PeriodRange | null>(null);
	const [periodCursor, setPeriodCursor] = useState<Date | null>(null);
	const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

	const isPeriod = range === "period";
	const navigationRange = isPeriod ? "month" : range;
	const now = new Date();
	const currentRange = computeDateRange(navigationRange, now);
	const selectedRange = computeDateRange(navigationRange, periodCursor ?? now);
	const isCurrentPeriod =
		!isPeriod &&
		selectedRange.from === currentRange.from &&
		selectedRange.to === currentRange.to;

	const shiftPeriodCursor = useCallback(
		(direction: -1 | 1) => {
			if (isPeriod || (direction === 1 && isCurrentPeriod)) return;
			const cursor = periodCursor ?? now;
			const amount =
				direction * (range === "day" ? 1 : range === "week" ? 7 : 1);
			const nextCursor =
				range === "month"
					? new Date(
							Date.UTC(
								cursor.getUTCFullYear(),
								cursor.getUTCMonth() + amount,
								15,
							),
						)
					: range === "year"
						? new Date(Date.UTC(cursor.getUTCFullYear() + amount, 6, 15))
						: new Date(
								Date.UTC(
									cursor.getUTCFullYear(),
									cursor.getUTCMonth(),
									cursor.getUTCDate() + amount,
								),
							);
			setPeriodCursor(nextCursor);
		},
		[isCurrentPeriod, isPeriod, now, periodCursor, range],
	);

	function navigateToPreviousPeriod() {
		shiftPeriodCursor(-1);
	}

	function navigateToNextPeriod() {
		shiftPeriodCursor(1);
	}

	function navigateToCurrentPeriod() {
		if (!isPeriod) setPeriodCursor(null);
	}

	const from =
		isPeriod && periodRange
			? startOfDayIso(periodRange.from)
			: periodCursor && selectedRange.from
				? `${selectedRange.from}T00:00:00.000Z`
				: undefined;
	const to =
		isPeriod && periodRange
			? endOfDayIso(periodRange.to)
			: periodCursor && selectedRange.to
				? `${selectedRange.to}T23:59:59.999Z`
				: undefined;

	const rangeLabel = useMemo(() => {
		if (isPeriod && periodRange) {
			return formatPeriodLabel(periodRange.from, periodRange.to);
		}
		return selectedRange.rangeLabel;
	}, [isPeriod, periodRange, selectedRange]);

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
		setPeriodCursor(null);
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
		? buildChartSegments(summary.breakdown, type, getCategoryVisual)
		: [];
	const categoryBreakdown = shouldUseSummary
		? summary.breakdown.filter((item) => item.type === type)
		: [];
	const categoryRows = categoryBreakdown
		.filter((item) => item.amount > 0 && item.percentage > 0)
		.map((item) => {
			const visual = getCategoryVisual(type, item.category);
			return {
				category: item.category,
				amount: item.amount,
				percentage: item.percentage,
				color: visual.color,
				Icon: visual.Icon,
				accessibilityLabel: `Ver detalle de la categoría ${item.category}`,
				onPress: () => navigateToCategoryDetail(item.category, item.percentage),
			};
		});

	return {
		type,
		setType,
		expenseKindFilter,
		setExpenseKindFilter,
		range,
		selectRange,
		rangeLabel,
		isCurrentPeriod,
		navigateToPreviousPeriod,
		navigateToNextPeriod,
		navigateToCurrentPeriod,
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
