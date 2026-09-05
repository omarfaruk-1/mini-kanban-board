import nodemailer from "nodemailer";
import transporter from "../config/mail.config.js";
import appConfig from "../config/appConfig.js";


const sendMail = async function(to,subject,html){
    try {
        const info = await transporter.sendMail({
            from: `Mini Kanban Board ${appConfig.USER_MAIL}`,
            to,
            subject,
            html
        })
        console.log("Message sent: %s",info.messageId);
        console.log("Preview URL: %s",nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}

export default sendMail;