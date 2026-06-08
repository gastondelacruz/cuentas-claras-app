import { useGroupsStore } from '../../groups/store/groupsStore';
import type { GroupCategory, GroupStatus, StoredGroup } from '../../groups/types';
import { homeMockData } from '../mocks/home.mock';
import type { UseHomeDataResult } from '../types';

const homeCategoryLabels: Record<GroupCategory, string> = {
  TRAVEL: 'Viajes',
  HOME: 'Hogar',
  FOOD: 'Comida',
  EVENT: 'Eventos',
  OTHER: 'Otros',
};

function getGroupCoverUrl(group: StoredGroup) {
  if (group.image.type === 'uploaded') {
    return group.image.uri;
  }

  return `https://picsum.photos/seed/${group.id}/400/300`;
}

function getActiveDebtsLabel(status: GroupStatus) {
  if (status.type === 'pending') {
    return `${status.count} ${status.count === 1 ? 'deuda activa' : 'deudas activas'}`;
  }

  if (status.type === 'recent') {
    return 'Recién creado';
  }

  return 'Sin deudas activas';
}

function mapGroupToHomeGroup(group: StoredGroup) {
  return {
    id: group.id,
    name: group.name,
    category: homeCategoryLabels[group.category],
    coverUrl: getGroupCoverUrl(group),
    members: group.members,
    extraMembersCount: group.extraMembersCount,
    activeDebtsLabel: getActiveDebtsLabel(group.status),
  };
}

export function useHomeData(): UseHomeDataResult {
  const groups = useGroupsStore((state) => state.groups);
  const activeGroups = groups.slice(0, 2).map(mapGroupToHomeGroup);

  return {
    data: {
      summary: homeMockData.summary,
      activeGroups,
      recentActivity: homeMockData.recentActivity,
    },
    summary: homeMockData.summary,
    activeGroups,
    recentActivity: homeMockData.recentActivity,
    isLoading: false,
    isError: false,
    error: null,
  };
}
