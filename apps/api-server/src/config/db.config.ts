import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI)

        console.log(
            `Database connected successfully : ${connection.host}`.blue
                .underline.bold
        )
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

connectDB()
