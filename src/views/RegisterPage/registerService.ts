import { AuthRepository, type RegisterPayload, type VerifyOtpPayload } from '../LoginPage/authRepository'

const auth = new AuthRepository()

export const registerService = {
  register(payload: RegisterPayload) {
    return auth.register(payload)
  },
  verifyOtp(payload: VerifyOtpPayload) {
    return auth.verifyOtp(payload)
  },
  resendOtp(email: string) {
    return auth.resendOtp(email)
  },
}
