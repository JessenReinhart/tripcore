/**
 * Hash a PIN string using SHA-256 via the Web Crypto API.
 * Returns a hex string suitable for storage/comparison.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compare a plaintext PIN against a stored hex hash. */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const computed = await hashPin(pin);
  return computed === storedHash;
}
