import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { Card } from '../../../shared/ui/Card';

export function HomeLoadingView() {
  return (
    <View className="flex-1 items-center justify-center p-6" accessibilityRole="progressbar" accessibilityLabel="Cargando inicio">
      <ActivityIndicator color={colors.primary} size="large" />
      <Text className="mt-4 text-base font-semibold text-neutral500">Cargando inicio...</Text>
    </View>
  );
}

export function HomeEmptyView() {
  return (
    <View className="flex-1 justify-center p-6">
      <Card variant="centered">
        <Text className="text-xl font-bold text-neutral900">Todavia no hay movimientos</Text>
        <Text className="mt-2 text-center text-base text-neutral500">Crea tu primer grupo o gasto para ver tu resumen aca.</Text>
      </Card>
    </View>
  );
}

type HomeErrorViewProps = {
  message?: string;
};

export function HomeErrorView({ message }: HomeErrorViewProps) {
  return (
    <View className="flex-1 justify-center p-6" accessibilityRole="alert">
      <Card variant="centeredError">
        <Text className="text-xl font-bold text-debt">No pudimos cargar el inicio</Text>
        <Text className="mt-2 text-center text-base text-neutral500">{message ?? 'Intentalo de nuevo en unos minutos.'}</Text>
      </Card>
    </View>
  );
}
