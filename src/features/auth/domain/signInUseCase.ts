import type { AuthRepository, SignInParams } from './authRepository';
import type { Result } from '../../../core/utils/result';
import type { AuthFailure } from '../../../core/errors/failure';
import type { UserSession } from './user';

export class SignInUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: SignInParams): Promise<Result<UserSession, AuthFailure>> {
    return this.authRepository.signIn(params);
  }
}
