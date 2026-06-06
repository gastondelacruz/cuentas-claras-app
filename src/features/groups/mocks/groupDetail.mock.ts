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

export const recentExpensesMock: GroupExpense[] = [
  {
    id: 'e1',
    title: 'Cena Italiana @ Luigis',
    paidByLabel: 'Pagado por Alex',
    timeLabel: 'Ayer',
    totalAmount: 184.0,
    category: 'FOOD',
    userRelation: { type: 'share', amount: 46.0 },
  },
  {
    id: 'e2',
    title: 'Tren a Florencia',
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hace 2 días',
    totalAmount: 240.0,
    category: 'TRANSPORT',
    userRelation: { type: 'lent', amount: 180.0 },
  },
  {
    id: 'e3',
    title: 'Cafés de la mañana',
    paidByLabel: 'Pagado por Sarah',
    timeLabel: 'Hace 2 días',
    totalAmount: 28.5,
    category: 'FOOD',
    userRelation: { type: 'share', amount: 7.12 },
  },
];

export const totalExpensesCountMock = 24;
