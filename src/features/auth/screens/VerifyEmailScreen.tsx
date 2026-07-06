import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { Button } from "../../../shared/ui/Button";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { useVerifyEmailScreen } from "../hooks/useVerifyEmailScreen";

export function VerifyEmailScreen() {
	const { hasToken, isPending, isSuccess, isError, retryVerification } =
		useVerifyEmailScreen();

	return (
		<ScreenContainer>
			<View
				className="flex-1 items-center justify-center gap-3 px-6"
				accessibilityRole={isError || !hasToken ? "alert" : undefined}
			>
				{isPending ? (
					<ActivityIndicator color={colors.primary} size="large" />
				) : null}
				<Text className="text-center text-2xl font-bold text-neutral900">
					{!hasToken
						? "El enlace de verificación no es válido"
						: isSuccess
							? "Email verificado"
							: isError
								? "No pudimos verificar tu email"
								: "Verificando email..."}
				</Text>
				<Text className="text-center text-base leading-6 text-neutral600">
					{!hasToken || isError
						? "El enlace puede estar vencido o ya fue usado. Reenviá el email de verificación e intentá nuevamente."
						: isSuccess
							? "Ya podés usar todas las funciones de Cuentas Claras."
							: "Esto puede tardar unos segundos."}
				</Text>
				{hasToken && isError ? (
					<Button
						accessibilityLabel="Reintentar verificación de email"
						disabled={isPending}
						label="Reintentar"
						onPress={retryVerification}
					/>
				) : null}
			</View>
		</ScreenContainer>
	);
}
