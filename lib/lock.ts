/**
 * App lock helpers. This keeps casual peekers out of a shared phone; it is not
 * encryption — data stays in this device's local storage either way.
 */
export const PIN_LENGTH = 4;
/** Lock again if the app was in the background for longer than this. */
export const RELOCK_AFTER_MS = 30_000;

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`present:${salt}:${pin}`);
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

export async function createLock(pin: string): Promise<{ salt: string; hash: string }> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  return { salt, hash: await hashPin(pin, salt) };
}

export async function verifyPin(pin: string, lock: { salt: string; hash: string }): Promise<boolean> {
  return (await hashPin(pin, lock.salt)) === lock.hash;
}
