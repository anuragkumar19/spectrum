import { Router } from 'express'
import { UploadType } from '../../constants'
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
import { upload } from '../../middlewares/upload.middleware'
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

// Allow authenticated users only
router.use(authGuard)

router.get('/me', getLoggedInUser)
router.get('/devices', getLoggedInDevices)

router.put('/name', validate(updateNameSchema), updateName)
router.put('/username', validate(updateUsernameSchema), updateUsername)
router.put('/bio', validate(updateBioSchema), updateBio)
router.put('/password', validate(updatePasswordSchema), updatePassword)
router.put(
    '/avatar',
    upload(
        UploadType.IMAGE,
        'avatar',
        5 * 1024 * 1024, // 5MB
        false
    ),
    uploadAvatar
)
router.put('/email', verifyPassword(), makeSecondaryEmailPrimary)

router
    .route('/secondary-email')
    .post(validate(secondaryEmailSchema), addSecondaryEmail)
    .put(validate(secondaryEmailSchema), updateSecondaryEmail)
    .delete(removeSecondaryEmail)
router.post('/secondary-email/otp', getOtpForSecondaryEmail)
router.post(
    '/secondary-email/verify',
    validate(verifySecondaryEmailSchema),
    verifySecondaryEmail
)
