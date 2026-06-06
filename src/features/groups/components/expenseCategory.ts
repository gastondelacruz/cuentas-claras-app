import { Music, ShoppingCart, Tag, Train, Utensils, Zap, type LucideIcon } from 'lucide-react-native';

import { colors } from '../../../shared/theme/colors';
import { ExpenseCategory } from '../types';

type CategoryVisual = {
  Icon: LucideIcon;
  containerClassName: string;
  iconColor: string;
};

export const categoryVisuals: Record<ExpenseCategory, CategoryVisual> = {
  FOOD: { Icon: Utensils, containerClassName: 'bg-primaryBg', iconColor: colors.primary },
  TRANSPORT: { Icon: Train, containerClassName: 'bg-accentBg', iconColor: colors.accent },
  UTILITIES: { Icon: Zap, containerClassName: 'bg-debtBg', iconColor: colors.debt },
  SHOPPING: { Icon: ShoppingCart, containerClassName: 'bg-primaryBg', iconColor: colors.primary },
  ENTERTAINMENT: { Icon: Music, containerClassName: 'bg-accentBg', iconColor: colors.accent },
  OTHER: { Icon: Tag, containerClassName: 'bg-neutral200', iconColor: colors.neutral500 },
};
