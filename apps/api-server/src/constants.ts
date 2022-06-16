export const __prod__ = process.env.NODE_ENV === 'production'
export enum SendOtpType {
    VERIFY = 'verify',
    RESET = 'reset',
    MFA = 'mfa',
    VERIFY_SECONDARY_EMAIL = 'verify-secondary-email',
}
export enum UploadType {
    IMAGE = 'image',
    VIDEO = 'video',
    ANY = 'any',
}
