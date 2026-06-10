export type SettlementPerson = {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
};

export type SettlementSummary = {
  owedToYou: number;
  youOwe: number;
};

export type UserSettlement = {
  id: string;
  type: 'with-user';
  person: SettlementPerson;
  direction: 'owes-you' | 'you-owe';
  amount: number;
};

export type SettledMembersBalance = {
  id: string;
  type: 'between-members';
  from: SettlementPerson;
  to: SettlementPerson;
  amount: number;
};

export type SettlementItem = UserSettlement | SettledMembersBalance;
