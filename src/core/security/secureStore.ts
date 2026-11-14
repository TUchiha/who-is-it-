import { Result, ok, err } from '../utils/result';
import type { CryptoFailure } from '../errors/failure';
import { generateMasterKey, encryptData, decryptData, EncryptedPayload } from './crypto';

const DB_NAME = 'who_is_it_secure_vault';
const DB_VERSION = 1;
const KEY_STORE = 'crypto_keys';
const DATA_STORE = 'encrypted_records';

const MASTER_KEY_ID = 'local_aes_master_key';
const LOCAL_TEMPLATE_ID = 'local_face_template';
const LOCAL_CREDENTIAL_ID = 'local_session_credential';

export interface LocalFaceTemplate {
  readonly modelVersion: string;
  readonly createdAt: string;
  readonly sampleCount: number;
  readonly encryptedEmbedding: EncryptedPayload;
}

export interface LocalSessionCredential {
  readonly encryptedToken: EncryptedPayload;
  readonly email: string;
  readonly userId: string;
  readonly updatedAt: string;
}

class SecureVaultDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(KEY_STORE)) {
            db.createObjectStore(KEY_STORE);
          }
          if (!db.objectStoreNames.contains(DATA_STORE)) {
            db.createObjectStore(DATA_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return this.dbPromise;
  }

  async getMasterKey(): Promise<Result<CryptoKey, CryptoFailure>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(KEY_STORE, 'readwrite');
        const store = tx.objectStore(KEY_STORE);
        const req = store.get(MASTER_KEY_ID);

        req.onsuccess = async () => {
          if (req.result && req.result instanceof CryptoKey) {
            resolve(ok(req.result));
          } else {
            const newKeyResult = await generateMasterKey();
            if (!newKeyResult.success) {
              resolve(newKeyResult);
              return;
            }
            const writeTx = db.transaction(KEY_STORE, 'readwrite');
            writeTx.objectStore(KEY_STORE).put(newKeyResult.value, MASTER_KEY_ID);
            writeTx.oncomplete = () => resolve(ok(newKeyResult.value));
            writeTx.onerror = () =>
              resolve(
                err({
                  type: 'CRYPTO_STORAGE_ERROR',
                  message: 'Failed to persist generated non-extractable master key',
                })
              );
          }
        };
        req.onerror = () =>
          resolve(
            err({
              type: 'CRYPTO_STORAGE_ERROR',
              message: 'Failed to query master key from IndexedDB',
            })
          );
      });
    } catch (e) {
      return err({
        type: 'CRYPTO_STORAGE_ERROR',
        message: e instanceof Error ? e.message : 'IndexedDB unavailable',
      });
    }
  }

  async saveLocalFaceTemplate(
    embedding: Float32Array,
    modelVersion: string,
    sampleCount: number
  ): Promise<Result<void, CryptoFailure>> {
    const keyResult = await this.getMasterKey();
    if (!keyResult.success) return keyResult;

    // Convert Float32Array into byte buffer
    const embeddingBytes = new Uint8Array(
      embedding.buffer,
      embedding.byteOffset,
      embedding.byteLength
    );

    const encryptResult = await encryptData(keyResult.value, embeddingBytes);
    if (!encryptResult.success) return encryptResult;

    const record: LocalFaceTemplate = {
      modelVersion,
      createdAt: new Date().toISOString(),
      sampleCount,
      encryptedEmbedding: encryptResult.value,
    };

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(DATA_STORE, 'readwrite');
        tx.objectStore(DATA_STORE).put(record, LOCAL_TEMPLATE_ID);
        tx.oncomplete = () => resolve(ok(undefined));
        tx.onerror = () =>
          resolve(
            err({
              type: 'CRYPTO_STORAGE_ERROR',
              message: 'Failed to write face template to encrypted storage',
            })
          );
      });
    } catch (e) {
      return err({
        type: 'CRYPTO_STORAGE_ERROR',
        message: e instanceof Error ? e.message : 'Failed accessing IndexedDB',
      });
    }
  }

  async getLocalFaceTemplate(): Promise<
    Result<{ embedding: Float32Array; modelVersion: string; createdAt: string } | null, CryptoFailure>
  > {
    try {
      const db = await this.getDB();
      const rawRecord = await new Promise<LocalFaceTemplate | undefined>((resolve, reject) => {
        const tx = db.transaction(DATA_STORE, 'readonly');
        const req = tx.objectStore(DATA_STORE).get(LOCAL_TEMPLATE_ID);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (!rawRecord) {
        return ok(null);
      }

      const keyResult = await this.getMasterKey();
      if (!keyResult.success) return keyResult;

      const decryptResult = await decryptData(
        keyResult.value,
        rawRecord.encryptedEmbedding
      );
      if (!decryptResult.success) return decryptResult;

      const floatArray = new Float32Array(
        decryptResult.value.buffer,
        decryptResult.value.byteOffset,
        decryptResult.value.byteLength / 4
      );

      return ok({
        embedding: floatArray,
        modelVersion: rawRecord.modelVersion,
        createdAt: rawRecord.createdAt,
      });
    } catch (e) {
      return err({
        type: 'CRYPTO_STORAGE_ERROR',
        message: e instanceof Error ? e.message : 'Error reading face template',
      });
    }
  }

  async saveLocalSessionCredential(
    userId: string,
    email: string,
    sessionToken: string
  ): Promise<Result<void, CryptoFailure>> {
    const keyResult = await this.getMasterKey();
    if (!keyResult.success) return keyResult;

    const encryptResult = await encryptData(keyResult.value, sessionToken);
    if (!encryptResult.success) return encryptResult;

    const record: LocalSessionCredential = {
      userId,
      email,
      encryptedToken: encryptResult.value,
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(DATA_STORE, 'readwrite');
        tx.objectStore(DATA_STORE).put(record, LOCAL_CREDENTIAL_ID);
        tx.oncomplete = () => resolve(ok(undefined));
        tx.onerror = () =>
          resolve(
            err({
              type: 'CRYPTO_STORAGE_ERROR',
              message: 'Failed to write session credential to storage',
            })
          );
      });
    } catch (e) {
      return err({
        type: 'CRYPTO_STORAGE_ERROR',
        message: e instanceof Error ? e.message : 'IndexedDB transaction error',
      });
    }
  }

  async getLocalSessionCredential(): Promise<
    Result<{ userId: string; email: string; sessionToken: string } | null, CryptoFailure>
  > {
    try {
      const db = await this.getDB();
      const rawRecord = await new Promise<LocalSessionCredential | undefined>((resolve, reject) => {
        const tx = db.transaction(DATA_STORE, 'readonly');
        const req = tx.objectStore(DATA_STORE).get(LOCAL_CREDENTIAL_ID);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (!rawRecord) {
        return ok(null);
      }

      const keyResult = await this.getMasterKey();
      if (!keyResult.success) return keyResult;

      const decryptResult = await decryptData(
        keyResult.value,
        rawRecord.encryptedToken
      );
      if (!decryptResult.success) return decryptResult;

      const tokenString = new TextDecoder().decode(decryptResult.value);
      return ok({
        userId: rawRecord.userId,
        email: rawRecord.email,
        sessionToken: tokenString,
      });
    } catch (e) {
      return err({
        type: 'CRYPTO_STORAGE_ERROR',
        message: e instanceof Error ? e.message : 'Error reading credential',
      });
    }
  }

  async deleteBiometricData(): Promise<Result<void, CryptoFailure>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(DATA_STORE, 'readwrite');
        tx.objectStore(DATA_STORE).delete(LOCAL_TEMPLATE_ID);
        tx.objectStore(DATA_STORE).delete(LOCAL_CREDENTIAL_ID);
        tx.oncomplete = () => resolve(ok(undefined));
        tx.onerror = () =>
          resolve(
            err({
              type: 'CRYPTO_STORAGE_ERROR',
              message: 'Failed to delete local biometric template',
            })
          );
      });
    } catch (e) {
      return err({
        type: 'CRYPTO_STORAGE_ERROR',
        message: e instanceof Error ? e.message : 'IndexedDB error during deletion',
      });
    }
  }
}

export const secureStore = new SecureVaultDatabase();
