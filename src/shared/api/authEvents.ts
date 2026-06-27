export const AUTH_LOGOUT_EVENT = 'auth:logout';

type LogoutListener = () => void;

const listeners = new Set<LogoutListener>();

export function emitAuthLogout() {
  listeners.forEach((listener) => listener());
}

export function onAuthLogout(listener: LogoutListener) {
  listeners.add(listener);

  return function unsubscribe() {
    listeners.delete(listener);
  };
}
