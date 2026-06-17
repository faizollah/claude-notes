// crypto.js — End-to-end encryption primitives for Claude Notes cloud sync.
//
// Design goal: zero-knowledge sync. Notes are encrypted on this device with a
// key derived from the user's passphrase. Only ciphertext ever leaves the
// browser, so the storage provider (Google Drive) cannot read the notes.
//
// - Key derivation: PBKDF2-HMAC-SHA256 (600k iterations) -> 256-bit key
// - Encryption: AES-256-GCM with a fresh 96-bit IV per message
// - The passphrase and derived key never touch disk or the network.
//
// The salt and KDF parameters are NOT secret and are stored alongside the
// ciphertext so any device with the passphrase can re-derive the same key.

const CryptoUtil = (() => {
  const KDF_ITERATIONS = 600000;
  const KDF_HASH = 'SHA-256';
  const SALT_BYTES = 16;
  const IV_BYTES = 12;

  // A short, constant value we encrypt so we can verify a passphrase is
  // correct (and data is intact) without trusting decryption of the payload.
  const VERIFIER_PLAINTEXT = 'claude-notes-verifier-v1';

  function bufToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function base64ToBuf(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function randomBytes(n) {
    return crypto.getRandomValues(new Uint8Array(n));
  }

  // Derive an AES-GCM key from a passphrase + salt. Returns a non-extractable
  // CryptoKey so the raw key bits can never be read back out.
  async function deriveKey(passphrase, saltBytes, iterations = KDF_ITERATIONS) {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBytes, iterations, hash: KDF_HASH },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt a UTF-8 string. Returns { iv, ct } as base64 strings.
  async function encryptString(key, plaintext) {
    const iv = randomBytes(IV_BYTES);
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(plaintext)
    );
    return { iv: bufToBase64(iv), ct: bufToBase64(ct) };
  }

  // Decrypt { iv, ct } (base64) back to a UTF-8 string. Throws if the key is
  // wrong or the ciphertext was tampered with (AES-GCM authentication).
  async function decryptString(key, payload) {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(base64ToBuf(payload.iv)) },
      key,
      base64ToBuf(payload.ct)
    );
    return new TextDecoder().decode(plaintext);
  }

  // Build the self-describing encrypted envelope written to the cloud.
  // `dataObject` is the full notes payload; it is JSON-encoded then encrypted.
  async function buildEnvelope(passphrase, dataObject) {
    const salt = randomBytes(SALT_BYTES);
    const key = await deriveKey(passphrase, salt);
    const verifier = await encryptString(key, VERIFIER_PLAINTEXT);
    const body = await encryptString(key, JSON.stringify(dataObject));
    return {
      v: 1,
      kdf: {
        name: 'PBKDF2',
        hash: KDF_HASH,
        iterations: KDF_ITERATIONS,
        salt: bufToBase64(salt)
      },
      verifier,
      body
    };
  }

  // Decrypt an envelope produced by buildEnvelope(). Returns the original data
  // object. Throws 'WRONG_PASSPHRASE' if the passphrase cannot decrypt it.
  async function openEnvelope(passphrase, envelope) {
    if (!envelope || !envelope.kdf || !envelope.kdf.salt) {
      throw new Error('INVALID_ENVELOPE');
    }
    const salt = new Uint8Array(base64ToBuf(envelope.kdf.salt));
    const key = await deriveKey(passphrase, salt, envelope.kdf.iterations || KDF_ITERATIONS);
    // Verify passphrase first so we fail fast and clearly.
    try {
      const check = await decryptString(key, envelope.verifier);
      if (check !== VERIFIER_PLAINTEXT) throw new Error('WRONG_PASSPHRASE');
    } catch (e) {
      throw new Error('WRONG_PASSPHRASE');
    }
    const json = await decryptString(key, envelope.body);
    return JSON.parse(json);
  }

  return { buildEnvelope, openEnvelope };
})();

// Expose for use by sync.js in the library page.
if (typeof window !== 'undefined') window.CryptoUtil = CryptoUtil;
