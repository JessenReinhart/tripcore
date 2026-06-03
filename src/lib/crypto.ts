const ENCODER = new TextEncoder();

function buf2hex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hex2buf(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}

/** Hash a PIN using PBKDF2 with a random salt. Returns "pbkdf2:<salt_hex>:<hash_hex>". */
export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", ENCODER.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  return `pbkdf2:${buf2hex(salt)}:${buf2hex(hash)}`;
}

/**
 * Verify a PIN against a stored hash.
 * Supports legacy unsalted SHA-256 (no prefix) and PBKDF2 formats.
 * Legacy hashes are verified then transparently re-hashed via the `onUpgrade` callback.
 */
export async function verifyPin(
  pin: string,
  storedHash: string,
  onUpgrade?: (newHash: string) => void,
): Promise<boolean> {
  // Legacy unsalted SHA-256
  if (!storedHash.startsWith("pbkdf2:")) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", ENCODER.encode(pin));
    const valid = buf2hex(hashBuffer) === storedHash;
    if (valid && onUpgrade) {
      hashPin(pin).then(onUpgrade);
    }
    return valid;
  }

  // PBKDF2: "pbkdf2:<salt_hex>:<hash_hex>"
  const [, saltHex, hashHex] = storedHash.split(":");
  const salt = hex2buf(saltHex);
  const key = await crypto.subtle.importKey("raw", ENCODER.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  return buf2hex(hash) === hashHex;
}
