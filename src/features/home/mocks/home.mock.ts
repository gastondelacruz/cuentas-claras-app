import type { HomeDashboardData } from '../types';

export const homeMockData: HomeDashboardData = {
  summary: {
    owedToUser: {
      id: 'owed-to-user',
      title: 'Te deben',
      amount: 1420.5,
      detail: '3 Personas',
    },
    owedByUser: {
      id: 'owed-by-user',
      title: 'Debes',
      amount: -342.15,
      detail: '2 Grupos',
    },
  },
  activeGroups: [
    {
      id: 'lisbon-trip',
      name: 'Viaje a Lisboa',
      category: 'Viajes',
      coverUrl: 'https://picsum.photos/seed/lisbon-trip/400/300',
      members: [
        {
          id: 'james',
          name: 'James',
          initials: 'JE',
          avatarUrl: 'https://i.pravatar.cc/100?img=11',
        },
        {
          id: 'anna',
          name: 'Anna',
          initials: 'AN',
          avatarUrl: 'https://i.pravatar.cc/100?img=12',
        },
      ],
      extraMembersCount: 2,
      activeDebtsLabel: '4 deudas activas',
    },
    {
      id: 'office-lunch',
      name: 'Almuerzo Oficina',
      category: 'Comida',
      coverUrl: 'https://picsum.photos/seed/office-lunch/400/300',
      members: [
        {
          id: 'rachel',
          name: 'Rachel',
          initials: 'RK',
          avatarUrl: 'https://i.pravatar.cc/100?img=13',
        },
        {
          id: 'sarah',
          name: 'Sarah',
          initials: 'SL',
          avatarUrl: 'https://i.pravatar.cc/100?img=14',
        },
      ],
      extraMembersCount: 0,
      activeDebtsLabel: '2 deudas activas',
    },
  ],
  recentActivity: [
    {
      id: 'sushi-dinner',
      title: 'Cena de Sushi',
      context: 'Pagado por ti en Almuerzo Oficina',
      amount: 45,
      timeLabel: 'hace 2h',
      category: 'food',
    },
    {
      id: 'train-tickets',
      title: 'Billetes de Tren',
      context: 'Pagado por James en Viaje a Lisboa',
      amount: -12.8,
      timeLabel: 'Ayer',
      category: 'transport',
    },
    {
      id: 'electricity-bill',
      title: 'Factura de la Luz',
      context: 'Pagado por Sarah en Gastos Piso 4B',
      amount: -85,
      timeLabel: '12 sep',
      category: 'utilities',
    },
  ],
};
