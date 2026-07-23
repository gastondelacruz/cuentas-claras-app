import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Fingerprint, LogOut } from "lucide-react-native";

import { colors } from "../../../shared/theme/colors";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { Avatar } from "../../../shared/ui/Avatar";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import packageJson from "../../../../package.json";
import { useBiometricAuth } from "../../auth/hooks/useBiometricAuth";
import { useLogout } from "../../auth/hooks/useLogout";
import { useProfileData } from "../hooks/useProfileData";

type ProfileUser = {
	avatarUrl: string;
	email: string;
	initials: string;
	name: string;
	status: string;
	statusTone: "success" | "danger";
	statusAccessibilityLabel: string;
};

function ProfileCard({ profile }: { profile: ProfileUser }) {
	return (
		<View className="items-center rounded-lg bg-white px-5 py-8 shadow-sm">
			<View className="mb-5">
				<Avatar name={profile.name} initials={profile.initials} />
			</View>

			<Text className="text-2xl font-bold text-neutral900">{profile.name}</Text>
			<Text selectable className="mt-1 text-xl text-neutral700">
				{profile.email}
			</Text>

			<View className="mt-6 w-full flex-row items-center justify-center">
				<View
					accessible
					accessibilityRole="text"
					accessibilityLabel={profile.statusAccessibilityLabel}
					className={`rounded-full px-5 py-2 ${profile.statusTone === "success" ? "bg-primaryBg" : "bg-debtBg"}`}
				>
					<Text
						className={`text-xl ${profile.statusTone === "success" ? "text-success" : "text-debt"}`}
					>
						{profile.status}
					</Text>
				</View>
			</View>
		</View>
	);
}

export function ProfileScreen() {
	const { user } = useProfileData();
	const logout = useLogout();
	const {
		enabled: biometricEnabled,
		isPending: biometricPending,
		enable,
		disable,
	} = useBiometricAuth();
	const version = packageJson.version;

	return (
		<ScreenContainer>
			<AppTopBar />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-8 pb-28 pt-6"
			>
				<View className="gap-8 px-5">
					<ProfileCard profile={user} />

					<View className="gap-4">
						<Text className="text-xl font-bold text-neutral900">Seguridad</Text>
						<View className="flex-row items-center rounded-lg bg-white px-5 py-4 shadow-sm">
							<Fingerprint color={colors.primary} size={24} strokeWidth={2.2} />
							<Text className="ml-4 flex-1 text-lg text-neutral900">
								Desbloqueo biométrico
							</Text>
							<Switch
								accessibilityLabel="Desbloqueo biométrico"
								accessibilityRole="switch"
								accessibilityState={{ checked: biometricEnabled }}
								ios_backgroundColor={colors.neutral200}
								onValueChange={(value) => {
									void (value ? enable() : disable());
								}}
								disabled={biometricPending}
								thumbColor={colors.white}
								trackColor={{ false: colors.neutral200, true: colors.primary }}
								value={biometricEnabled}
							/>
						</View>
					</View>

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Cerrar sesión"
						accessibilityState={{
							busy: logout.isPending,
							disabled: logout.isPending,
						}}
						disabled={logout.isPending}
						onPress={() => logout.mutate()}
						className="flex-row items-center justify-center gap-3 py-6"
					>
						<LogOut color={colors.debt} size={24} strokeWidth={2.2} />
						<Text className="text-xl text-debt">Cerrar Sesión</Text>
					</Pressable>

					<Text className="text-center text-lg text-neutral700">
						Versión {version}
					</Text>
				</View>
			</ScrollView>
		</ScreenContainer>
	);
}
