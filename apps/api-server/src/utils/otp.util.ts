export const genOtp = () => {
    return Math.round(100001 + Math.random() * (999998 - 100001))
}
