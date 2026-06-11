import { GroupDetail, GroupExpense, MemberBalance } from '../types';

// Seed data disabled: the app starts from an empty state so real creation
// flows can be tested end to end. These fallbacks are kept type-valid but empty
// until the backend endpoints provide real group detail data.
export const groupDetailMock: GroupDetail = {
  id: '',
  name: '',
  category: '',
  totalExpense: 0,
  totalExpenseChangePercent: 0,
  owedToYou: 0,
  youOwe: 0,
};

export const memberBalancesMock: MemberBalance[] = [];

export const recentExpensesMock: GroupExpense[] = [];
