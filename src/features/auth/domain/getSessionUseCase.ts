import type { AuthRepository } from './authRepository';
import type { Result } from '../../../core/utils/result';
import type { AuthFailure } from '../../../core/errors/failure';
import type { UserSession } from './user';

export class GetSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Result<UserSession | null, AuthFailure>> {
    return this.authRepository.getCurrentSession();
  }
}
