import { Router } from 'express'
import { upload } from '../../middlewares/upload.middleware'
import {
    addSecondaryEmail,
    getLoggedInDevices,
    getLoggedInUser,
    getOtpForSecondaryEmail,
    makeSecondaryEmailPrimary,
    removeSecondaryEmail,
    updateBio,
    updateName,
    updatePassword,
    updateSecondaryEmail,
    updateUsername,
    uploadAvatar,
    verifySecondaryEmail,
} from '../../controllers/user.controller'
import { authGuard, verifyPassword } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import {
    secondaryEmailSchema,
    updateBioSchema,
    updateNameSchema,
    updatePasswordSchema,
    updateUsernameSchema,
    verifySecondaryEmailSchema,
} from '../../validations/UserInputSchema'

export const router = Router()

router.use(authGuard)

router.get('/me', getLoggedInUser)
router.get('/devices', getLoggedInDevices)

router.put('/name', validate(updateNameSchema), updateName)
router.put('/username', validate(updateUsernameSchema), updateUsername)
router.put('/bio', validate(updateBioSchema), updateBio)
router.put('/password', validate(updatePasswordSchema), updatePassword)
router.put('/email', verifyPassword(), makeSecondaryEmailPrimary)

router.post(
    '/secondary-email',
    validate(secondaryEmailSchema),
    addSecondaryEmail
)
router.put(
    '/secondary-email',
    validate(secondaryEmailSchema),
    updateSecondaryEmail
)
router.delete('/secondary-email', removeSecondaryEmail)
router.post('/secondary-email/otp', getOtpForSecondaryEmail)
router.post(
    '/secondary-email/verify',
    validate(verifySecondaryEmailSchema),
    verifySecondaryEmail
)

router.put(
    '/avatar',
    upload('image', 'avatar', 5 * 1024 * 1024, false),
    uploadAvatar
)
