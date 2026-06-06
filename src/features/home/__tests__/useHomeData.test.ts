import { renderHook } from '@testing-library/react-native';

import { useHomeData } from '../hooks/useHomeData';

describe('useHomeData', () => {
  it('returns direct mock fields and query-shaped data', () => {
    const { result } = renderHook(() => useHomeData());

    expect(result.current.data).toEqual({
      summary: result.current.summary,
      activeGroups: result.current.activeGroups,
      recentActivity: result.current.recentActivity,
    });
    expect(result.current.summary.owedToUser.amount).toBe(1420.5);
    expect(result.current.summary.owedByUser.amount).toBe(-342.15);
    expect(result.current.activeGroups).toHaveLength(2);
    expect(result.current.recentActivity).toHaveLength(3);
  });

  it('keeps query-shaped data nullable for future loading and error states', () => {
    const { result } = renderHook(() => useHomeData());

    const data: typeof result.current.data = null;
    expect(data).toBeNull();
  });

  it('is not loading or errored by default', () => {
    const { result } = renderHook(() => useHomeData());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
