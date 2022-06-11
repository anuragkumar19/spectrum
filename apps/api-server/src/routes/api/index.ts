import { Router } from 'express'
import { router as authRouter } from './auth.route'
import { router as userRouter } from './user.route'

export const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)

// API test route
router.get('/', (_req, res) =>
    res.status(200).json({ message: 'API is running.' })
)
