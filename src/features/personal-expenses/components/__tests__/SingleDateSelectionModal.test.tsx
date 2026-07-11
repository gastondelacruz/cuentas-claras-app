import { fireEvent, render, screen } from '@testing-library/react-native';

import { SingleDateSelectionModal } from '../SingleDateSelectionModal';

describe('SingleDateSelectionModal', () => {
  const initialDate = new Date('2026-06-25T12:00:00.000Z');

  it('renders a single-date calendar without period range fields', () => {
    render(
      <SingleDateSelectionModal
        visible
        initialDate={initialDate}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />,
    );

    expect(screen.getByText('Seleccionar fecha')).toBeTruthy();
    expect(screen.queryByText('Desde')).toBeNull();
    expect(screen.queryByText('Hasta')).toBeNull();
    expect(screen.getByTestId('single-date-day-2026-06-25').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('keeps day selection as a draft until Aceptar is pressed', () => {
    const onApply = jest.fn();
    render(
      <SingleDateSelectionModal
        visible
        initialDate={initialDate}
        onClose={jest.fn()}
        onApply={onApply}
      />,
    );

    fireEvent.press(screen.getByTestId('single-date-day-2026-06-20'));

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByTestId('single-date-day-2026-06-20').props.accessibilityState).toMatchObject({ selected: true });
    fireEvent.press(screen.getByTestId('single-date-apply-button'));
    expect(onApply).toHaveBeenCalledWith(new Date('2026-06-20T12:00:00.000Z'));
  });

  it('navigates months and allows selecting a day there', () => {
    render(
      <SingleDateSelectionModal
        visible
        initialDate={initialDate}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('single-date-next-month'));

    expect(screen.getByText('Julio 2026')).toBeTruthy();
    expect(screen.getByTestId('single-date-day-2026-07-10')).toBeTruthy();
  });

  it('closes without applying draft changes and resets them when reopened', () => {
    const onClose = jest.fn();
    const onApply = jest.fn();
    const { rerender } = render(
      <SingleDateSelectionModal visible initialDate={initialDate} onClose={onClose} onApply={onApply} />,
    );
    fireEvent.press(screen.getByTestId('single-date-day-2026-06-20'));
    fireEvent.press(screen.getByTestId('single-date-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();

    rerender(<SingleDateSelectionModal visible={false} initialDate={initialDate} onClose={onClose} onApply={onApply} />);
    rerender(<SingleDateSelectionModal visible initialDate={initialDate} onClose={onClose} onApply={onApply} />);
    expect(screen.getByTestId('single-date-day-2026-06-25').props.accessibilityState).toMatchObject({ selected: true });
  });
});
