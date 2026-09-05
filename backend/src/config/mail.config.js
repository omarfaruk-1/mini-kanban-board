import nodemailer from "nodemailer";
import appConfig from "./appConfig.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user:appConfig.USER_MAIL,
    clientId:appConfig.GOOGLE_CLIENT_ID,
    clientSecret:appConfig.GOOGLE_CLIENT_SECRET,
    refreshToken:appConfig.GOOGLE_REFRESH_TOKEN,
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to mail server: ", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export default transporter;