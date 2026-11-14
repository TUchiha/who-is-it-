import { Result, ok, err } from '../utils/result';
import type { CryptoFailure } from '../errors/failure';

const ALGORITHM_NAME = 'AES-GCM';
const KEY_LENGTH_BITS = 256;
const IV_LENGTH_BYTES = 12; // 96-bit recommended for AES-GCM

export interface EncryptedPayload {
  readonly iv: string; // Base64
  readonly ciphertext: string; // Base64
  readonly algorithm: 'AES-GCM-256';
  readonly createdAt: string;
}

/**
 * Generates a non-extractable 256-bit AES-GCM key for IndexedDB storage.
 * Setting extractable to false ensures that key material cannot be leaked via JS.
 */
export async function generateMasterKey(): Promise<Result<CryptoKey, CryptoFailure>> {
  try {
    const key = await window.crypto.subtle.generateKey(
      {
        name: ALGORITHM_NAME,
        length: KEY_LENGTH_BITS,
      },
      false, // non-extractable
      ['encrypt', 'decrypt']
    );
    return ok(key);
  } catch (e) {
    return err({
      type: 'CRYPTO_KEY_GENERATION_FAILED',
      message: e instanceof Error ? e.message : 'Failed to generate cryptographic key',
    });
  }
}

/**
 * Encrypts arbitrary byte payload or JSON using AES-GCM and random IV.
 */
export async function encryptData(
  key: CryptoKey,
  plaintext: Uint8Array | string
): Promise<Result<EncryptedPayload, CryptoFailure>> {
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
    const dataBytes =
      typeof plaintext === 'string'
        ? new TextEncoder().encode(plaintext)
        : plaintext;

    const cipherBuffer = await window.crypto.subtle.encrypt(
      {
        name: ALGORITHM_NAME,
        iv,
      },
      key,
      dataBytes
    );

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const cipherBase64 = btoa(
      String.fromCharCode(...new Uint8Array(cipherBuffer))
    );

    return ok({
      iv: ivBase64,
      ciphertext: cipherBase64,
      algorithm: 'AES-GCM-256',
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    return err({
      type: 'CRYPTO_ENCRYPTION_FAILED',
      message: e instanceof Error ? e.message : 'Encryption failed',
    });
  }
}

/**
 * Decrypts an EncryptedPayload using the non-extractable CryptoKey.
 */
export async function decryptData(
  key: CryptoKey,
  payload: EncryptedPayload
): Promise<Result<Uint8Array, CryptoFailure>> {
  try {
    const ivBytes = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
    const cipherBytes = Uint8Array.from(atob(payload.ciphertext), (c) =>
      c.charCodeAt(0)
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM_NAME,
        iv: ivBytes,
      },
      key,
      cipherBytes
    );

    return ok(new Uint8Array(decryptedBuffer));
  } catch (e) {
    return err({
      type: 'CRYPTO_DECRYPTION_FAILED',
      message: e instanceof Error ? e.message : 'Decryption failed or invalid key',
    });
  }
}
