import { GroupDetail, GroupExpense, MemberBalance } from '../types';

export const groupDetailMock: GroupDetail = {
  id: 'group-1',
  name: 'Viaje a Europa 2024',
  category: 'Viajes',
  totalExpense: 4280.5,
  totalExpenseChangePercent: 12,
  owedToYou: 450.2,
  youOwe: 120.0,
};

export const memberBalancesMock: MemberBalance[] = [
  {
    id: 'u1',
    name: 'Alex',
    initials: 'AL',
    avatarUrl: 'https://i.pravatar.cc/100?img=11',
    isCurrentUser: false,
    balance: 210.0,
  },
  {
    id: 'u2',
    name: 'Sarah',
    initials: 'SA',
    avatarUrl: 'https://i.pravatar.cc/100?img=5',
    isCurrentUser: false,
    balance: -45.0,
  },
  {
    id: 'u3',
    name: 'Yo',
    initials: 'YO',
    avatarUrl: null,
    isCurrentUser: true,
    balance: 330.2,
  },
];

// Raw inputs (paidById, participantIds, date) reference the seeded group-1
// member ids exposed by `useGroupMembers`: the current user plus m1 (Alex) and
// m2 (Sarah). They let the mock expenses be edited like store-created ones.
export const recentExpensesMock: GroupExpense[] = [
  {
    id: 'e1',
    title: 'Cena Italiana @ Luigis',
    paidByLabel: 'Pagado por Alex',
    timeLabel: 'Ayer',
    totalAmount: 184.0,
    category: 'FOOD',
    userRelation: { type: 'share', amount: 46.0 },
    paidById: 'm1',
    participantIds: ['current-user', 'm1', 'm2'],
    date: '2024-02-19T20:00:00.000Z',
  },
  {
    id: 'e2',
    title: 'Tren a Florencia',
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hace 2 días',
    totalAmount: 240.0,
    category: 'TRANSPORT',
    userRelation: { type: 'lent', amount: 180.0 },
    paidById: 'current-user',
    participantIds: ['current-user', 'm1', 'm2'],
    date: '2024-02-18T09:30:00.000Z',
  },
  {
    id: 'e3',
    title: 'Cafés de la mañana',
    paidByLabel: 'Pagado por Sarah',
    timeLabel: 'Hace 2 días',
    totalAmount: 28.5,
    category: 'FOOD',
    userRelation: { type: 'share', amount: 7.12 },
    paidById: 'm2',
    participantIds: ['current-user', 'm1', 'm2'],
    date: '2024-02-18T08:00:00.000Z',
  },
];
