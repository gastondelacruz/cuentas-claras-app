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

function makeSummary({ owedToAmount = 0, owedByAmount = 0 } = {}): HomeSummary {
  return {
    owedToUser: {
      id: 'owed-to-user',
      title: 'Te deben',
      amount: owedToAmount,
      detail: 'Te deben detail',
      tone: 'success',
    },
    owedByUser: {
      id: 'owed-by-user',
      title: 'Debes',
      amount: owedByAmount,
      detail: 'Debes detail',
      tone: 'debt',
    },
  };
}

describe('SummaryCards', () => {
  it('renders the "Debes" chip with debt tone when the amount is zero', () => {
    render(<SummaryCards summary={makeSummary({ owedByAmount: 0 })} />);

    expect(screen.getByTestId('summary-chip-Debes detail').props['data-tone']).toBe('debt');
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
