import type { AuthRepository, SignUpParams } from './authRepository';
import type { Result } from '../../../core/utils/result';
import type { AuthFailure } from '../../../core/errors/failure';
import type { AuthUser } from './user';

export class SignUpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: SignUpParams): Promise<Result<AuthUser, AuthFailure>> {
    return this.authRepository.signUp(params);
  }
}
