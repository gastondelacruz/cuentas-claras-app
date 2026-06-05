export type HomeSummaryItem = {
  id: string;
  title: string;
  amount: number;
  detail: string;
};

export type HomeSummary = {
  owedToUser: HomeSummaryItem;
  owedByUser: HomeSummaryItem;
};

export type HomeGroupMember = {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
};

export type HomeGroup = {
  id: string;
  name: string;
  category: string;
  coverUrl: string;
  members: HomeGroupMember[];
  extraMembersCount: number;
  activeDebtsLabel: string;
};

export type HomeActivity = {
  id: string;
  title: string;
  context: string;
  amount: number;
  timeLabel: string;
  category: 'food' | 'transport' | 'utilities';
};

export type HomeDashboardData = {
  summary: HomeSummary;
  activeGroups: HomeGroup[];
  recentActivity: HomeActivity[];
};

export type UseHomeDataResult = {
  data: HomeDashboardData | null;
  summary: HomeSummary;
  activeGroups: HomeGroup[];
  recentActivity: HomeActivity[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};
