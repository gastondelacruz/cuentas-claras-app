import { CircleCheck, CircleDollarSign, UserPlus } from 'lucide-react-native';

import type { ActivityData } from '../types';

export const activityMock: ActivityData = {
  summary: [
    {
      id: 'monthly-expenses',
      title: 'Gastos este mes',
      amount: 1240,
      tone: 'success',
    },
    {
      id: 'pending-collection',
      title: 'Pendiente de cobro',
      amount: 345.5,
      tone: 'debt',
    },
  ],
  sections: [
    {
      id: 'recent',
      title: 'Reciente',
      items: [
        {
          id: 'juan-dinner',
          actorName: 'Juan',
          actorInitials: 'J',
          actorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces',
          action: 'agregó un gasto en',
          subject: 'Cena',
          amount: -45,
          tag: 'Viaje Madrid',
          timeLabel: 'Hace 2h',
          icon: CircleDollarSign,
          iconTone: 'success',
        },
        {
          id: 'elena-settled',
          actorName: 'Elena',
          actorInitials: 'E',
          actorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces',
          action: 'saldó su deuda contigo',
          amount: 12.5,
          timeLabel: 'Hace 5h',
          icon: CircleCheck,
          iconTone: 'success',
        },
        {
          id: 'roberto-group',
          actorName: 'Roberto',
          actorInitials: 'R',
          action: 'creó el grupo',
          subject: 'Alquiler Piso',
          quote: 'Para los gastos comunes del mes',
          timeLabel: 'Ayer',
          icon: UserPlus,
          iconTone: 'debt',
        },
      ],
    },
    {
      id: 'this-week',
      title: 'Esta semana',
      items: [
        {
          id: 'marcos-taxi',
          actorName: 'Marcos',
          actorInitials: 'M',
          actorAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=faces',
          action: 'agregó un gasto en',
          subject: 'Taxi',
          amount: -18.2,
          timeLabel: 'Lun',
          icon: CircleDollarSign,
          iconTone: 'success',
        },
      ],
    },
  ],
};
