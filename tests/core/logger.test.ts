import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../src/core/utils/logger';

describe('PII and Vector Scrubbing Logger', () => {
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redacts email addresses from log output', () => {
    logger.info('User john.doe@example.com logged in');
    expect(consoleInfoMock).toHaveBeenCalledWith(
      '[INFO] User [REDACTED_EMAIL] logged in'
    );
  });

  it('redacts raw Float32Array embedding vectors from logs', () => {
    const embedding = new Float32Array(192);
    embedding[0] = 0.55;
    embedding[1] = -0.42;

    logger.info('Generated embedding:', embedding);
    expect(consoleInfoMock).toHaveBeenCalledWith(
      '[INFO] Generated embedding:',
      '[REDACTED_VECTOR_LEN_192]'
    );
  });

  it('redacts sensitive object keys like password or tokens', () => {
    logger.error('Failed request', {
      user: 'alice',
      password: 'superSecret123!',
      apiKey: 'xyz-9988-secret',
    });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      '[ERROR] Failed request',
      expect.objectContaining({
        password: '[REDACTED_SENSITIVE]',
        apiKey: '[REDACTED_SENSITIVE]',
      })
    );
  });
});
