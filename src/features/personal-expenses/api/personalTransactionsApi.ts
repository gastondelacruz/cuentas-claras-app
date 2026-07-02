import { client } from '../../../shared/api/client';
import { parseOrThrow } from '../../../shared/api/errors';
import {
  CreatePersonalTransactionInput,
  personalTransactionListResponseSchema,
  personalTransactionSchema,
  personalTransactionSummaryResponseSchema,
} from '../schemas/personalTransactionSchema';
import type { PersonalTransactionQueryOptions, PersonalTransactionSummaryFilters } from '../types';

export async function getPersonalTransactions(options: PersonalTransactionQueryOptions) {
  const response = await client.get('/me/personal-transactions', {
    params: options,
  });

  return parseOrThrow(personalTransactionListResponseSchema, response.data.data);
}

export async function getPersonalTransactionsSummary(options: PersonalTransactionSummaryFilters) {
  const response = await client.get('/me/personal-transactions/summary', {
    params: options,
  });

  return parseOrThrow(personalTransactionSummaryResponseSchema, response.data.data);
}

export async function createPersonalTransaction(input: CreatePersonalTransactionInput) {
  const response = await client.post('/me/personal-transactions', input);

  return parseOrThrow(personalTransactionSchema, response.data.data);
}
