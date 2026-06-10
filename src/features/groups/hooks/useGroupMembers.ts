import { useMemo } from 'react';

import { AuthUser, useAuthStore } from '../../../shared/store/authStore';
import { groupsListMock } from '../mocks/groupsList.mock';
import { useGroupsStore } from '../store/groupsStore';
import { GroupMember, StoredGroup } from '../types';

function getInitialsFromValue(value: string): string {
  const tokens = value
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return 'NA';
  }

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

function buildCurrentUser(authUser: AuthUser | null): GroupMember {
  return {
    id: authUser?.id ?? 'current-user',
    name: 'Vos',
    initials: 'YO',
    avatarUrl: null,
    isCurrentUser: true,
  };
}

/**
 * Resolves the member list of a group, always including the current user first.
 *
 * Seeded mock groups expose their preview members; user-created groups expose
 * the owner plus every invited email. This is the single source of truth for
 * "who can participate in / pay for an expense" of a given group.
 */
export function buildGroupMembers(
  group: StoredGroup | undefined,
  authUser: AuthUser | null,
): GroupMember[] {
  const currentUser = buildCurrentUser(authUser);

  if (!group) {
    return [currentUser];
  }

  const seededMockGroup = groupsListMock.find((mockGroup) => mockGroup.id === group.id);
  const invitedMembers: GroupMember[] = group.invitedEmails.map((email, index) => ({
    id: `invite-${index}-${email}`,
    name: email,
    initials: getInitialsFromValue(email.split('@')[0] ?? email),
    avatarUrl: null,
    isCurrentUser: false,
  }));

  if (seededMockGroup) {
    const previewMembers: GroupMember[] = seededMockGroup.members.map((member) => ({
      ...member,
      isCurrentUser: false,
    }));

    return [currentUser, ...previewMembers, ...invitedMembers];
  }

  return [currentUser, ...invitedMembers];
}

export function useGroupMembers(groupId?: string): GroupMember[] {
  const group = useGroupsStore((state) => state.groups.find((item) => item.id === groupId));
  const authUser = useAuthStore((state) => state.user);

  return useMemo(() => buildGroupMembers(group, authUser), [group, authUser]);
}
