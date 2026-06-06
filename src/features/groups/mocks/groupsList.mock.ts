import { GroupListItem } from '../types';

export const groupsNetBalanceMock = 1240.5;

export const groupsListMock: GroupListItem[] = [
  {
    id: 'group-1',
    name: 'Viaje a la costa',
    description: 'Viaje compartido a Pinamar - Feb 2024',
    category: 'TRAVEL',
    status: { type: 'settled' },
    members: [
      { id: 'm1', name: 'Alex', initials: 'AL', avatarUrl: 'https://i.pravatar.cc/100?img=11' },
      { id: 'm2', name: 'Sarah', initials: 'SA', avatarUrl: 'https://i.pravatar.cc/100?img=5' },
    ],
    extraMembersCount: 2,
    balance: 45.0,
  },
  {
    id: 'group-2',
    name: 'Departamento',
    description: 'Alquiler, servicios y gastos compartidos',
    category: 'HOME',
    status: { type: 'pending', count: 2 },
    members: [
      { id: 'm3', name: 'Diego', initials: 'DI', avatarUrl: 'https://i.pravatar.cc/100?img=12' },
      { id: 'm4', name: 'Lucía', initials: 'LU', avatarUrl: 'https://i.pravatar.cc/100?img=20' },
    ],
    extraMembersCount: 0,
    balance: -320.4,
  },
  {
    id: 'group-3',
    name: 'Asado del finde',
    description: 'Asado del domingo con el equipo',
    category: 'FOOD',
    status: { type: 'recent' },
    members: [
      { id: 'm5', name: 'Pablo', initials: 'PA', avatarUrl: 'https://i.pravatar.cc/100?img=15' },
      { id: 'm6', name: 'Marta', initials: 'MA', avatarUrl: 'https://i.pravatar.cc/100?img=9' },
      { id: 'm7', name: 'Juan', initials: 'JU', avatarUrl: 'https://i.pravatar.cc/100?img=8' },
    ],
    extraMembersCount: 5,
    balance: 12.5,
  },
];
