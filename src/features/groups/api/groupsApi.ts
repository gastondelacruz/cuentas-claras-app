import { client } from '../../../shared/api/client';
import { parseOrThrow } from '../../../shared/api/errors';
import {
  GROUP_TYPES,
  groupBalancesSchema,
  groupDetailSchema,
  groupSettlementsResponseSchema,
  recordSettlementResponseSchema,
  GroupBalancesDto,
  GroupDetailDto,
  GroupSettlementsResponseDto,
  RecordSettlementInputDto,
  RecordSettlementResponseDto,
} from '../schemas/groupSchema';

export type GroupApiType = (typeof GROUP_TYPES)[number];
export { GROUP_TYPES };

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
  const response = await client.post<CreateGroupResponse>('/groups', input);
  return response.data;
}

export type GroupListItemDto = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  expensesCount?: number;
  totalAmount?: number;
  currentUserBalance?: number;
};

export type GetGroupsResponse = {
  data: GroupListItemDto[];
};

export async function getGroups(): Promise<GetGroupsResponse> {
  const response = await client.get<GetGroupsResponse>('/groups');
  return response.data;
}

export async function getGroup(id: string): Promise<GroupDetailDto> {
  const response = await client.get<{ data: GroupDetailDto }>(`/groups/${id}`);
  return parseOrThrow(groupDetailSchema, response.data.data);
}

export async function updateGroup(id: string, data: Partial<GroupDetailDto>): Promise<GroupDetailDto> {
  const response = await client.patch<{ data: GroupDetailDto }>(`/groups/${id}`, data);
  return parseOrThrow(groupDetailSchema, response.data.data);
}

export async function deleteGroup(id: string): Promise<GroupDetailDto> {
  const response = await client.delete<{ data: GroupDetailDto }>(`/groups/${id}`);
  return parseOrThrow(groupDetailSchema, response.data.data);
}

export async function getGroupBalances(id: string): Promise<GroupBalancesDto> {
  const response = await client.get<{ data: GroupBalancesDto }>(`/groups/${id}/balances`);
  return parseOrThrow(groupBalancesSchema, response.data.data);
}

export async function getGroupSettlements(id: string): Promise<GroupSettlementsResponseDto> {
  const response = await client.get<{ data: GroupSettlementsResponseDto }>(`/groups/${id}/settlements`);
  return parseOrThrow(groupSettlementsResponseSchema, response.data.data);
}

export async function recordGroupSettlement(
  id: string,
  input: RecordSettlementInputDto,
): Promise<RecordSettlementResponseDto> {
  const response = await client.post<{ data: RecordSettlementResponseDto }>(`/groups/${id}/settlements`, input);
  return parseOrThrow(recordSettlementResponseSchema, response.data.data);
}
