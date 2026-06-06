import type { LucideIcon } from 'lucide-react-native';

export type ActivitySummaryItem = {
  id: string;
  title: string;
  amount: number;
  tone: 'success' | 'debt';
};

export type ActivityFeedItem = {
  id: string;
  actorName: string;
  actorInitials: string;
  actorAvatarUrl?: string;
  action: string;
  subject?: string;
  amount?: number;
  quote?: string;
  tag?: string;
  timeLabel: string;
  icon: LucideIcon;
  iconTone: 'success' | 'debt' | 'primary';
};

export type ActivitySection = {
  id: string;
  title: string;
  items: ActivityFeedItem[];
};

export type ActivityData = {
  summary: ActivitySummaryItem[];
  sections: ActivitySection[];
};
