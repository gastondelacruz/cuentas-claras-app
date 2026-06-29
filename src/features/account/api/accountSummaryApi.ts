import { client } from '../../../shared/api/client';
import { parseOrThrow } from '../../../shared/api/errors';
import { accountSummarySchema, AccountSummaryDto } from '../schemas/accountSummarySchema';

export async function getAccountSummary(): Promise<AccountSummaryDto> {
  const response = await client.get<{ data: AccountSummaryDto }>('/me/summary');
  return parseOrThrow(accountSummarySchema, response.data.data);
}
