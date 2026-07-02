import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';

import type { RootStackParamList } from '../../../app/navigation/types';
import { maskAmountInput } from '../../expenses/utils/maskAmountInput';
import { getPersonalTransactionCategories } from '../constants/personalTransactionCategories';
import type { PersonalTransactionType } from '../types';
import { useCreatePersonalTransaction } from './useCreatePersonalTransaction';

type AddPersonalTransactionNavigation = NativeStackNavigationProp<RootStackParamList, 'AddPersonalTransaction'>;
type AddPersonalTransactionRoute = RouteProp<RootStackParamList, 'AddPersonalTransaction'>;

const CURRENCY = 'ARS';

type DateChipId = 'today' | 'yesterday' | 'last' | 'custom';

type DateChip = {
  id: DateChipId;
  label: string;
  subLabel?: string;
  date: Date;
};

function formatShortDate(date: Date) {
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
}

/**
 * Builds the date chip options relative to `now`.
 * All dates use noon UTC so they remain unambiguous across timezones.
 */
function getDateChips(now: Date, customDate: Date | null): DateChip[] {
  const todayNoon = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0),
  );
  const yesterdayNoon = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 12, 0, 0),
  );

  const todayLabel = `${formatShortDate(now)} hoy`;
  const yesterdayLabel = `${formatShortDate(yesterdayNoon)} ayer`;

  const chips: DateChip[] = [
    { id: 'today', label: todayLabel, date: todayNoon },
    { id: 'yesterday', label: yesterdayLabel, date: yesterdayNoon },
    // "último" is a static placeholder for the most-recent past transaction date.
    // TODO: derive from the user's transaction history once the API supports it.
    { id: 'last', label: '14/9 último', date: new Date('2025-09-14T12:00:00.000Z') },
  ];

  if (customDate) {
    const customNoon = new Date(
      Date.UTC(customDate.getUTCFullYear(), customDate.getUTCMonth(), customDate.getUTCDate(), 12, 0, 0),
    );
    chips.push({
      id: 'custom',
      label: formatShortDate(customNoon),
      subLabel: 'elegida',
      date: customNoon,
    });
  }

  return chips;
}

function parseAmount(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : 0;
}

const NOTE_PLACEHOLDERS: Record<PersonalTransactionType, string> = {
  expense: '¿En qué gastaste?',
  income: '¿De qué es este ingreso?',
};

export function useAddPersonalTransactionForm() {
  const navigation = useNavigation<AddPersonalTransactionNavigation>();
  const route = useRoute<AddPersonalTransactionRoute>();
  const initialType = route.params?.type ?? 'expense';
  const [type, setType] = useState<PersonalTransactionType>(initialType);
  const categories = useMemo(
    () => getPersonalTransactionCategories(type).filter((category) => category !== 'Más'),
    [type],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(() => categories[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const notePlaceholder = NOTE_PLACEHOLDERS[type];

  // Date chips are computed relative to the moment the form opens so labels stay
  // stable during the form session. new Date() is intercepted by jest.useFakeTimers in tests.
  const [now] = useState(() => new Date());
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateChips = useMemo(() => getDateChips(now, customDate), [now, customDate]);
  const [selectedDateId, setSelectedDateId] = useState<DateChipId>('today');

  const [submitError, setSubmitError] = useState<string | undefined>();
  const createMutation = useCreatePersonalTransaction();

  function changeType(nextType: PersonalTransactionType) {
    setType(nextType);
    setSelectedCategory(
      getPersonalTransactionCategories(nextType).filter((category) => category !== 'Más')[0],
    );
  }

  function changeAmount(value: string) {
    setAmount(maskAmountInput(value));
  }

  function changeNote(value: string) {
    setNote(value);
  }

  function handleDatePickerChange(date?: Date) {
    if (date) {
      setCustomDate(date);
      setSelectedDateId('custom');
    }
    setShowDatePicker(false);
  }

  function submit() {
    setSubmitError(undefined);
    const parsedAmount = parseAmount(amount);

    if (parsedAmount <= 0) {
      setSubmitError('Ingresá un monto mayor a 0');
      return;
    }

    const selectedChip = dateChips.find((chip) => chip.id === selectedDateId) ?? dateChips[0];
    const trimmedNote = note.trim();

    createMutation.mutate(
      {
        type,
        amount: parsedAmount,
        currency: CURRENCY,
        category: selectedCategory,
        // accountId intentionally omitted: the backend defaults to the
        // user's default account when it's not provided (see swagger-spec.json).
        occurredAt: selectedChip.date.toISOString(),
        ...(trimmedNote ? { note: trimmedNote } : {}),
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: () => setSubmitError('No pudimos añadir la transacción. Intentá de nuevo.'),
      },
    );
  }

  return {
    type,
    changeType,
    amount,
    changeAmount,
    note,
    changeNote,
    notePlaceholder,
    categories,
    selectedCategory,
    setSelectedCategory,
    dateChips,
    selectedDateId,
    setSelectedDateId,
    customDate,
    showDatePicker,
    setShowDatePicker,
    handleDatePickerChange,
    submit,
    submitError,
    isSubmitting: createMutation.isPending,
  };
}
