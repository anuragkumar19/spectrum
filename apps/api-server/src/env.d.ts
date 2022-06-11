declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: string;
      MONGO_URI: string;
      DEFAULT_AVATAR: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_SECRET: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      EMAIL: string;
      EMAIL_PASSWORD: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      UPLOAD_FOLDER: string;
    }
  }
}

export {}
