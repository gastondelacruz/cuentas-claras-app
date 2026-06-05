import { homeMockData } from '../mocks/home.mock';
import type { UseHomeDataResult } from '../types';

export function useHomeData(): UseHomeDataResult {
  return {
    data: homeMockData,
    summary: homeMockData.summary,
    activeGroups: homeMockData.activeGroups,
    recentActivity: homeMockData.recentActivity,
    isLoading: false,
    isError: false,
    error: null,
  };
}
