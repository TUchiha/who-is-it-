import { describe, it, expect, beforeAll } from 'vitest';
import { generateMasterKey, encryptData, decryptData } from '../../src/core/security/crypto';
import { webcrypto } from 'crypto';

describe('WebCrypto AES-GCM Layer', () => {
  beforeAll(() => {
    if (!globalThis.crypto || !globalThis.crypto.subtle) {
      // @ts-expect-error polyfill for node test environment
      globalThis.crypto = webcrypto;
    }
    if (!window.crypto) {
      // @ts-expect-error window mock
      window.crypto = globalThis.crypto;
    }
  });

  it('generates a non-extractable CryptoKey', async () => {
    const keyResult = await generateMasterKey();
    expect(keyResult.success).toBe(true);
    if (keyResult.success) {
      expect(keyResult.value.extractable).toBe(false);
      expect(keyResult.value.algorithm.name).toBe('AES-GCM');
    }
  });

  it('encrypts and decrypts text payloads successfully', async () => {
    const keyResult = await generateMasterKey();
    expect(keyResult.success).toBe(true);
    if (!keyResult.success) return;

    const plaintext = 'Secret biometric template hash 123456';
    const encryptedResult = await encryptData(keyResult.value, plaintext);
    expect(encryptedResult.success).toBe(true);
    if (!encryptedResult.success) return;

    expect(encryptedResult.value.ciphertext).toBeDefined();
    expect(encryptedResult.value.iv).toBeDefined();

    const decryptedResult = await decryptData(keyResult.value, encryptedResult.value);
    expect(decryptedResult.success).toBe(true);
    if (!decryptedResult.success) return;

    const decryptedText = new TextDecoder().decode(decryptedResult.value);
    expect(decryptedText).toBe(plaintext);
  });
});
