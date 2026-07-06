import { create } from "zustand";

export type AuthUser = {
  id: string;
  name?: string;
  email: string;
};

type EmailVerificationStatus = {
  verified: boolean;
  verifiedAt: string | null;
};

type AuthStore = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  pendingGroupInvitationToken: string | null;
  setSession: (user: AuthUser, token: string) => void;
  setAccessToken: (token: string) => void;
  setEmailVerification: (status: EmailVerificationStatus) => void;
  setPendingGroupInvitationToken: (token: string | null) => void;
  clearSession: () => void;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
    const decoded = globalThis.atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readEmailVerifiedClaim(token: string): boolean {
  const payload = decodeJwtPayload(token);
  return payload?.emailVerified === true || payload?.email_verified === true || payload?.verified === true;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  emailVerified: false,
  emailVerifiedAt: null,
  pendingGroupInvitationToken: null,
  setSession: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true, emailVerified: readEmailVerifiedClaim(token) }),
  setAccessToken: (token) =>
    set({ accessToken: token, emailVerified: readEmailVerifiedClaim(token) }),
  setEmailVerification: ({ verified, verifiedAt }) =>
    set({ emailVerified: verified, emailVerifiedAt: verifiedAt }),
  setPendingGroupInvitationToken: (token) =>
    set({ pendingGroupInvitationToken: token }),
  clearSession: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, emailVerified: false, emailVerifiedAt: null, pendingGroupInvitationToken: null }),
}));
