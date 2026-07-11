import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] as const;
const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'] as const;

export function utcNoon(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
}

export function utcMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12));
}

export function shiftUtcMonth(date: Date, delta: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1, 12));
}

export function isSameUtcDay(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate();
}

type CalendarMonthProps = {
  displayedMonth: Date;
  selectedDate: Date;
  testIDPrefix: string;
  onChangeMonth: (delta: number) => void;
  onSelectDate: (date: Date) => void;
};

export function CalendarMonth({ displayedMonth, selectedDate, testIDPrefix, onChangeMonth, onSelectDate }: CalendarMonthProps) {
  const cells = useMemo(() => buildCalendarCells(displayedMonth), [displayedMonth]);
  const monthLabel = `${MONTHS_ES[displayedMonth.getUTCMonth()]} ${displayedMonth.getUTCFullYear()}`;

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 16 }}>
        <Text selectable style={{ fontSize: 16, fontWeight: '700', color: '#191c1d' }}>{monthLabel}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <MonthButton label="Mes anterior" testID={`${testIDPrefix}-previous-month`} onPress={() => onChangeMonth(-1)} direction="left" />
          <MonthButton label="Mes siguiente" testID={`${testIDPrefix}-next-month`} onPress={() => onChangeMonth(1)} direction="right" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {WEEKDAY_LABELS.map((day) => <Text key={day} style={{ width: `${100 / 7}%`, paddingVertical: 6, textAlign: 'center', textTransform: 'uppercase', fontSize: 12, fontWeight: '700', color: '#717973' }}>{day}</Text>)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }} testID={`${testIDPrefix}-calendar-grid`}>
        {cells.map((cell) => {
          const selected = isSameUtcDay(cell.date, selectedDate);
          const isoKey = toIsoDay(cell.date);
          return (
            <Pressable key={isoKey} accessibilityRole="button" accessibilityLabel={`Seleccionar ${cell.day}`} accessibilityState={{ selected }} onPress={() => onSelectDate(cell.date)} testID={`${testIDPrefix}-day-${isoKey}`} style={{ width: `${100 / 7}%`, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: selected ? 18 : 0, backgroundColor: selected ? '#012d1d' : 'transparent' }}>
                <Text style={{ color: selected ? '#ffffff' : cell.inCurrentMonth ? '#191c1d' : '#717973', fontWeight: selected ? '700' : '400', opacity: cell.inCurrentMonth || selected ? 1 : 0.4 }}>{cell.day}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MonthButton({ label, testID, onPress, direction }: { label: string; testID: string; onPress: () => void; direction: 'left' | 'right' }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} testID={testID} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Icon color="#414844" size={24} strokeWidth={2} /></Pressable>;
}

function buildCalendarCells(displayedMonth: Date) {
  const year = displayedMonth.getUTCFullYear();
  const month = displayedMonth.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, month, 1, 12)).getUTCDay();
  const currentMonthDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const visibleCells = Math.max(5, Math.ceil((firstWeekday + currentMonthDays) / 7)) * 7;
  return Array.from({ length: visibleCells }, (_, index) => {
    const date = new Date(Date.UTC(year, month, index - firstWeekday + 1, 12));
    return { date, day: date.getUTCDate(), inCurrentMonth: date.getUTCMonth() === month };
  });
}

function toIsoDay(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}
