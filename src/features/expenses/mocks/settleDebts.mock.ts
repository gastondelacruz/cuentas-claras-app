import { SettlementItem, SettlementSummary } from '../types';

export const settleDebtsSummaryMock: SettlementSummary = {
  owedToYou: 156,
  youOwe: 42.5,
};

export const settleDebtsItemsMock: SettlementItem[] = [
  {
    id: 'marcus',
    type: 'with-user',
    direction: 'you-owe',
    amount: 42.5,
    person: {
      id: 'marcus',
      name: 'Marcus',
      initials: 'MA',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&crop=faces',
    },
  },
  {
    id: 'sofia',
    type: 'with-user',
    direction: 'owes-you',
    amount: 84,
    person: {
      id: 'sofia',
      name: 'Sofía',
      initials: 'SO',
      avatarUrl: null,
    },
  },
  {
    id: 'carlos',
    type: 'with-user',
    direction: 'owes-you',
    amount: 72,
    person: {
      id: 'carlos',
      name: 'Carlos',
      initials: 'CA',
      avatarUrl: null,
    },
  },
  {
    id: 'sofia-carlos',
    type: 'between-members',
    amount: 15,
    from: {
      id: 'sofia-inline',
      name: 'Sofía',
      initials: 'S',
      avatarUrl: null,
    },
    to: {
      id: 'carlos-inline',
      name: 'Carlos',
      initials: 'C',
      avatarUrl: null,
    },
  },
];
