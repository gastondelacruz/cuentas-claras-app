import type { GroupBalanceItemDto } from '../schemas/groupSchema';

/**
 * Signed group balance contract:
 * - positive balance: current member should receive money
 * - negative balance: current member owes money
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getReceivableAmount(signedBalance: number): number {
  const balance = roundToCents(signedBalance);
  return balance > 0 ? balance : 0;
}

export function getPayableAmount(signedBalance: number): number {
  const balance = roundToCents(signedBalance);
  return balance < 0 ? Math.abs(balance) : 0;
}

export function getSignedPayableAmount(signedBalance: number): number {
  const balance = roundToCents(signedBalance);
  return balance < 0 ? balance : 0;
}

export function isSettledBalance(signedBalance: number): boolean {
  return Math.abs(roundToCents(signedBalance)) < 0.01;
}

export function findCurrentMemberBalance(
  balances: GroupBalanceItemDto[],
  currentMemberId?: string,
): GroupBalanceItemDto | undefined {
  return balances.find(
    (balance) => balance.isCurrentUser || (currentMemberId !== undefined && balance.memberId === currentMemberId),
  );
}
