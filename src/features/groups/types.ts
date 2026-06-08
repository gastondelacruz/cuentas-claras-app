export type GroupScreenName = 'GroupsListScreen' | 'GroupDetailScreen' | 'NewGroupScreen';

export type GroupCategory = 'TRAVEL' | 'HOME' | 'FOOD' | 'EVENT' | 'OTHER';

export type GroupStatus = { type: 'settled' } | { type: 'pending'; count: number } | { type: 'recent' };

export type GroupImage =
  | { type: 'default'; uri: null }
  | { type: 'uploaded'; uri: string };

export type GroupMemberPreview = {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
};

export type GroupListItem = {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  status: GroupStatus;
  members: GroupMemberPreview[];
  extraMembersCount: number;
  balance: number;
};

export type StoredGroup = GroupListItem & {
  image: GroupImage;
  invitedEmails: string[];
  ownerEmail: string;
};

export type GroupDetail = {
  id: string;
  name: string;
  category: string;
  totalExpense: number;
  totalExpenseChangePercent: number;
  owedToYou: number;
  youOwe: number;
};

export type MemberBalance = {
  id: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  isCurrentUser: boolean;
  balance: number;
};

export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'UTILITIES' | 'SHOPPING' | 'ENTERTAINMENT' | 'OTHER';

export type ExpenseUserRelationType = 'share' | 'lent' | 'none';

export type ExpenseUserRelation = {
  type: ExpenseUserRelationType;
  amount: number;
};

export type GroupExpense = {
  id: string;
  title: string;
  paidByLabel: string;
  timeLabel: string;
  totalAmount: number;
  category: ExpenseCategory;
  userRelation: ExpenseUserRelation;
};
