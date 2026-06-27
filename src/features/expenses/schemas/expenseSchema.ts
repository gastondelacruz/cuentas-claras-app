import { z } from 'zod';

import type { ExpenseCategory } from '../../groups/types';

export const EXPENSE_CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'UTILITIES',
  'SHOPPING',
  'ENTERTAINMENT',
  'OTHER',
] as const satisfies readonly ExpenseCategory[];

export const expenseSplitTypeSchema = z.enum(['equal', 'exact', 'percentage']);

// Matches the actual API response for paidBy (not paidByMemberId)
export const expensePaidBySchema = z.object({
  id: z.string(),
  displayName: z.string(),
});

// Matches the actual API response participant shape
export const expenseParticipantResponseSchema = z.object({
  memberId: z.string(),
  displayName: z.string(),
  owedAmount: z.number(),
  paidAmount: z.number(),
  netAmount: z.number(),
});

// Matches POST /groups/:id/expenses and GET /expenses/:id response
export const expenseSchema = z.object({
  id: z.string(),
  groupId: z.string().optional(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  paidBy: expensePaidBySchema,
  participants: z.array(expenseParticipantResponseSchema).optional(),
  splitType: z.string(),
  category: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  expenseDate: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Matches list item shape (GET /groups/:id/expenses)
export const expenseListItemSchema = z.object({
  id: z.string(),
  groupId: z.string().optional(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  paidBy: expensePaidBySchema,
  participantsCount: z.number().optional(),
  category: z.string().nullable().optional(),
  expenseDate: z.string(),
  createdAt: z.string().optional(),
});

export const expenseListResponseSchema = z.object({
  expenses: z.array(expenseListItemSchema),
  nextCursor: z.string().nullable().optional(),
});

export const expenseDeleteResponseSchema = z.object({
  id: z.string(),
  deletedAt: z.string(),
});

export type ExpenseSplitType = z.infer<typeof expenseSplitTypeSchema>;
export type ExpenseDto = z.infer<typeof expenseSchema>;
export type ExpenseListItemDto = z.infer<typeof expenseListItemSchema>;
export type ExpenseListResponseDto = z.infer<typeof expenseListResponseSchema>;
export type ExpenseDeleteResponseDto = z.infer<typeof expenseDeleteResponseSchema>;

export type CreateExpenseInput = {
  title: string;
  amount: number;
  currency: string;
  paidByMemberId: string;
  participantMemberIds: string[];
  splitType: ExpenseSplitType;
  category?: ExpenseCategory | null;
  notes?: string | null;
  expenseDate: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;
