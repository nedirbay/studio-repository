import {
  AuthRepository,
  type AuthTokenResponse,
  type LoginPayload,
  type RegisterPayload,
  type ResetPasswordPayload,
  type VerifyOtpPayload,
} from './authRepository'

export interface TokenStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export class AuthService {
  constructor(
    private repo: AuthRepository = new AuthRepository(),
    private storage: TokenStorage = typeof localStorage !== 'undefined'
      ? localStorage
      : memoryStorage(),
  ) {}

  private persist(res: AuthTokenResponse) {
    if (res?.jwt) {
      this.storage.setItem(TOKEN_KEY, res.jwt)
      this.storage.setItem(USER_KEY, JSON.stringify(res.user))
    }
    return res
  }

  async login(payload: LoginPayload) {
    return this.persist(await this.repo.login(payload))
  }

  async googleLogin(credential: string) {
    return this.persist(await this.repo.googleLogin(credential))
  }

  async verifyOtp(payload: VerifyOtpPayload) {
    return this.persist(await this.repo.verifyOtp(payload))
  }

  register(payload: RegisterPayload) {
    return this.repo.register(payload)
  }

  resendOtp(email: string) {
    return this.repo.resendOtp(email)
  }

  forgotPassword(email: string) {
    return this.repo.forgotPassword(email)
  }

  resetPassword(payload: ResetPasswordPayload) {
    return this.repo.resetPassword(payload)
  }

  logout() {
    this.storage.removeItem(TOKEN_KEY)
    this.storage.removeItem(USER_KEY)
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(TOKEN_KEY)
  }

  currentUser<T = any>(): T | null {
    const raw = this.storage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
}

function memoryStorage(): TokenStorage {
  const map = new Map<string, string>()
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => { map.set(k, v) },
    removeItem: (k) => { map.delete(k) },
  }
}
