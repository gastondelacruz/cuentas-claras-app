import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { Card } from '../../../shared/ui/Card';
import { EmptyState } from '../../../shared/ui/EmptyState';

export function HomeLoadingView() {
  return (
    <View className="flex-1 items-center justify-center p-6" accessibilityRole="progressbar" accessibilityLabel="Cargando inicio">
      <ActivityIndicator color={colors.primary} size="large" />
      <Text className="mt-4 text-base font-semibold text-neutral500">Cargando inicio...</Text>
    </View>
  );
}

type HomeEmptyViewProps = {
  onCreateGroup: () => void;
};

export function HomeEmptyView({ onCreateGroup }: HomeEmptyViewProps) {
  return (
    <EmptyState
      buttonLabel="Crear un Grupo"
      description="Crea tu primer grupo para empezar a dividir gastos con tus amigos."
      onPress={onCreateGroup}
      title="Aún no tienes movimientos"
    />
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
