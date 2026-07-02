import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';

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

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

const MONTHS_ES_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'] as const;

function startOfCurrentMonth(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0));
}

function todayNoon(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
}

function shiftMonthNoon(date: Date, delta: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, date.getUTCDate(), 12, 0, 0),
  );
}

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12, 0, 0));
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function isSameUtcDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate()
  );
}

type CalendarCell = {
  date: Date;
  day: number;
  inCurrentMonth: boolean;
};

function buildCalendarCells(displayedMonth: Date): CalendarCell[] {
  const year = displayedMonth.getUTCFullYear();
  const month = displayedMonth.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, month, 1, 12, 0, 0)).getUTCDay();
  const currentMonthDays = daysInMonth(year, month);
  const visibleRows = Math.max(5, Math.ceil((firstWeekday + currentMonthDays) / 7));
  const visibleCells = visibleRows * 7;

  return Array.from({ length: visibleCells }, (_, index) => {
    const dayOffset = index - firstWeekday + 1;
    const date = new Date(Date.UTC(year, month, dayOffset, 12, 0, 0));

    return {
      date,
      day: date.getUTCDate(),
      inCurrentMonth: date.getUTCMonth() === month,
    };
  });
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
  const [displayedMonth, setDisplayedMonth] = useState(() => monthStart(activeDate));

  useEffect(() => {
    if (!visible) return;
    const defaultRange = createDefaultRange();
    setDraftFrom(initialRange?.from ?? defaultRange.from);
    setDraftTo(initialRange?.to ?? defaultRange.to);
    setActiveField('to');
    setDisplayedMonth(monthStart(initialRange?.to ?? defaultRange.to));
  }, [initialRange, visible]);

  const monthLabel = `${MONTHS_ES[displayedMonth.getUTCMonth()]} ${displayedMonth.getUTCFullYear()}`;
  const calendarCells = useMemo(() => buildCalendarCells(displayedMonth), [displayedMonth]);

  function selectDate(date: Date) {
    const normalized = todayNoon(date);
    if (activeField === 'from') {
      setDraftFrom(normalized);
      return;
    }
    setDraftTo(normalized);
  }

  function shiftActiveMonth(delta: number) {
    setDisplayedMonth((current) => shiftMonthNoon(current, delta));
  }

  function activateField(field: ActiveDateField) {
    setActiveField(field);
    setDisplayedMonth(monthStart(field === 'from' ? draftFrom : draftTo));
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

            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 16 }}>
                <Text selectable style={{ fontSize: 16, fontWeight: '700', color: '#191c1d' }}>
                  {monthLabel}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Mes anterior"
                    hitSlop={8}
                    onPress={() => shiftActiveMonth(-1)}
                    testID="period-previous-month"
                  >
                    <ChevronLeft color="#414844" size={24} strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Mes siguiente"
                    hitSlop={8}
                    onPress={() => shiftActiveMonth(1)}
                    testID="period-next-month"
                  >
                    <ChevronRight color="#414844" size={24} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {WEEKDAY_LABELS.map((day) => (
                  <Text
                    key={day}
                    style={{
                      width: `${100 / 7}%`,
                      paddingVertical: 6,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      fontSize: 12,
                      fontWeight: '700',
                      color: '#717973',
                    }}
                  >
                    {day}
                  </Text>
                ))}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }} testID="period-calendar-grid">
                {calendarCells.map((cell) => {
                  const selected = isSameUtcDay(cell.date, activeDate);
                  const isoKey = `${cell.date.getUTCFullYear()}-${String(cell.date.getUTCMonth() + 1).padStart(2, '0')}-${String(cell.date.getUTCDate()).padStart(2, '0')}`;
                  return (
                    <Pressable
                      key={isoKey}
                      accessibilityRole="button"
                      accessibilityLabel={`Seleccionar ${cell.day}`}
                      accessibilityState={{ selected }}
                      onPress={() => selectDate(cell.date)}
                      testID={`period-day-${isoKey}`}
                      style={{
                        width: `${100 / 7}%`,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 2,
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: selected ? 18 : 0,
                          backgroundColor: selected ? '#012d1d' : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            color: selected ? '#ffffff' : cell.inCurrentMonth ? '#191c1d' : '#717973',
                            fontWeight: selected ? '700' : '400',
                            opacity: cell.inCurrentMonth || selected ? 1 : 0.4,
                          }}
                        >
                          {cell.day}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
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
