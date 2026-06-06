import { Beef, Gift, Home, Umbrella, Users, type LucideIcon } from 'lucide-react-native';

import { colors } from '../../../shared/theme/colors';
import { GroupCategory } from '../types';

type GroupCategoryVisual = {
  Icon: LucideIcon;
  containerClassName: string;
  iconColor: string;
};

export const groupCategoryVisuals: Record<GroupCategory, GroupCategoryVisual> = {
  TRAVEL: { Icon: Umbrella, containerClassName: 'bg-accentBg', iconColor: colors.accent },
  HOME: { Icon: Home, containerClassName: 'bg-debtBg', iconColor: colors.debt },
  FOOD: { Icon: Beef, containerClassName: 'bg-primaryBg', iconColor: colors.primary },
  EVENT: { Icon: Gift, containerClassName: 'bg-accentBg', iconColor: colors.accent },
  OTHER: { Icon: Users, containerClassName: 'bg-neutral200', iconColor: colors.neutral500 },
};
