import Joi = require('joi')

const usernameValidator: Joi.CustomValidator = (value, helpers) => {
    if (!/^[a-zA-Z0-9._]+$/.test(value)) {
        return helpers.error('any.custom', {
            message:
                'Username must contain only letters, numbers, periods, and underscores.',
        })
    }

    return value
}

const name = Joi.string().required()
const email = Joi.string().email().required()
const username = Joi.string()
    .required()
    .min(3)
    .max(50)
    .lowercase()
    .custom(usernameValidator)
const password = Joi.string().min(8).required()
const otp = Joi.number().required().min(100000).max(999999)

const identifierValidator: Joi.CustomValidator = (value, helpers) => {
    const result = email.validate(value)

    if (!result.error) {
        return result.value
    }

    const result2 = username.validate(value)

    if (!result2.error) {
        return result2.value
    }

    return helpers.error('any.custom', {
        message: 'Invalid username or email',
    })
}

export const registerSchema = Joi.object({
    name,
    email,
    username,
    password,
})

export const verifyEmailSchema = Joi.object({
    email,
    otp,
})

export const resetPasswordSchema = Joi.object({
    email,
    otp,
    password,
})

export const forgotPasswordSchema = Joi.object({
    email,
})

export const loginSchema = Joi.object({
    identifier: Joi.string().required().custom(identifierValidator),
    password,
})

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
})

export const passwordVerifySchema = Joi.object({
    password,
})

export const enableDisableMfaSchema = Joi.object({
    password,
    type: Joi.string().required().valid('emailOtp', 'authenticator'),
})

export const verifyMfaSchema = Joi.object({
    token: otp,
})

export const mfaValidateSchema = Joi.object({
    identifier: Joi.string().required().custom(identifierValidator),
    mfaType: Joi.string().required().valid('emailOtp', 'authenticator'),
    password,
    mfaCode: otp,
})

export const updateNameSchema = Joi.object({
    name,
})

export const updateUsernameSchema = Joi.object({
    username,
})

export const secondaryEmailSchema = Joi.object({
    email,
})

export const updatePasswordSchema = Joi.object({
    oldPassword: password,
    newPassword: password,
})

export const updateBioSchema = Joi.object({
    bio: Joi.string().max(500).allow(''),
})

export const verifySecondaryEmailSchema = Joi.object({
    otp,
})
