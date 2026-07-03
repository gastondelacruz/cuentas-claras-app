import type { PersonalTransactionDto } from '../schemas/personalTransactionSchema';

// There is still no GET-by-id endpoint for personal transactions, so edit mode prefills
// its form from the already-loaded list/summary data instead of a fresh network request.
// This in-memory store bridges "tap a row in the list" -> "open AddPersonalTransaction in
// edit mode" by remembering the last-seen transaction data per id. The actual update is a
// real network call (see `updatePersonalTransaction` in `../api/personalTransactionsApi`).
type MockEditablePersonalTransactionStore = Map<string, PersonalTransactionDto>;

const editableTransactions: MockEditablePersonalTransactionStore = new Map();

export function rememberMockEditablePersonalTransaction(transaction: PersonalTransactionDto) {
  editableTransactions.set(transaction.id, transaction);
}

export function getMockEditablePersonalTransaction(transactionId: string) {
  return editableTransactions.get(transactionId);
}
