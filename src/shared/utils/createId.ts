import * as Crypto from 'expo-crypto';

/**
 * Generates a globally unique identifier (UUID v4).
 *
 * Used for client-side entity ids (groups, expenses) so concurrent creations
 * never collide, unlike timestamp-based ids. Wrapped in a single helper so the
 * id source can be swapped or mocked in one place.
 */
export function createId(): string {
  return Crypto.randomUUID();
}
