import { queryKeys } from '../queryKeys';

describe('queryKeys', () => {
  it('builds group keys', () => {
    expect(queryKeys.groups.all()).toEqual(['groups']);
    expect(queryKeys.groups.detail('g1')).toEqual(['groups', 'g1']);
    expect(queryKeys.groups.balances('g1')).toEqual(['groups', 'g1', 'balances']);
    expect(queryKeys.groups.settlements('g1')).toEqual(['groups', 'g1', 'settlements']);
  });

  it('builds expense keys', () => {
    expect(queryKeys.expenses.list('g1')).toEqual(['expenses', { groupId: 'g1' }]);
    expect(queryKeys.expenses.detail('e1')).toEqual(['expenses', 'e1']);
  });

  it('builds auth keys', () => {
    expect(queryKeys.auth.me()).toEqual(['auth', 'me']);
    expect(queryKeys.auth.emailVerificationStatus()).toEqual(['auth', 'email-verification', 'status']);
  });

  it('produces serializable keys for React Query', () => {
    const listKey = queryKeys.expenses.list('g1');

    expect(JSON.stringify(listKey)).toBe('["expenses",{"groupId":"g1"}]');
  });
});
