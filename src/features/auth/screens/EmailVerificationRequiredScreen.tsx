import { Text, View } from 'react-native';

import { EmailVerificationBanner } from '../components/EmailVerificationBanner';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';

export function EmailVerificationRequiredScreen() {
  return (
    <ScreenContainer>
      <EmailVerificationBanner visible />
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-center text-2xl font-bold text-neutral900">Verificá tu email</Text>
        <Text className="text-center text-base leading-6 text-neutral600">
          Necesitás verificar tu email para usar esta función. Podés reenviar el email desde el aviso.
        </Text>
      </View>
    </ScreenContainer>
  );
}
