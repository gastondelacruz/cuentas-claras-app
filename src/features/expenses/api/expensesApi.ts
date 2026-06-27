import { client } from '../../../shared/api/client';
import { parseOrThrow } from '../../../shared/api/errors';
import {
  CreateExpenseInput,
  expenseDeleteResponseSchema,
  expenseListResponseSchema,
  expenseSchema,
  UpdateExpenseInput,
} from '../schemas/expenseSchema';

export type GetGroupExpensesOptions = {
  cursor?: string;
  limit?: number;
};

export async function getGroupExpenses(
  groupId: string,
  options: GetGroupExpensesOptions = {},
) {
  const response = await client.get(`/groups/${groupId}/expenses`, {
    params: options,
  });

  return parseOrThrow(expenseListResponseSchema, response.data.data);
}

export async function createExpense(groupId: string, input: CreateExpenseInput) {
  const response = await client.post(`/groups/${groupId}/expenses`, input);

  return parseOrThrow(expenseSchema, response.data.data);
}

export async function getExpense(expenseId: string) {
  const response = await client.get(`/expenses/${expenseId}`);

  return parseOrThrow(expenseSchema, response.data.data);
}

export async function updateExpense(expenseId: string, input: UpdateExpenseInput) {
  const response = await client.patch(`/expenses/${expenseId}`, input);

  return parseOrThrow(expenseSchema, response.data.data);
}

export async function deleteExpense(expenseId: string) {
  const response = await client.delete(`/expenses/${expenseId}`);

  return parseOrThrow(expenseDeleteResponseSchema, response.data.data);
}
