const appConfig ={
    PORT:process.env.PORT,
    DATABASE_URL:process.env.DATABASE_URL,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN:process.env.GOOGLE_REFRESH_TOKEN,
    USER_MAIL:process.env.EMAIL_USER,
    FRONTEND_URL:process.env.FRONTEND_URL,
    JWT_REFRESH_TOKEN:process.env.JWT_REFRESH_TOKEN,
    JWT_ACCESS_TOKEN:process.env.JWT_ACCESS_TOKEN,
    EMAIL_SECRET:process.env.JWT_EMAIL_SECRET
}
export default appConfig