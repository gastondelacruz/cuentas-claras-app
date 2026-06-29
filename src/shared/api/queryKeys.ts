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
  },
};
