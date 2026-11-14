/**
 * PII and Biometric Vector Scrubbing Logger.
 * Strictly enforces Design Rule 9: "No embeddings, tokens, or PII in logs, analytics, or error reports."
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi;
const PASSWORD_KEY_REGEX = /password|secret|token|apiKey|authorization|privateKey/i;

function scrubValue(val: unknown): unknown {
  if (val === null || val === undefined) {
    return val;
  }

  // Float32Array or numeric array representing facial embedding vectors
  if (val instanceof Float32Array || (Array.isArray(val) && val.length >= 64 && typeof val[0] === 'number')) {
    return `[REDACTED_VECTOR_LEN_${val.length}]`;
  }

  if (typeof val === 'string') {
    return val
      .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
      .replace(BEARER_REGEX, 'Bearer [REDACTED_TOKEN]');
  }

  if (Array.isArray(val)) {
    return val.map((item) => scrubValue(item));
  }

  if (typeof val === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (PASSWORD_KEY_REGEX.test(k)) {
        sanitizedObj[k] = '[REDACTED_SENSITIVE]';
      } else {
        sanitizedObj[k] = scrubValue(v);
      }
    }
    return sanitizedObj;
  }

  return val;
}

export const logger = {
  debug(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${scrubValue(message)}`, ...args.map(scrubValue));
    }
  },

  info(message: string, ...args: unknown[]): void {
    console.info(`[INFO] ${scrubValue(message)}`, ...args.map(scrubValue));
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${scrubValue(message)}`, ...args.map(scrubValue));
  },

  error(message: string, error?: unknown, ...args: unknown[]): void {
    const scrubbedError = error instanceof Error
      ? { name: error.name, message: scrubValue(error.message) }
      : scrubValue(error);
    console.error(`[ERROR] ${scrubValue(message)}`, scrubbedError, ...args.map(scrubValue));
  },
};
