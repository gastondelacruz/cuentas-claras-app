import { create } from 'zustand';

import { groupsListMock, groupsNetBalanceMock } from '../mocks/groupsList.mock';
import { inviteMembersRequiredMessage, invitedEmailsSchema } from '../schemas/new-group-schema';
import { GroupCategory, GroupImage, GroupListItem, GroupMemberPreview, StoredGroup } from '../types';

type GroupOwner = GroupMemberPreview & {
  email: string;
};

type CreateGroupInput = {
  category: GroupCategory;
  image: GroupImage;
  invitedEmails: string[];
  name: string;
  owner: GroupOwner;
};

type GroupsStore = {
  createGroup: (input: CreateGroupInput) => StoredGroup;
  groups: StoredGroup[];
  reset: () => void;
};

const defaultGroupImage: GroupImage = { type: 'default', uri: null };

function getInitialGroups(): StoredGroup[] {
  return groupsListMock.map((group) => ({
    ...group,
    image: defaultGroupImage,
    invitedEmails: [],
    ownerEmail: 'jane.doe@example.com',
  }));
}

function getInitialsFromValue(value: string) {
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

function createInvitedMemberPreview(email: string, index: number): GroupMemberPreview {
  return {
    id: `invite-${index}-${email}`,
    name: email,
    initials: getInitialsFromValue(email.split('@')[0] ?? email),
    avatarUrl: null,
  };
}

function buildPendingInvitesDescription(invitedEmails: string[]) {
  if (invitedEmails.length === 0) {
    return 'Sin invitaciones pendientes';
  }

  return invitedEmails.length === 1
    ? '1 invitación pendiente'
    : `${invitedEmails.length} invitaciones pendientes`;
}

export const useGroupsStore = create<GroupsStore>()((set) => ({
  groups: getInitialGroups(),
  createGroup: ({ category, image, invitedEmails, name, owner }) => {
    const parsedInvitedEmails = invitedEmailsSchema.safeParse(invitedEmails);

    if (!parsedInvitedEmails.success) {
      throw new Error(parsedInvitedEmails.error.flatten().formErrors[0] ?? inviteMembersRequiredMessage);
    }

    const normalizedInvitedEmails = parsedInvitedEmails.data;
    const invitedMembers = normalizedInvitedEmails.map(createInvitedMemberPreview);
    const visibleMembers = [owner, ...invitedMembers].slice(0, 3);
    const nextGroup: StoredGroup = {
      id: `group-${Date.now()}`,
      name,
      description: buildPendingInvitesDescription(normalizedInvitedEmails),
      category,
      status: { type: 'recent' },
      members: visibleMembers,
      extraMembersCount: Math.max(0, invitedMembers.length + 1 - visibleMembers.length),
      balance: 0,
      image,
      invitedEmails: normalizedInvitedEmails,
      ownerEmail: owner.email,
    };

    set((state) => ({ groups: [nextGroup, ...state.groups] }));

    return nextGroup;
  },
  reset: () => set({ groups: getInitialGroups() }),
}));

export function getGroupsNetBalance(groups: GroupListItem[]) {
  const seededGroupIds = new Set(groupsListMock.map((group) => group.id));

  return groups.reduce((total, group) => {
    if (seededGroupIds.has(group.id)) {
      return total;
    }

    return total + group.balance;
  }, groupsNetBalanceMock);
}
