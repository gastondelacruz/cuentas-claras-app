import { useAuthStore } from "../../../shared/store/authStore";

type ProfileUser = {
  avatarUrl: string;
  email: string;
  initials: string;
  name: string;
  status: string;
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

  return {
    user: {
      name: authUser?.name ?? authUser?.email ?? "Usuario",
      email: authUser?.email ?? "",
      status: "Verificado",
      avatarUrl: defaultAvatarUrl,
      initials: getInitials(authUser?.name ?? authUser?.email ?? "U"),
    },
  };
}
