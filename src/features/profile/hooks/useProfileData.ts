import { useAuthStore } from "../../../shared/store/authStore";
import { useEmailVerificationStatus } from "../../auth/hooks/useEmailVerification";

type ProfileUser = {
	avatarUrl: string;
	email: string;
	initials: string;
	name: string;
	status: string;
	statusTone: "success" | "danger";
	statusAccessibilityLabel: string;
};

type UseProfileDataResult = {
	user: ProfileUser;
};

const defaultAvatarUrl =
	"https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=faces";

function getInitials(name: string): string {
	return name
		.split(" ")
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? "")
		.join("");
}

export function useProfileData(): UseProfileDataResult {
	const authUser = useAuthStore((state) => state.user);
	const emailVerified = useAuthStore((state) => state.emailVerified);
	const { data: verificationStatus } = useEmailVerificationStatus();
	const isVerified = verificationStatus?.verified ?? emailVerified;

	return {
		user: {
			name: authUser?.name ?? authUser?.email ?? "Usuario",
			email: authUser?.email ?? "",
			status: isVerified ? "Verificado" : "No verificado",
			statusTone: isVerified ? "success" : "danger",
			statusAccessibilityLabel: isVerified
				? "Email verificado"
				: "Email no verificado",
			avatarUrl: defaultAvatarUrl,
			initials: getInitials(authUser?.name ?? authUser?.email ?? "U"),
		},
	};
}
