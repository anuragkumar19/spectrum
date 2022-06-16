import ejs from 'ejs'
import { createTransport } from 'nodemailer'
import path from 'path'
import { SendOtpType } from '../constants'

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
    type: SendOtpType
) => {
    const transporter = await getTransporter()

    const html = await ejs.renderFile(
        path.join(path.resolve(), 'views', 'emails', 'otp.ejs'),
        { otp, type }
    )

    let subject

    if (type === SendOtpType.VERIFY) {
        subject = 'Spectrum - Verify your account'
    }

    if (type === SendOtpType.RESET) {
        subject = 'Spectrum - Reset your password'
    }

    if (type === SendOtpType.MFA) {
        subject = 'Spectrum - OTP for MFA'
    }

    if (type === SendOtpType.VERIFY_SECONDARY_EMAIL) {
        subject = 'Spectrum - Verify your secondary email'
    }

    await transporter.sendMail({
        to: email,
        from: process.env.EMAIL,
        subject,
        html,
    })
}
