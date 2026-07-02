import { client } from '../../../shared/api/client';
import { parseOrThrow } from '../../../shared/api/errors';
import {
  CreatePersonalTransactionInput,
  personalTransactionListResponseSchema,
  personalTransactionSchema,
} from '../schemas/personalTransactionSchema';
import type { PersonalTransactionQueryOptions } from '../types';

export async function getPersonalTransactions(options: PersonalTransactionQueryOptions) {
  const response = await client.get('/me/personal-transactions', {
    params: options,
  });

  return parseOrThrow(personalTransactionListResponseSchema, response.data.data);
}

export async function createPersonalTransaction(input: CreatePersonalTransactionInput) {
  const response = await client.post('/me/personal-transactions', input);

  return parseOrThrow(personalTransactionSchema, response.data.data);
}
