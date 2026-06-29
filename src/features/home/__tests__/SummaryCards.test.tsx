import { render, screen } from '@testing-library/react-native';
import fc from 'fast-check';

import { SummaryCards } from '../components/SummaryCards';
import type { HomeSummary } from '../types';

jest.mock('../../../shared/ui/Chip', () => {
  const { Text } = require('react-native');

  return {
    Chip: ({ label, tone }: { label: string; tone: string }) => (
      <Text testID={`summary-chip-${label}`} data-tone={tone}>
        {label}
      </Text>
    ),
  };
});

function makeSummary({ netBalanceAmount = 0, owedToAmount = 0, owedByAmount = 0 } = {}): HomeSummary {
  return {
    netBalance: {
      id: 'net-balance',
      title: 'Balance total',
      amount: netBalanceAmount,
      detail: 'Balance neto',
      tone: netBalanceAmount >= 0 ? 'success' : 'debt',
      currency: 'ARS',
    },
    owedToUser: {
      id: 'owed-to-user',
      title: 'Te deben',
      amount: owedToAmount,
      detail: 'Te deben detail',
      tone: 'success',
      currency: 'ARS',
    },
    owedByUser: {
      id: 'owed-by-user',
      title: 'Debes',
      amount: owedByAmount,
      detail: 'Debes detail',
      tone: 'debt',
      currency: 'ARS',
    },
  };
}

describe('SummaryCards', () => {
  it('renders the net balance requested by the user', () => {
    render(<SummaryCards summary={makeSummary({ netBalanceAmount: 40, owedToAmount: 60, owedByAmount: -20 })} />);

    expect(screen.getByText('Balance total')).toBeTruthy();
    expect(screen.getByText('+$40,00')).toBeTruthy();
    expect(screen.getByTestId('summary-chip-Balance neto').props['data-tone']).toBe('success');
  });

  it('renders a negative net balance with debt tone', () => {
    render(<SummaryCards summary={makeSummary({ netBalanceAmount: -15, owedToAmount: 5, owedByAmount: -20 })} />);

    expect(screen.getByText('-$15,00')).toBeTruthy();
    expect(screen.getByTestId('summary-chip-Balance neto').props['data-tone']).toBe('debt');
  });

  it('renders the "Debes" chip with debt tone when the amount is zero', () => {
    render(<SummaryCards summary={makeSummary({ owedByAmount: 0 })} />);

    expect(screen.getByTestId('summary-chip-Debes detail').props['data-tone']).toBe('debt');
  });

  it('passes the selected currency to displayed amounts', () => {
    render(<SummaryCards summary={makeSummary({ owedToAmount: 10, owedByAmount: -5 })} />);

    expect(screen.getByText('+$10,00')).toBeTruthy();
    expect(screen.getByText('-$5,00')).toBeTruthy();
  });

  it('property: "Te deben" keeps success tone for any non-negative amount', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (amount) => {
        const { unmount } = render(<SummaryCards summary={makeSummary({ owedToAmount: amount })} />);

        const tone = screen.getByTestId('summary-chip-Te deben detail').props['data-tone'];
        unmount();

        return tone === 'success';
      }),
      { numRuns: 20 },
    );
  });

  it('property: "Debes" keeps debt tone for any negative amount', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100000 }), (amount) => {
        const { unmount } = render(<SummaryCards summary={makeSummary({ owedByAmount: -amount })} />);

        const tone = screen.getByTestId('summary-chip-Debes detail').props['data-tone'];
        unmount();

        return tone === 'debt';
      }),
      { numRuns: 20 },
    );
  });
});
