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

type UpdateGroupInput = CreateGroupInput & {
  groupId: string;
};

type GroupsStore = {
  createGroup: (input: CreateGroupInput) => StoredGroup;
  deleteGroup: (groupId: string) => void;
  deletedGroupIds: string[];
  groups: StoredGroup[];
  reset: () => void;
  updateGroup: (input: UpdateGroupInput) => StoredGroup;
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

function isSeededMockGroup(groupId: string) {
  return groupsListMock.some((group) => group.id === groupId);
}

function getSeededMockGroup(groupId: string) {
  return groupsListMock.find((group) => group.id === groupId);
}

function parseInvitedEmails(invitedEmails: string[], allowEmpty: boolean) {
  if (allowEmpty && invitedEmails.length === 0) {
    return [];
  }

  const parsedInvitedEmails = invitedEmailsSchema.safeParse(invitedEmails);

  if (!parsedInvitedEmails.success) {
    throw new Error(parsedInvitedEmails.error.flatten().formErrors[0] ?? inviteMembersRequiredMessage);
  }

  return parsedInvitedEmails.data;
}

function buildCreatedGroupMembers(owner: GroupOwner, invitedEmails: string[]) {
  const invitedMembers = invitedEmails.map(createInvitedMemberPreview);
  const visibleMembers = [owner, ...invitedMembers].slice(0, 3);

  return {
    visibleMembers,
    extraMembersCount: Math.max(0, invitedMembers.length + 1 - visibleMembers.length),
  };
}

function buildSeededGroupPreviewMembers(groupId: string, invitedEmails: string[]) {
  const seededGroup = getSeededMockGroup(groupId);

  if (!seededGroup) {
    return {
      visibleMembers: invitedEmails.map(createInvitedMemberPreview).slice(0, 3),
      extraMembersCount: Math.max(0, invitedEmails.length - 3),
      description: buildPendingInvitesDescription(invitedEmails),
    };
  }

  const invitedMembers = invitedEmails.map(createInvitedMemberPreview);
  const visibleMembers = [...seededGroup.members, ...invitedMembers].slice(0, 3);
  const overflowInvites = Math.max(0, seededGroup.members.length + invitedMembers.length - visibleMembers.length);

  return {
    visibleMembers,
    extraMembersCount: seededGroup.extraMembersCount + overflowInvites,
    description:
      invitedEmails.length > 0 ? buildPendingInvitesDescription(invitedEmails) : seededGroup.description,
  };
}

export const useGroupsStore = create<GroupsStore>()((set) => ({
  deletedGroupIds: [],
  groups: getInitialGroups(),
  createGroup: ({ category, image, invitedEmails, name, owner }) => {
    const normalizedInvitedEmails = parseInvitedEmails(invitedEmails, false);
    const { visibleMembers, extraMembersCount } = buildCreatedGroupMembers(owner, normalizedInvitedEmails);
    const nextGroup: StoredGroup = {
      id: `group-${Date.now()}`,
      name,
      description: buildPendingInvitesDescription(normalizedInvitedEmails),
      category,
      status: { type: 'recent' },
      members: visibleMembers,
      extraMembersCount,
      balance: 0,
      image,
      invitedEmails: normalizedInvitedEmails,
      ownerEmail: owner.email,
    };

    set((state) => ({ groups: [nextGroup, ...state.groups] }));

    return nextGroup;
  },
  updateGroup: ({ category, groupId, image, invitedEmails, name, owner }) => {
    let updatedGroup: StoredGroup | undefined;

    set((state) => {
      const currentGroup = state.groups.find((group) => group.id === groupId);

      if (!currentGroup) {
        return state;
      }

      const seededGroup = isSeededMockGroup(groupId);
      const normalizedInvitedEmails = parseInvitedEmails(invitedEmails, seededGroup);

      const nextGroup: StoredGroup = seededGroup
        ? (() => {
            const { visibleMembers, extraMembersCount, description } = buildSeededGroupPreviewMembers(
              groupId,
              normalizedInvitedEmails,
            );

            return {
              ...currentGroup,
              name,
              category,
              image,
              description,
              members: visibleMembers,
              extraMembersCount,
              invitedEmails: normalizedInvitedEmails,
              ownerEmail: owner.email,
            };
          })()
        : (() => {
            const { visibleMembers, extraMembersCount } = buildCreatedGroupMembers(owner, normalizedInvitedEmails);

            return {
              ...currentGroup,
              name,
              category,
              image,
              description: buildPendingInvitesDescription(normalizedInvitedEmails),
              members: visibleMembers,
              extraMembersCount,
              invitedEmails: normalizedInvitedEmails,
              ownerEmail: owner.email,
            };
          })();

      updatedGroup = nextGroup;

      return {
        groups: state.groups.map((group) => (group.id === groupId ? nextGroup : group)),
      };
    });

    if (!updatedGroup) {
      throw new Error('Group not found');
    }

    return updatedGroup;
  },
  deleteGroup: (groupId) =>
    set((state) => ({
      deletedGroupIds: state.deletedGroupIds.includes(groupId)
        ? state.deletedGroupIds
        : [...state.deletedGroupIds, groupId],
      groups: state.groups.filter((group) => group.id !== groupId),
    })),
  reset: () => set({ deletedGroupIds: [], groups: getInitialGroups() }),
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
