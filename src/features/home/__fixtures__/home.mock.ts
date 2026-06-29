import type { HomeDashboardData } from '../types';

// Seed data disabled: the app starts from an empty state so real creation
// flows can be tested end to end. Restore real data via the backend endpoints.
export const homeMockData: HomeDashboardData = {
  summary: {
    owedToUser: {
      id: 'owed-to-user',
      title: 'Te deben',
      amount: 0,
      detail: '0 Personas',
      tone: 'success',
    },
    owedByUser: {
      id: 'owed-by-user',
      title: 'Debes',
      amount: 0,
      detail: '0 Grupos',
      tone: 'debt',
    },
  },
  activeGroups: [],
  recentActivity: [],
};
