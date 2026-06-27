import { z } from 'zod';

export const authMeUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const authMeActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  amount: z.number(),
  date: z.string(),
  category: z.enum(['food', 'transport', 'utilities', 'shopping', 'entertainment', 'other']).default('other'),
});

export const authMeSummarySchema = z.object({
  user: authMeUserSchema,
  totalBalance: z.number(),
  currency: z.string(),
  recentActivity: z.array(authMeActivitySchema).default([]),
});

export type AuthMeUserDto = z.infer<typeof authMeUserSchema>;
export type AuthMeActivityDto = z.infer<typeof authMeActivitySchema>;
export type AuthMeSummaryDto = z.infer<typeof authMeSummarySchema>;
