import crypto from 'crypto'
import expressAsyncHandler from 'express-async-handler'
import { lookup } from 'geoip-lite'
import jwt, { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'
import QRcode from 'qrcode'
import speakeasy from 'speakeasy'
import parser from 'ua-parser-js'
import { SendOtpType } from '../constants'
import { UserDeviceDocument } from '../interfaces/mongoose.gen'
import { User } from '../models/user.model'
import { sendOtp } from '../utils/email.util'
import { genOtp } from '../utils/otp.util'

export const register = expressAsyncHandler(async (req, res) => {
    const { email, name, username, password } = req.body

    let user = await User.findOne({ email })

    if (user && user.isEmailVerified) {
        res.status(400)
        throw new Error('User already exists with the email')
    }

    const checkUsername = await User.findOne({ username })

    if (checkUsername && user?.username !== username) {
        res.status(400)
        throw new Error('Username already taken')
    }

    const otp = genOtp()

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    const otpExpiry = Date.now() + 5 * 60 * 1000 // 5 minutes

    if (!user) {
        user = new User({
            name,
            username,
            email,
            password,
            otp: hashedOtp,
            otpExpiry,
        })
    } else {
        user.name = name
        user.email = email
        user.username = username
        user.password = password
        user.otp = hashedOtp
        user.otpExpiry = otpExpiry
    }

    await user.save()
    await sendOtp(email, otp, SendOtpType.VERIFY)

    res.status(200).json({
        message: 'Otp sent to you email!',
    })
})

export const verifyEmail = expressAsyncHandler(async (req, res) => {
    const { email, otp } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        res.status(400)
        throw new Error('User not found')
    }

    if (user.isEmailVerified) {
        res.status(400)
        throw new Error('User already verified')
    }

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    if (user.otp !== hashedOtp) {
        res.status(400)
        throw new Error('Otp is incorrect')
    }

    if (Date.now() > user.otpExpiry!) {
        res.status(400)
        throw new Error('Otp has expired')
    }

    user.isEmailVerified = true
    user.otp = undefined
    user.otpExpiry = undefined

    await user.save()

    res.status(200).json({
        message: 'Email verified successfully',
    })
})

export const forgotPassword = expressAsyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        res.status(400)
        throw new Error('User not found')
    }

    if (!user.isEmailVerified) {
        res.status(400)
        throw new Error('Email is not verified')
    }

    const otp = genOtp()

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    const otpExpiry = Date.now() + 5 * 60 * 1000 // 5 minutes

    user.otp = hashedOtp
    user.otpExpiry = otpExpiry

    await user.save()

    await sendOtp(email, otp, SendOtpType.RESET)

    res.status(200).json({
        message: 'Otp sent to you email!',
    })
})

export const resetPassword = expressAsyncHandler(async (req, res) => {
    const { email, otp, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        res.status(400)
        throw new Error('User not found')
    }

    if (!user.isEmailVerified) {
        res.status(400)
        throw new Error('Email is not verified')
    }

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    if (!user.otp || !user.otpExpiry) {
        res.status(400)
        throw new Error('Otp expired')
    }

    if (user.otp !== hashedOtp) {
        res.status(400)
        throw new Error('Otp is incorrect')
    }

    if (Date.now() > user.otpExpiry!) {
        res.status(400)
        throw new Error('Otp has expired')
    }

    user.password = password
    user.otp = undefined
    user.otpExpiry = undefined

    await user.save()

    res.status(200).json({
        message: 'Password reset successfully',
    })
})

export const login = expressAsyncHandler(async (req, res) => {
    const { identifier, password } = req.body

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    })

    if (!user) {
        res.status(400)
        throw new Error('Invalid credentials')
    }

    if (!user.isEmailVerified) {
        res.status(400)
        throw new Error('Email is not verified')
    }

    if (!user.comparePassword(password)) {
        res.status(400)
        throw new Error('Invalid credentials')
    }

    if (user.mfaTypes.length > 0) {
        res.status(200).json({
            mfaEnabled: true,
            message: 'Mfa required',
            mfaTypes: user.mfaTypes,
        })

        return
    }

    const tokenVersion = user.tokenVersion + 1

    const tokens = {
        refreshToken: jwt.sign(
            {
                _id: user._id,
                type: 'refresh',
                tokenVersion,
            },
            process.env.REFRESH_TOKEN_SECRET
        ),

        accessToken: jwt.sign(
            {
                _id: user._id,
                type: 'access',
                tokenVersion,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10m' }
        ), // 10 minutes
    }

    user.tokenVersion = tokenVersion

    const clientInfo = parser(req.headers['user-agent'])

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const geo = lookup(ip as string)

    user.devices.push({
        geo,
        ip,
        clientInfo,
        token: tokenVersion,
    })

    await user.save()

    res.status(200).json({
        tokens,
    })
})

export const mfaValidate = expressAsyncHandler(async (req, res) => {
    const { identifier, password, mfaType, mfaCode } = req.body

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    })

    if (!user) {
        res.status(400)
        throw new Error('Invalid credentials')
    }

    if (!user.isEmailVerified) {
        res.status(400)
        throw new Error('Email is not verified')
    }

    if (!user.comparePassword(password)) {
        res.status(400)
        throw new Error('Invalid credentials')
    }

    if (user.mfaTypes.length === 0) {
        res.status(400)
        throw new Error('Mfa is not enabled')
    }

    if (!user.mfaTypes.includes(mfaType)) {
        res.status(400)
        throw new Error('Mfa type is not enabled')
    }

    if (mfaType === 'emailOtp') {
        const hashedOtp = crypto
            .createHash('sha256')
            .update(mfaCode.toString())
            .digest('hex')

        if (user.mfaOtp !== hashedOtp) {
            res.status(400)
            throw new Error('Otp is incorrect')
        }

        if (Date.now() > user.mfaOtpExpiry!) {
            res.status(400)
            throw new Error('Otp has expired')
        }

        user.mfaOtp = undefined
        user.mfaOtpExpiry = undefined

        await user.save()
    }

    if (mfaType === 'authenticator') {
        const codeValidated = await speakeasy.totp.verify({
            secret: user.mfaSecret.base32,
            encoding: 'base32',
            token: mfaCode,
            window: 1,
        })

        if (!codeValidated) {
            res.status(400)
            throw new Error('Otp is incorrect')
        }
    }

    const tokenVersion = user.tokenVersion + 1

    const tokens = {
        refreshToken: jwt.sign(
            {
                _id: user._id,
                type: 'refresh',
                tokenVersion,
            },
            process.env.REFRESH_TOKEN_SECRET
        ),

        accessToken: jwt.sign(
            {
                _id: user._id,
                type: 'access',
                tokenVersion,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10m' }
        ), // 10 minutes
    }

    user.tokenVersion = tokenVersion

    const clientInfo = parser(req.headers['user-agent'])

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const geo = lookup(ip as string)

    user.devices.push({
        geo,
        ip,
        clientInfo,
        token: tokenVersion,
    })

    await user.save()

    res.status(200).json({
        tokens,
    })
})

export const sendMfaOtp = expressAsyncHandler(async (req, res) => {
    const { identifier, password } = req.body

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    })

    if (!user) {
        res.status(400)
        throw new Error('Invalid credentials')
    }

    if (!user.isEmailVerified) {
        res.status(400)
        throw new Error('Email is not verified')
    }

    if (!user.comparePassword(password)) {
        res.status(400)
        throw new Error('Invalid credentials')
    }

    if (user.mfaTypes.length === 0) {
        res.status(400)
        throw new Error('Mfa is not enabled')
    }

    if (!user.mfaTypes.includes('emailOtp')) {
        res.status(400)
        throw new Error('Mfa type is not enabled')
    }

    const otp = genOtp()

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    user.mfaOtp = hashedOtp
    user.mfaOtpExpiry = Date.now() + 1000 * 60 * 5 // 5 minutes

    await user.save()

    await sendOtp(user.email, otp, SendOtpType.MFA)

    res.status(200).json({
        message: 'Otp sent',
    })
})

export const refreshToken = expressAsyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    try {
        const payload = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        ) as JwtPayload

        if (payload.type !== 'refresh') {
            res.status(401)
            throw new Error('Invalid refresh token')
        }

        const user = await User.findById(payload._id)

        if (!user) {
            res.status(401)
            throw new Error('Invalid refresh token')
        }

        if (!user.devices.find((d) => d.token === payload.tokenVersion)) {
            res.status(401)
            throw new Error('Invalid refresh token')
        }

        const accessToken = user.generateAccessToken(payload.tokenVersion)

        res.status(200).json({
            tokens: {
                accessToken,
            },
        })
    } catch (err) {
        res.status(401)
        throw new Error('Invalid refresh token')
    }
})

export const logout = expressAsyncHandler(async (req, res) => {
    const user = req.user!
    const device = req.device!

    user.devices = user.devices.filter(
        (d) => d.token !== device.token
    ) as mongoose.Types.DocumentArray<UserDeviceDocument>

    await user.save()

    res.status(200).json({
        message: 'Logged out successfully',
    })
})

export const revokeAllTokens = expressAsyncHandler(async (req, res) => {
    const user = req.user!

    user.devices = [] as any as mongoose.Types.DocumentArray<UserDeviceDocument>

    await user.save()

    res.status(200).json({
        message:
            'All tokens revoked successfully. You will be logged out. Please login again',
    })
})

export const revokeToken = expressAsyncHandler(async (req, res) => {
    const user = req.user!

    const id = req.params.id

    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        throw new Error('Device not found')
    }

    user.devices = user.devices.filter(
        (d) => !d._id.equals(id)
    ) as any as mongoose.Types.DocumentArray<UserDeviceDocument>

    await user.save()

    res.status(200).json({
        message: 'Token revoked successfully',
    })
})

export const enableMfa = expressAsyncHandler(async (req, res) => {
    const user = req.user!
    const { type } = req.body

    if (user.mfaTypes.includes(type)) {
        res.status(400)
        throw new Error(`Mfa with ${type} already enabled`)
    }

    if (type === 'emailOtp') {
        user.mfaTypes.push('emailOtp')

        await user.save()

        res.status(200).json({
            message: 'Email OTP enabled successfully',
        })

        return
    }

    if (type === 'authenticator') {
        const mfaTempSecret = speakeasy.generateSecret({
            issuer: 'Spectrum',
            name: user.name,
        })

        user.mfaTempSecret = mfaTempSecret

        await user.save()

        const secret = mfaTempSecret.base32

        const otpAuthUrl = mfaTempSecret.otpauth_url!
        const qrCode = await QRcode.toDataURL(otpAuthUrl)

        res.status(200).json({
            secret,
            otpAuthUrl,
            qrCode,
        })

        return
    }

    res.status(400)
    throw new Error('Invalid MFA type')
})

export const verifyMfa = expressAsyncHandler(async (req, res) => {
    const user = req.user!

    const { token } = req.body

    if (!user.mfaTempSecret) {
        res.status(400)
        throw new Error('MFA is not enabled')
    }

    if (user.mfaTypes.includes('authenticator')) {
        res.status(400)
        throw new Error('MFA is already enabled')
    }

    const verified = speakeasy.totp.verify({
        secret: user.mfaTempSecret.base32,
        encoding: 'base32',
        token,
    })

    if (!verified) {
        res.status(400)
        throw new Error('Invalid OTP')
    }

    user.mfaSecret = user.mfaTempSecret
    user.mfaTempSecret = undefined
    user.mfaTypes.push('authenticator')

    await user.save()

    res.status(200).json({
        message: 'MFA verified successfully',
    })
})

export const disableMfa = expressAsyncHandler(async (req, res) => {
    const user = req.user!
    const { type } = req.body

    if (!user.mfaTypes.includes(type)) {
        res.status(400)
        throw new Error(`Mfa with ${type} not enabled`)
    }

    if (type === 'emailOtp') {
        user.mfaTypes = user.mfaTypes.filter(
            (t) => t !== 'emailOtp'
        ) as mongoose.Types.Array<'emailOtp' | 'authenticator'>

        await user.save()

        res.status(200).json({
            message: 'Email OTP disabled successfully',
        })

        return
    }

    if (type === 'authenticator') {
        user.mfaTypes = user.mfaTypes.filter(
            (t) => t !== 'authenticator'
        ) as mongoose.Types.Array<'emailOtp' | 'authenticator'>
        user.mfaSecret = undefined

        await user.save()

        res.status(200).json({
            message: 'Authenticator disabled successfully',
        })

        return
    }

    res.status(400)
    throw new Error('Invalid MFA type')
})
