import { AuthRepository, type ResetPasswordPayload } from '../LoginPage/authRepository'

const auth = new AuthRepository()

export const forgotPasswordService = {
  requestCode(email: string) {
    return auth.forgotPassword(email)
  },
  resetPassword(payload: ResetPasswordPayload) {
    return auth.resetPassword(payload)
  },
}
