import { z } from 'zod';

export const GROUP_TYPES = ['trip', 'home', 'couple', 'friends', 'event', 'other'] as const;

// Member as returned by GET /groups/:id
export const groupMemberSchema = z.object({
  id: z.string().optional(),
  displayName: z.string(),
  email: z.string().optional(),
  isCurrentUser: z.boolean().optional(),
  removedAt: z.string().nullable().optional(),
});

// Balance item as returned by GET /groups/:id/balances
export const groupBalanceItemSchema = z.object({
  memberId: z.string(),
  displayName: z.string(),
  balance: z.number(),
  currency: z.string(),
  isCurrentUser: z.boolean().optional(),
});

// Group detail as returned by GET /groups/:id
export const groupDetailSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(GROUP_TYPES).optional(),
  currency: z.string().optional(),
  description: z.string().nullable().optional(),
  members: z.array(groupMemberSchema).default([]),
  membersCount: z.number().optional(),
  expensesCount: z.number().nullable().optional(),
  totalAmount: z.number().nullable().optional(),
  currentUserBalance: z.number().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
});

export const groupBalancesSchema = z.object({
  balances: z.array(groupBalanceItemSchema),
});

// Settlement item as returned by GET /groups/:id/settlements
export const groupSettlementSchema = z.object({
  fromMemberId: z.string(),
  fromMemberName: z.string(),
  toMemberId: z.string(),
  toMemberName: z.string(),
  amount: z.number(),
  currency: z.string(),
});

export const groupSettlementsResponseSchema = z.object({
  settlements: z.array(groupSettlementSchema),
});

// Settlement payment as returned by POST /groups/:id/settlements
export const settlementPaymentMemberSchema = z.object({
  id: z.string(),
  displayName: z.string(),
});

export const settlementPaymentSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  fromMember: settlementPaymentMemberSchema,
  toMember: settlementPaymentMemberSchema,
  amount: z.number(),
  currency: z.string(),
  paidAt: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export const recordSettlementInputSchema = z.object({
  fromMemberId: z.string(),
  toMemberId: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  paidAt: z.string(),
  notes: z.string().nullable().optional(),
});

export const recordSettlementResponseSchema = z.object({
  payment: settlementPaymentSchema,
  balances: z.array(groupBalanceItemSchema),
});

export type GroupDetailDto = z.infer<typeof groupDetailSchema>;
export type GroupMemberDto = z.infer<typeof groupMemberSchema>;
export type GroupBalanceItemDto = z.infer<typeof groupBalanceItemSchema>;
export type GroupBalancesDto = z.infer<typeof groupBalancesSchema>;
export type GroupSettlementDto = z.infer<typeof groupSettlementSchema>;
export type GroupSettlementsResponseDto = z.infer<typeof groupSettlementsResponseSchema>;
export type RecordSettlementInputDto = z.infer<typeof recordSettlementInputSchema>;
export type RecordSettlementResponseDto = z.infer<typeof recordSettlementResponseSchema>;
