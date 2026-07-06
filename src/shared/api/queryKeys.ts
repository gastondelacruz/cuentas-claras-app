export const queryKeys = {
  groups: {
    all: () => ['groups'] as const,
    detail: (groupId: string) => ['groups', groupId] as const,
    balances: (groupId: string) => ['groups', groupId, 'balances'] as const,
    settlements: (groupId: string) => ['groups', groupId, 'settlements'] as const,
  },
  expenses: {
    list: (groupId: string) => ['expenses', { groupId }] as const,
    latest: (groupId: string) => ['expenses', { groupId }, 'latest'] as const,
    detail: (expenseId: string) => ['expenses', expenseId] as const,
  },
  auth: {
    me: () => ['auth', 'me'] as const,
    emailVerificationStatus: () => ['auth', 'email-verification', 'status'] as const,
  },
  account: {
    summary: () => ['account', 'summary'] as const,
  },
  personalTransactions: {
    all: () => ['personal-transactions'] as const,
    summary: (filters: { range: string; from?: string; to?: string }) =>
      ['personal-transactions', 'summary', filters] as const,
    list: (filters: { type: string; range: string; from?: string; to?: string }) =>
      ['personal-transactions', filters] as const,
  },
};
