import { client } from '../../../shared/api/client';

export const GROUP_TYPES = ['trip', 'home', 'couple', 'friends', 'event', 'other'] as const;

export type GroupApiType = (typeof GROUP_TYPES)[number];

export type CreateGroupMemberDto = {
  id?: string;
  name?: string;
  email?: string;
};

export type CreateGroupResponse = {
  id: string;
  name?: string;
  description?: string | null;
  type?: GroupApiType;
  currency?: string;
  members?: CreateGroupMemberDto[];
  membersCount?: number;
  expensesCount?: number;
  totalAmount?: number;
  currentUserBalance?: number;
  expenses?: unknown[];
  balances?: unknown[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  archivedAt?: Date | string | null;
};

export type CreateGroupMemberInput = {
  displayName: string;
  email: string;
};

export type CreateGroupInput = {
  name: string;
  description?: string;
  type: GroupApiType;
  currency: string;
  members: CreateGroupMemberInput[];
};

export async function createGroup(input: CreateGroupInput): Promise<CreateGroupResponse> {
  const response = await client.post<CreateGroupResponse>('/v1/groups', input);
  return response.data;
}

export type GroupListItemDto = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type GetGroupsResponse = {
  data: GroupListItemDto[];
};

export async function getGroups(): Promise<GetGroupsResponse> {
  const response = await client.get<GetGroupsResponse>('/v1/groups');
  return response.data;
}
