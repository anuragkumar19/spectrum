import 'colors'
import cors from 'cors'
import compression from 'compression'
import 'dotenv-safe/config'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import './config/db.config'
import { __prod__ } from './constants'
import { errorHandler, notFound } from './middlewares/errors.middleware'
import { router } from './routes'

const app = express()

// Middleware
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(compression())

app.disable('x-powered-by')

// Logging
!__prod__ && app.use(morgan('dev'))

// Router
app.use(router)

// Not found handler
app.use(notFound)

// Error Handler
app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () =>
    console.log(
        `Server started in ${process.env.NODE_ENV} mode on PORT ${process.env.PORT}`
            .cyan.underline.bold
    )
)
