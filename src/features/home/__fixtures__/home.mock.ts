import type { HomeDashboardData } from '../types';

// Seed data disabled: the app starts from an empty state so real creation
// flows can be tested end to end. Restore real data via the backend endpoints.
export const homeMockData: HomeDashboardData = {
  summary: {
    netBalance: {
      id: 'net-balance',
      title: 'Balance total',
      amount: 0,
      currency: 'ARS',
      detail: 'Balance neto',
      tone: 'success',
    },
    owedToUser: {
      id: 'owed-to-user',
      title: 'Te deben',
      amount: 0,
      currency: 'ARS',
      detail: '0 Personas',
      tone: 'success',
    },
    owedByUser: {
      id: 'owed-by-user',
      title: 'Debes',
      amount: 0,
      currency: 'ARS',
      detail: '0 Grupos',
      tone: 'debt',
    },
  },
  activeGroups: [],
  recentActivity: [],
};
