import jwt, { JwtPayload } from 'jsonwebtoken'
import expressAsyncHandler from 'express-async-handler'
import { User } from '../models/user.model'
import { Handler } from 'express'
import { validate } from './validate.middleware'
import { passwordVerifySchema } from '../validations/UserInputSchema'
import { Schema } from 'joi'

export const authGuard = expressAsyncHandler(async (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        res.status(401)
        throw new Error('No token provided')
    }

    const accessToken = token.split(' ')[1]

    if (!accessToken) {
        res.status(401)
        throw new Error('Invalid token')
    }

    try {
        const payload = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        ) as JwtPayload
        const user = await User.findById(payload._id)

        if (!user) {
            res.status(401)
            throw new Error('Invalid token')
        }

        if (!user.devices.find((d) => d.token === payload.tokenVersion)) {
            res.status(401)
            throw new Error('Invalid token')
        }

        req.user = user
        req.device = user.devices.find((d) => d.token === payload.tokenVersion)
        next()
    } catch (err) {
        res.status(401)
        throw new Error('Invalid token')
    }
})

export const verifyPassword: (schema?: Schema) => Handler =
    (schema) => (req, res, next) => {
        validate(schema ? schema : passwordVerifySchema)(req, res, () => {
            const { password } = req.body

            if (req.user!.comparePassword(password)) {
                return next()
            }

            res.status(401)
            throw new Error('Invalid password')
        })
    }
