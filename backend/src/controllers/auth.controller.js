import prisma from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import appConfig from "../config/appConfig.js";
import sendMail from "../services/sendMail.service.js";
import appError from "../errors/appError.js";
import registrationTemplate from "../templates/registation.template.js";


async function userRegister(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return next(new appError("All fields are required", 400));
        }

        const existUser = await prisma.user.findUnique({
            where: {
                email: email.trim()
            }
        });

        if (existUser) {
            return next(new appError("User already exists", 409));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim(),
                password: hashedPassword
            }
        });

        const emailToken = jwt.sign(
            { userId: user.id },
            appConfig.EMAIL_SECRET,
            { expiresIn: "20m" }
        );

        const verificationUrl =
            `${appConfig.FRONTEND_URL}/verify-email?token=${emailToken}`;

        await sendMail(
            user.email,
            "Please verify your email for login",
            registrationTemplate(user.name, verificationUrl)
        );

        return res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified
                }
            }
        });

    } catch (error) {
        next(error);
    }
}


async function verifyEmail(req, res, next) {
    try {
        const { token } = req.query;

        if (!token) {
            return next(new appError("Token is required", 400));
        }

        const decoded = jwt.verify(
            token,
            appConfig.EMAIL_SECRET
        );

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        });

        if (!user) {
            return next(new appError("Invalid token", 400));
        }

        if (user.isVerified) {
            return res.status(200).json({
                status: "success",
                message: "Email is already verified"
            });
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isVerified: true
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Email verified successfully"
        });

    } catch (error) {
        next(error);
    }
}


async function resendVerificationEmail(req, res, next) {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new appError("Email is required", 400));
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email.trim()
            }
        });

        if (!user) {
            return next(new appError("User not found", 404));
        }

        if (user.isVerified) {
            return next(
                new appError("Email is already verified", 400)
            );
        }

        const emailToken = jwt.sign(
            { userId: user.id },
            appConfig.EMAIL_SECRET,
            { expiresIn: "20m" }
        );

        const verificationUrl =
            `${appConfig.FRONTEND_URL}/verify-email?token=${emailToken}`;

        await sendMail(
            user.email,
            "Please verify your email for login",
            registrationTemplate(user.name, verificationUrl)
        );

        return res.status(200).json({
            status: "success",
            message: "Verification email sent successfully"
        });

    } catch (error) {
        next(error);
    }
}


async function userLogin(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new appError("All fields are required", 400));
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email.trim()
            }
        });

        if (!user) {
            return next(new appError("Invalid credentials", 401));
        }

        if (!user.isVerified) {
            return next(
                new appError("Email is not verified", 403)
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return next(new appError("Invalid credentials", 401));
        }

        // Create refresh token
        const refreshToken = jwt.sign(
            { userId: user.id },
            appConfig.JWT_REFRESH_TOKEN,
            { expiresIn: "7d" }
        );

        // Hash refresh token before storing in DB
        const hashedRefreshToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        // Create session
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                refreshTokenHash: hashedRefreshToken,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"] || "Unknown"
            }
        });

        // Create access token
        const accessToken = jwt.sign(
            { userId: user.id, sessionId: session.id },
            appConfig.JWT_ACCESS_TOKEN,
            { expiresIn: "15m" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            status: "success",
            data: {
                accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        });

    } catch (error) {
        next(error);
    }
}


async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return next(
                new appError("Refresh token is required", 401)
            );
        }

        const decoded = jwt.verify(
            refreshToken,
            appConfig.JWT_REFRESH_TOKEN
        );

        const hashedRefreshToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await prisma.session.findUnique({
            where: {
                refreshTokenHash: hashedRefreshToken
            }
        });

        if (!session || session.revoked) {
            return next(
                new appError("Invalid or revoked session", 401)
            );
        }

        if (session.userId !== decoded.userId) {
            return next(
                new appError("Invalid session", 401)
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        });

        if (!user) {
            return next(new appError("User not found", 401));
        }

        // New access token
        const accessToken = jwt.sign(
            { userId: user.id },
            appConfig.JWT_ACCESS_TOKEN,
            { expiresIn: "15m" }
        );

        // Rotate refresh token
        const newRefreshToken = jwt.sign(
            { userId: user.id },
            appConfig.JWT_REFRESH_TOKEN,
            { expiresIn: "7d" }
        );

        const newHashedRefreshToken = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        await prisma.session.update({
            where: {
                id: session.id
            },
            data: {
                refreshTokenHash: newHashedRefreshToken
            }
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            status: "success",
            data: {
                accessToken
            }
        });

    } catch (error) {
        next(error);
    }
}


async function userLogout(req, res, next) {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return next(
                new appError("Refresh token is required", 401)
            );
        }

        jwt.verify(
            refreshToken,
            appConfig.JWT_REFRESH_TOKEN
        );

        const hashedRefreshToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await prisma.session.findUnique({
            where: {
                refreshTokenHash: hashedRefreshToken
            }
        });

        if (!session) {
            return next(new appError("Session not found", 404));
        }

        await prisma.session.update({
            where: {
                id: session.id
            },
            data: {
                revoked: true
            }
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            status: "success",
            message: "User logged out successfully"
        });

    } catch (error) {
        next(error);
    }
}


export default {
    userRegister,
    verifyEmail,
    resendVerificationEmail,
    userLogin,
    userLogout,
    refreshToken
};