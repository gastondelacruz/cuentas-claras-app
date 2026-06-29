import { z } from 'zod';

export const accountSummaryCurrencyTotalsSchema = z.object({
  currency: z.string().min(1),
  totalPaid: z.number(),
  totalOwed: z.number(),
  totalToReceive: z.number(),
});

export const accountSummarySchema = z.object({
  totalGroups: z.number(),
  totalExpenses: z.number(),
  totalsByCurrency: z.array(accountSummaryCurrencyTotalsSchema).default([]),
  activeSince: z.string(),
});

export type AccountSummaryCurrencyTotalsDto = z.infer<typeof accountSummaryCurrencyTotalsSchema>;
export type AccountSummaryDto = z.infer<typeof accountSummarySchema>;
