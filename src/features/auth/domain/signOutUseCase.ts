import type { AuthRepository } from './authRepository';
import type { Result } from '../../../core/utils/result';
import type { AuthFailure } from '../../../core/errors/failure';

export class SignOutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Result<void, AuthFailure>> {
    return this.authRepository.signOut();
  }
}
