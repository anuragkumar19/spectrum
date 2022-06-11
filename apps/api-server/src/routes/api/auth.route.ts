import { Router } from 'express'
import { authGuard, verifyPassword } from '../..//middlewares/auth.middleware'
import {
    disableMfa,
    enableMfa,
    forgotPassword,
    login,
    logout,
    mfaValidate,
    refreshToken,
    register,
    resetPassword,
    revokeAllTokens,
    revokeToken,
    sendMfaOtp,
    verifyEmail,
    verifyMfa,
} from '../../controllers/auth.controller'
import { validate } from '../../middlewares/validate.middleware'
import {
    enableDisableMfaSchema,
    forgotPasswordSchema,
    loginSchema,
    mfaValidateSchema,
    refreshTokenSchema,
    registerSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    verifyMfaSchema,
} from '../../validations/UserInputSchema'

export const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)
router.post('/login', validate(loginSchema), login)
router.post('/refresh', validate(refreshTokenSchema), refreshToken)
router.post('/mfa/send-otp', validate(loginSchema), sendMfaOtp)
router.post('/mfa/validate', validate(mfaValidateSchema), mfaValidate)

router.post('/logout', authGuard, logout)
router.post('/revoke', authGuard, verifyPassword(), revokeAllTokens)
router.post('/revoke/:id', authGuard, verifyPassword(), revokeToken)

router.post(
    '/mfa/enable',
    authGuard,
    verifyPassword(enableDisableMfaSchema),
    enableMfa
)
router.post(
    '/mfa/disable',
    authGuard,
    verifyPassword(enableDisableMfaSchema),
    disableMfa
)
router.post('/mfa/verify', authGuard, validate(verifyMfaSchema), verifyMfa)
