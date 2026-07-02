import { z } from 'zod';

export const personalTransactionTypeSchema = z.enum(['expense', 'income']);
export const personalTransactionRangeSchema = z.enum(['day', 'week', 'month', 'year', 'period']);

export const personalTransactionSchema = z.object({
  id: z.string(),
  type: personalTransactionTypeSchema,
  amount: z.number(),
  currency: z.string(),
  category: z.string(),
  accountId: z.string(),
  accountName: z.string(),
  occurredAt: z.string(),
  note: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const personalTransactionListResponseSchema = z.object({
  transactions: z.array(personalTransactionSchema),
  nextCursor: z.string().nullable().optional(),
  total: z.number(),
  incomeTotal: z.number(),
  expenseTotal: z.number(),
  currency: z.string(),
});

export const createPersonalTransactionSchema = z.object({
  type: personalTransactionTypeSchema,
  amount: z.number().positive(),
  currency: z.string().min(1),
  category: z.string().min(1),
  accountId: z.string().min(1).optional(),
  occurredAt: z.string().min(1),
  note: z.string().max(200).optional(),
});

export type PersonalTransactionDto = z.infer<typeof personalTransactionSchema>;
export type PersonalTransactionListResponseDto = z.infer<typeof personalTransactionListResponseSchema>;
export type CreatePersonalTransactionInput = z.infer<typeof createPersonalTransactionSchema>;
