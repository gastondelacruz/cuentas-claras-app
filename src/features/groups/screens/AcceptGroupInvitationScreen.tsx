import { ActivityIndicator, Text, View } from "react-native";

import { EmailVerificationBanner } from "../../auth/components/EmailVerificationBanner";
import { colors } from "../../../shared/theme/colors";
import { Button } from "../../../shared/ui/Button";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { useAcceptGroupInvitationScreen } from "../hooks/useAcceptGroupInvitationScreen";

export function AcceptGroupInvitationScreen() {
	const {
		hasToken,
		isAuthenticated,
		emailVerified,
		isPending,
		isSuccess,
		isError,
		retryAcceptInvitation,
	} = useAcceptGroupInvitationScreen();
	const showBanner = isAuthenticated && !emailVerified;

	return (
		<ScreenContainer>
			<EmailVerificationBanner visible={showBanner} />
			<View
				className="flex-1 items-center justify-center gap-3 px-6"
				accessibilityRole={
					isError || !hasToken || showBanner ? "alert" : undefined
				}
			>
				{isPending ? (
					<ActivityIndicator color={colors.primary} size="large" />
				) : null}
				<Text className="text-center text-2xl font-bold text-neutral900">
					{!hasToken
						? "La invitación no es válida"
						: !isAuthenticated
							? "Iniciá sesión para aceptar la invitación"
							: showBanner
								? "Verificá tu email para aceptar la invitación"
								: isSuccess
									? "Invitación aceptada"
									: isError
										? "No pudimos aceptar la invitación"
										: "Aceptando invitación..."}
				</Text>
				<Text className="text-center text-base leading-6 text-neutral600">
					{!hasToken || isError
						? "El enlace puede estar vencido o ya fue usado. Pedí una nueva invitación."
						: showBanner
							? "No vamos a aceptar la invitación hasta que completes la verificación."
							: "Te llevaremos a tus grupos cuando termine."}
				</Text>
				{hasToken && isAuthenticated && emailVerified && isError ? (
					<Button
						accessibilityLabel="Reintentar aceptación de invitación"
						disabled={isPending}
						label="Reintentar"
						onPress={retryAcceptInvitation}
					/>
				) : null}
			</View>
		</ScreenContainer>
	);
}
