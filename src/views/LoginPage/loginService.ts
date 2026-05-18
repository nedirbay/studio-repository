import { AuthService } from './authService'
import { AuthRepository, type LoginPayload, type AuthTokenResponse } from './authRepository'

const authService = new AuthService()

export const loginService = {
  loginWithPassword(payload: LoginPayload): Promise<AuthTokenResponse> {
    return authService.login(payload)
  },
  loginWithGoogle(credential: string) {
    return authService.googleLogin(credential)
  },
  logout() {
    authService.logout()
  },
  isAuthenticated(): boolean {
    return authService.isAuthenticated()
  },
  currentUser<T = any>(): T | null {
    return authService.currentUser<T>()
  },
}

export { AuthService, AuthRepository }
