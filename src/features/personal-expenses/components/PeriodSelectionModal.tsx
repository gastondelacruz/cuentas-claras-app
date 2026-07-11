import { CalendarDays, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { CalendarMonth, shiftUtcMonth, utcMonthStart, utcNoon } from './CalendarMonth';

type PeriodRange = {
  from: Date;
  to: Date;
};

type PeriodSelectionModalProps = {
  visible: boolean;
  initialRange: PeriodRange | null;
  onClose: () => void;
  onApply: (from: Date, to: Date) => void;
};

type ActiveDateField = 'from' | 'to';

const MONTHS_ES_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

function startOfCurrentMonth(now: Date) {
  return utcMonthStart(now);
}

function todayNoon(now: Date) {
  return utcNoon(now);
}

function formatDisplayDate(date: Date) {
  return `${date.getUTCDate()} ${MONTHS_ES_SHORT[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

function createDefaultRange() {
  const now = new Date();
  return {
    from: startOfCurrentMonth(now),
    to: todayNoon(now),
  };
}

export function PeriodSelectionModal({
  visible,
  initialRange,
  onClose,
  onApply,
}: PeriodSelectionModalProps) {
  const [draftFrom, setDraftFrom] = useState(() => initialRange?.from ?? createDefaultRange().from);
  const [draftTo, setDraftTo] = useState(() => initialRange?.to ?? createDefaultRange().to);
  const [activeField, setActiveField] = useState<ActiveDateField>('to');
  const activeDate = activeField === 'from' ? draftFrom : draftTo;
  const [displayedMonth, setDisplayedMonth] = useState(() => utcMonthStart(activeDate));

  useEffect(() => {
    if (!visible) return;
    const defaultRange = createDefaultRange();
    setDraftFrom(initialRange?.from ?? defaultRange.from);
    setDraftTo(initialRange?.to ?? defaultRange.to);
    setActiveField('to');
    setDisplayedMonth(utcMonthStart(initialRange?.to ?? defaultRange.to));
  }, [initialRange, visible]);

  function selectDate(date: Date) {
    const normalized = todayNoon(date);
    if (activeField === 'from') {
      setDraftFrom(normalized);
      return;
    }
    setDraftTo(normalized);
  }

  function shiftActiveMonth(delta: number) {
    setDisplayedMonth((current) => shiftUtcMonth(current, delta));
  }

  function activateField(field: ActiveDateField) {
    setActiveField(field);
    setDisplayedMonth(utcMonthStart(field === 'from' ? draftFrom : draftTo));
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View
        accessibilityViewIsModal
        testID="period-selection-modal"
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backgroundColor: 'rgba(25, 28, 29, 0.4)',
        }}
      >
        <View
          accessible
          accessibilityRole="summary"
          accessibilityLabel="Seleccionar período personalizado"
          style={{
            width: '100%',
            maxWidth: 430,
            overflow: 'hidden',
            borderRadius: 16,
            backgroundColor: '#ffffff',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.25)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(193, 200, 194, 0.3)',
              padding: 24,
            }}
          >
            <Text selectable style={{ fontSize: 20, lineHeight: 28, fontWeight: '600', color: '#012d1d' }}>
              Seleccionar Período
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar selección de período"
              hitSlop={8}
              onPress={onClose}
              testID="period-modal-close"
              style={{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
              }}
            >
              <X color="#414844" size={22} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={{ gap: 16, padding: 24 }}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <DateField
                label="Desde"
                selected={activeField === 'from'}
                testID="period-from-field"
                value={formatDisplayDate(draftFrom)}
                onPress={() => activateField('from')}
              />
              <DateField
                label="Hasta"
                selected={activeField === 'to'}
                testID="period-to-field"
                value={formatDisplayDate(draftTo)}
                onPress={() => activateField('to')}
              />
            </View>

            <CalendarMonth
              displayedMonth={displayedMonth}
              selectedDate={activeDate}
              testIDPrefix="period"
              onChangeMonth={shiftActiveMonth}
              onSelectDate={selectDate}
            />
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(193, 200, 194, 0.3)',
              backgroundColor: '#ffffff',
              padding: 24,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aceptar período seleccionado"
              onPress={() => onApply(draftFrom, draftTo)}
              testID="period-apply-button"
              style={{
                minHeight: 56,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: '#012d1d',
                boxShadow: '0 8px 18px rgba(1, 45, 29, 0.25)',
              }}
            >
              <Text style={{ fontSize: 20, lineHeight: 28, fontWeight: '600', color: colors.white }}>
                Aceptar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DateField({
  label,
  value,
  selected,
  testID,
  onPress,
}: {
  label: string;
  value: string;
  selected: boolean;
  testID: string;
  onPress: () => void;
}) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: '600', color: '#414844' }}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} ${value}`}
        accessibilityState={{ selected }}
        onPress={onPress}
        testID={testID}
        style={{
          minHeight: 56,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          borderWidth: 1,
          borderColor: selected ? '#012d1d' : 'rgba(193, 200, 194, 0.3)',
          borderRadius: 8,
          backgroundColor: selected ? 'rgba(27, 67, 50, 0.1)' : '#f3f4f5',
          paddingHorizontal: 12,
        }}
      >
        <CalendarDays color="#012d1d" size={20} strokeWidth={2} />
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 14,
            lineHeight: 20,
            fontWeight: selected ? '700' : '400',
            color: selected ? '#012d1d' : '#191c1d',
          }}
        >
          {value}
        </Text>
      </Pressable>
    </View>
  );
}
