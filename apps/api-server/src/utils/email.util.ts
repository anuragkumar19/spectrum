import ejs from 'ejs'
import { createTransport } from 'nodemailer'
import path from 'path'
import { __prod__ } from '../constants'

async function getTransporter() {
    let options = {
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    }

    return createTransport(options)
}

export const sendOtp = async (
    email: string,
    otp: number,
    type: 'verify' | 'reset' | 'mfa' | 'verify-secondary-email'
) => {
    const transporter = await getTransporter()

    const html = await ejs.renderFile(
        path.join(
            path.resolve(),
            'apps',
            'api-server',
            'views',
            'emails',
            'otp.ejs'
        ),
        { otp, type }
    )

    let subject

    if (type === 'verify') {
        subject = 'Spectrum - Verify your account'
    }

    if (type === 'reset') {
        subject = 'Spectrum - Reset your password'
    }

    if (type === 'mfa') {
        subject = 'Spectrum - OTP for MFA'
    }

    if (type === 'verify-secondary-email') {
        subject = 'Spectrum - Verify your secondary email'
    }

    await transporter.sendMail({
        to: email,
        from: process.env.EMAIL,
        subject,
        html,
    })
}
