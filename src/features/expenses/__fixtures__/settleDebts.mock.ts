import { SettlementItem, SettlementSummary } from '../types';

// Seed data disabled: the app starts from an empty state so real creation
// flows can be tested end to end. Restore real data via the backend endpoints.
export const settleDebtsSummaryMock: SettlementSummary = {
  owedToYou: 0,
  youOwe: 0,
};

export const settleDebtsItemsMock: SettlementItem[] = [];
