import {Router} from "express";
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const authRoute= Router();

authRoute.post("/register",authController.userRegister);
authRoute.post("/verify-email",authController.verifyEmail);
authRoute.post("/resend-verification-email",authController.resendVerificationEmail);
authRoute.post("/refresh-token",authController.refreshToken);
authRoute.post("/login",authController.userLogin);
authRoute.post("/logout",authController.userLogout);


export default authRoute;