import { useQuery } from "@tanstack/react-query";

import {
	getGroup,
	getGroupBalances,
	getGroupSettlements,
} from "../../groups/api/groupsApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import { useAuthStore, type AuthUser } from "../../../shared/store/authStore";
import {
	GroupBalanceItemDto,
	GroupDetailDto,
	GroupSettlementDto,
} from "../../groups/schemas/groupSchema";
import {
	findCurrentMemberBalance,
	getPayableAmount,
	getReceivableAmount,
	roundToCents,
} from "../../groups/utils/balanceContract";
import { SettlementItem, SettlementSummary } from "../types";

type UseSettleDebtsResult = {
	summary: SettlementSummary;
	items: SettlementItem[];
	settlements: GroupSettlementDto[];
	currentUserId: string | undefined;
	isLoading: boolean;
};

function getInitials(name: string): string {
	return name.slice(0, 2).toUpperCase();
}

function createPerson(id: string, name: string) {
	return { id, name, initials: getInitials(name), avatarUrl: null };
}

function getCurrentMemberId(
	groupDetail: GroupDetailDto | undefined,
	authUser: AuthUser | null,
): string | undefined {
	const currentMember = groupDetail?.members.find(
		(member) => member.isCurrentUser,
	);

	if (currentMember?.id) {
		return currentMember.id;
	}

	const authMatchedMember = groupDetail?.members.find(
		(member) =>
			(Boolean(member.id) && member.id === authUser?.id) ||
			(Boolean(member.email) && member.email === authUser?.email),
	);

	return authMatchedMember?.id;
}

function resolveCurrentUserBalance(
	balances: GroupBalanceItemDto[],
	groupDetail: GroupDetailDto | undefined,
	authUser: AuthUser | null,
): GroupBalanceItemDto | undefined {
	const markedBalance = findCurrentMemberBalance(balances);

	if (markedBalance) {
		return markedBalance;
	}

	const currentMemberId = getCurrentMemberId(groupDetail, authUser);

	if (currentMemberId) {
		return findCurrentMemberBalance(balances, currentMemberId);
	}

	if (authUser?.id) {
		return balances.find((balance) => balance.memberId === authUser.id);
	}

	return undefined;
}

function mapSettlementToItem(
	settlement: GroupSettlementDto,
	currentUserId: string | undefined,
): SettlementItem {
	const amount = roundToCents(settlement.amount);
	const id = `settlement-${settlement.fromMemberId}-${settlement.toMemberId}`;

	if (currentUserId !== undefined && settlement.toMemberId === currentUserId) {
		return {
			id,
			type: "with-user",
			person: createPerson(settlement.fromMemberId, settlement.fromMemberName),
			direction: "owes-you",
			amount,
		};
	}

	if (
		currentUserId !== undefined &&
		settlement.fromMemberId === currentUserId
	) {
		return {
			id,
			type: "with-user",
			person: createPerson(settlement.toMemberId, settlement.toMemberName),
			direction: "you-owe",
			amount,
		};
	}

	return {
		id,
		type: "between-members",
		from: createPerson(settlement.fromMemberId, settlement.fromMemberName),
		to: createPerson(settlement.toMemberId, settlement.toMemberName),
		amount,
	};
}

/**
 * Reads backend balances and settlements using the signed balance contract:
 * positive current-member balance means they should receive money; negative
 * means they owe money. Who-owes-whom rows come from the settlements endpoint.
 */
export function useSettleDebts(
	groupId: string | undefined,
): UseSettleDebtsResult {
	const authUser = useAuthStore((state) => state.user);
	const protectedDataEnabled = useProtectedDataEnabled();

	const { data: groupDetail, isLoading: isGroupLoading } = useQuery({
		queryKey: groupId ? queryKeys.groups.detail(groupId) : [],
		queryFn: () => getGroup(groupId!),
		enabled: Boolean(groupId) && protectedDataEnabled,
	});

	const { data: balancesData, isLoading: isBalancesLoading } = useQuery({
		queryKey: groupId ? queryKeys.groups.balances(groupId) : [],
		queryFn: () => getGroupBalances(groupId!),
		enabled: Boolean(groupId) && protectedDataEnabled,
	});

	const { data: settlementsData, isLoading: isSettlementsLoading } = useQuery({
		queryKey: groupId ? queryKeys.groups.settlements(groupId) : [],
		queryFn: () => getGroupSettlements(groupId!),
		enabled: Boolean(groupId) && protectedDataEnabled,
	});

	const balances = protectedDataEnabled ? (balancesData?.balances ?? []) : [];
	const currentUserBalance = resolveCurrentUserBalance(
		balances,
		groupDetail,
		authUser,
	);
	const currentUserId = currentUserBalance?.memberId;
	const currentSignedBalance = currentUserBalance?.balance ?? 0;
	const settlements = protectedDataEnabled
		? (settlementsData?.settlements ?? [])
		: [];
	const items = settlements.map((settlement) =>
		mapSettlementToItem(settlement, currentUserId),
	);

	items.sort((a, b) => {
		const aOwesYou = a.type === "with-user" && a.direction === "owes-you";
		const bOwesYou = b.type === "with-user" && b.direction === "owes-you";
		if (aOwesYou !== bOwesYou) return aOwesYou ? -1 : 1;
		return b.amount - a.amount;
	});

	return {
		summary: {
			owedToYou: getReceivableAmount(currentSignedBalance),
			youOwe: getPayableAmount(currentSignedBalance),
		},
		items,
		settlements,
		currentUserId,
		isLoading:
			protectedDataEnabled &&
			(isGroupLoading || isBalancesLoading || isSettlementsLoading),
	};
}
