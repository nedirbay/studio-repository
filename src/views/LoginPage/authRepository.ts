import { BaseRepository } from '../../utils/http'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  code: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  new_password: string
}

export interface AuthTokenResponse {
  jwt: string
  refresh: string
  user: any
}

export class AuthRepository extends BaseRepository {
  async login(payload: LoginPayload): Promise<AuthTokenResponse> {
    const res = await this.client.post('auth/login', payload)
    return res.data
  }

  async googleLogin(credential: string): Promise<AuthTokenResponse> {
    const res = await this.client.post('auth/google', { credential })
    return res.data
  }

  async register(payload: RegisterPayload) {
    const res = await this.client.post('auth/register', payload)
    return res.data
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthTokenResponse> {
    const res = await this.client.post('auth/verify-otp', payload)
    return res.data
  }

  async resendOtp(email: string) {
    const res = await this.client.post('auth/resend-otp', { email })
    return res.data
  }

  async forgotPassword(email: string) {
    const res = await this.client.post('auth/forgot-password', { email })
    return res.data
  }

  async resetPassword(payload: ResetPasswordPayload) {
    const res = await this.client.post('auth/reset-password', payload)
    return res.data
  }

  async me() {
    const res = await this.client.get('auth/me')
    return res.data
  }

  async changePassword(payload: { old_password: string; new_password: string }) {
    const res = await this.client.post('auth/change-password', payload)
    return res.data
  }
}
