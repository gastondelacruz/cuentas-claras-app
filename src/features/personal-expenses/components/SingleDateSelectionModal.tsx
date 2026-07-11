import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { CalendarMonth, shiftUtcMonth, utcMonthStart, utcNoon } from './CalendarMonth';

type Props = {
  visible: boolean;
  initialDate: Date;
  onClose: () => void;
  onApply: (date: Date) => void;
};

export function SingleDateSelectionModal({ visible, initialDate, onClose, onApply }: Props) {
  const [draftDate, setDraftDate] = useState(() => utcNoon(initialDate));
  const [displayedMonth, setDisplayedMonth] = useState(() => utcMonthStart(initialDate));

  useEffect(() => {
    if (!visible) return;
    setDraftDate(utcNoon(initialDate));
    setDisplayedMonth(utcMonthStart(initialDate));
  }, [initialDate, visible]);

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View accessibilityViewIsModal testID="single-date-selection-modal" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(25, 28, 29, 0.4)' }}>
        <View accessible accessibilityRole="summary" accessibilityLabel="Seleccionar una fecha" style={{ width: '100%', maxWidth: 430, overflow: 'hidden', borderRadius: 16, backgroundColor: '#ffffff', boxShadow: '0 18px 40px rgba(0, 0, 0, 0.25)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(193, 200, 194, 0.3)', padding: 24 }}>
            <Text selectable style={{ fontSize: 20, lineHeight: 28, fontWeight: '600', color: '#012d1d' }}>Seleccionar fecha</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar selección de fecha" onPress={onClose} testID="single-date-close" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 }}>
              <X color="#414844" size={22} strokeWidth={2} />
            </Pressable>
          </View>
          <View style={{ padding: 24 }}>
            <CalendarMonth displayedMonth={displayedMonth} selectedDate={draftDate} testIDPrefix="single-date" onChangeMonth={(delta) => setDisplayedMonth((current) => shiftUtcMonth(current, delta))} onSelectDate={(date) => setDraftDate(utcNoon(date))} />
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(193, 200, 194, 0.3)', padding: 24 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Aceptar fecha seleccionada" onPress={() => onApply(draftDate)} testID="single-date-apply-button" style={{ minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#012d1d', boxShadow: '0 8px 18px rgba(1, 45, 29, 0.25)' }}>
              <Text style={{ fontSize: 20, lineHeight: 28, fontWeight: '600', color: colors.white }}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
