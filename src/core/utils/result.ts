/**
 * Pure TypeScript Result<T, E> functional error handling pattern.
 * Eliminates unhandled exceptions and enforces explicit failure handling.
 */

export type Ok<T> = {
  readonly success: true;
  readonly value: T;
};

export type Err<E> = {
  readonly success: false;
  readonly error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({
  success: true,
  value,
});

export const err = <E>(error: E): Err<E> => ({
  success: false,
  error,
});

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.success;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.success;

export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (val: T) => U
): Result<U, E> => {
  if (result.success) {
    return ok(fn(result.value));
  }
  return result;
};

export const flatMapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (val: T) => Result<U, E>
): Result<U, E> => {
  if (result.success) {
    return fn(result.value);
  }
  return result;
};

export const matchResult = <T, E, R>(
  result: Result<T, E>,
  patterns: {
    onSuccess: (value: T) => R;
    onError: (error: E) => R;
  }
): R => {
  if (result.success) {
    return patterns.onSuccess(result.value);
  }
  return patterns.onError(result.error);
};
