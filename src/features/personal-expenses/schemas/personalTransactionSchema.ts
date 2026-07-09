import { z } from "zod";

export const personalTransactionTypeSchema = z.enum(["expense", "income"]);
export const personalExpenseTypeSchema = z.enum(["variable", "fixed"]);
export const personalTransactionRangeSchema = z.enum([
	"day",
	"week",
	"month",
	"year",
	"period",
]);

export const personalTransactionSchema = z.object({
	id: z.string(),
	type: personalTransactionTypeSchema,
	expenseKind: personalExpenseTypeSchema.nullish(),
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

// Swagger (PersonalTransactionsSummaryBreakdownResponseDto.type) defines this field as a plain
// string, not a closed enum. Using the enum here made the whole summary parse fail (blanking the
// top Total) whenever the backend returned a category type outside 'expense' | 'income'.
export const personalTransactionSummaryBreakdownSchema = z.object({
	category: z.string(),
	type: z.string(),
	amount: z.number(),
	percentage: z.number(),
});

export const personalTransactionSummaryResponseSchema = z.object({
	total: z.number(),
	currency: z.string(),
	incomeTotal: z.number(),
	expenseTotal: z.number(),
	breakdown: z.array(personalTransactionSummaryBreakdownSchema),
});

export const createPersonalTransactionSchema = z.object({
	type: personalTransactionTypeSchema,
	expenseKind: personalExpenseTypeSchema.optional(),
	amount: z.number().positive(),
	currency: z.string().min(1),
	category: z.string().min(1),
	accountId: z.string().min(1).optional(),
	occurredAt: z.string().min(1),
	note: z.string().max(200).optional(),
});

// Partial update payload for PATCH /me/personal-transactions/:id. Every field is optional
// per UpdatePersonalTransactionRequestDto; `note` additionally accepts `null` to clear it.
export const updatePersonalTransactionSchema = createPersonalTransactionSchema
	.partial()
	.extend({
		note: z.string().max(200).nullable().optional(),
	});

export type PersonalTransactionDto = z.infer<typeof personalTransactionSchema>;
export type PersonalTransactionListResponseDto = z.infer<
	typeof personalTransactionListResponseSchema
>;
export type PersonalTransactionSummaryResponseDto = z.infer<
	typeof personalTransactionSummaryResponseSchema
>;
export type CreatePersonalTransactionInput = z.infer<
	typeof createPersonalTransactionSchema
>;
export type UpdatePersonalTransactionInput = z.infer<
	typeof updatePersonalTransactionSchema
>;
