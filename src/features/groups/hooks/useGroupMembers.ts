import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getGroup } from '../api/groupsApi';
import { GroupMember } from '../types';

function getInitialsFromValue(value: string): string {
  const tokens = value
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return 'NA';

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Returns the member list of a group from the API group detail.
 * Uses the same React Query cache as useGroupDetail — no double-fetch.
 */
export function useGroupMembers(groupId?: string): GroupMember[] {
  const { data: groupDetail } = useQuery({
    queryKey: queryKeys.groups.detail(groupId ?? ''),
    queryFn: () => getGroup(groupId!),
    enabled: Boolean(groupId),
  });

  return useMemo(() => {
    if (!groupDetail?.members?.length) return [];

    return groupDetail.members
      .filter((m) => !m.removedAt)
      .map((m) => ({
        id: m.id ?? m.displayName,
        name: m.displayName,
        initials: getInitialsFromValue(m.displayName),
        avatarUrl: null,
        isCurrentUser: m.isCurrentUser ?? false,
      }));
  }, [groupDetail]);
}
