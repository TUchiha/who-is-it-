import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, mapResult, flatMapResult, matchResult } from '../../src/core/utils/result';

describe('Result utility', () => {
  it('creates ok results and validates them', () => {
    const res = ok(42);
    expect(res.success).toBe(true);
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
    if (isOk(res)) {
      expect(res.value).toBe(42);
    }
  });

  it('creates err results and validates them', () => {
    const res = err('Something failed');
    expect(res.success).toBe(false);
    expect(isOk(res)).toBe(false);
    expect(isErr(res)).toBe(true);
    if (isErr(res)) {
      expect(res.error).toBe('Something failed');
    }
  });

  it('maps ok values correctly', () => {
    const res = ok(10);
    const mapped = mapResult(res, (x) => x * 2);
    expect(isOk(mapped)).toBe(true);
    if (isOk(mapped)) {
      expect(mapped.value).toBe(20);
    }
  });

  it('bypasses mapping for err results', () => {
    const res = err('error');
    const mapped = mapResult(res, (x: number) => x * 2);
    expect(isErr(mapped)).toBe(true);
  });

  it('chains with flatMapResult correctly', () => {
    const res = ok(10);
    const flatMapped = flatMapResult(res, (x) => ok(`Val: ${x}`));
    expect(isOk(flatMapped)).toBe(true);
    if (isOk(flatMapped)) {
      expect(flatMapped.value).toBe('Val: 10');
    }
  });

  it('matches pattern branches correctly', () => {
    const resOk = ok('success');
    const outOk = matchResult(resOk, {
      onSuccess: (v) => `OK: ${v}`,
      onError: (e) => `ERR: ${e}`,
    });
    expect(outOk).toBe('OK: success');

    const resErr = err('failure');
    const outErr = matchResult(resErr, {
      onSuccess: (v) => `OK: ${v}`,
      onError: (e) => `ERR: ${e}`,
    });
    expect(outErr).toBe('ERR: failure');
  });
});
