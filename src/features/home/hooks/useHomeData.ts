import type { GroupListItemDto } from '../../groups/api/groupsApi';
import { getReceivableAmount, getSignedPayableAmount, roundToCents } from '../../groups/utils/balanceContract';
import { useGroups } from '../../groups/hooks/useGroups';
import type { HomeActivity, HomeDashboardData, UseHomeDataResult } from '../types';

type HomeSourceGroup = Pick<GroupListItemDto, 'id' | 'name' | 'currentUserBalance'>;

function getGroupCoverUrl(groupId: string) {
  return `https://picsum.photos/seed/${groupId}/400/300`;
}

function mapGroupToHomeGroup(group: HomeSourceGroup) {
  return {
    id: group.id,
    name: group.name,
    category: 'Otros',
    coverUrl: getGroupCoverUrl(group.id),
    members: [],
    extraMembersCount: 0,
    activeDebtsLabel: 'Recién creado',
  };
}

function buildSummaryFromGroups(groups: HomeSourceGroup[]) {
  const owedToYou = roundToCents(
    groups.reduce((sum, group) => sum + getReceivableAmount(group.currentUserBalance ?? 0), 0),
  );
  const youOwe = roundToCents(
    groups.reduce((sum, group) => sum + getSignedPayableAmount(group.currentUserBalance ?? 0), 0),
  );

  return {
    owedToUser: { id: 'owed-to-user', title: 'Te deben', amount: owedToYou, detail: 'Resumen' },
    owedByUser: { id: 'owed-by-user', title: 'Debes', amount: youOwe, detail: 'Resumen' },
  };
}


export function useHomeData(): UseHomeDataResult {
  const { data: groupsResponse, isLoading: isGroupsLoading, isError: isGroupsError, error: groupsError } = useGroups();

  const groups = groupsResponse?.data ?? [];
  const summary = buildSummaryFromGroups(groups);
  const activeGroups = groups.slice(0, 2).map(mapGroupToHomeGroup);
  const recentActivity: HomeActivity[] = [];

  const data: HomeDashboardData | null = isGroupsLoading
    ? null
    : { summary, activeGroups, recentActivity };

  return {
    data,
    summary,
    activeGroups,
    recentActivity,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    error: groupsError as Error | null,
  };
}
