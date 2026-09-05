import prisma from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import appConfig from "../config/appConfig.js";
import sendMail from "../services/sendMail.service.js";
import appError from "../errors/appError.js";
import registrationTemplate from "../templates/registation.template.js";
import crypto from "node:crypto";


async function userRegister (req,res,next){
    try {
        const {name,email,password}=req.body;
        if(!name || !email || !password) return next(new appError("All fields are required",4000));

        const existUser = await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(existUser) return next(new appError("User already exists",4000));

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data:{  
                name:name,
                email:email,
                password:hashedPassword
            }
        });

        const emailToken= jwt.sign({id:user.id},appConfig.EMAIL_SECRET,{expiresIn:"20m"});
        const url = `${appConfig.FRONTEND_URL}/api/v1/auth/verify-email/${emailToken}`;
        await sendMail(user.email,"Please verify your email for login", registrationTemplate(user.name, url))

        return res.status(201).json({
            status:"success",
            data:user
        })

    } catch (error) {
        next(error)
    }
}

async function verifyEmail(req,res,next){
    try {
        const {token}=req.query;
        if(!token) return next(new appError("Token is required",4000)); 
        
        const decoded = jwt.verify(token,appConfig.EMAIL_SECRET);
        const user = await prisma.user.findUnique({
            where:{
                id:decoded.id
            }
        });
        if(!user) return next(new appError("Invalid token",4000));

        await prisma.user.update({
            where:{
                id:user.id
            },
            data:{
                isVerified:true
            }
        });

        return res.status(200).json({
            status:"success",
            message:"Email verified successfully"
        });

    } catch (error) {
        next(error)
    }
}

async function resendVerificationEmail(req,res,next){

    try {
        const {email}=req.body;
        if(!email) return next(new appError("Email is required",4000));
        const user = await prisma.user.findUnique({
            where:{
                email:email
            }
        });
        if(!user) return next(new appError("User not found",4000));
        if(user.isVerified) return next(new appError("Email is already verified",4000));

        const emailToken= jwt.sign({id:user.id},appConfig.EMAIL_SECRET,{expiresIn:"20m"});
        const url = `${appConfig.FRONTEND_URL}/api/v1/auth/verify-email/${emailToken}`;
        await sendMail(user.email,"Please verify your email for login", registrationTemplate(user.name, url))

        return res.status(200).json({
            status:"success",
            message:"Verification email sent successfully"
        });
    
    } catch (error) {
        next(error)
    }
}
        
async function userLogin(req,res,next){
    try {
        const {email,password}=req.body;
        if(!email || !password) return next(new appError("All fields are required",4000));

        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid) return next(new appError("Invalid credentials",4000));

        const user = await prisma.user.findUnique({
            where:{ 
                email:email
            }
        });
        if(!user) return next(new appError("User not found",4000));
        if(!user.isVerified) return next(new appError("Email is not verified",4000));

        const refreshToken = jwt.sign({id:user.id},appConfig.JWT_REFRESH_TOKEN,{expiresIn:"7d"});
        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await prisma.session.create({
            data:{
                userId:user.id,
                refreshToken:hashedRefreshToken,
                ip:req.ip,
                userAgent:req.headers["user-agent"]||"Unknown"
            }
        });

        const accessToken = jwt.sign({id:user.id},appConfig.JWT_ACCESS_TOKEN,{expiresIn:"15m"});

        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        });

        return res.status(200).json({
            status:"success",
            data:{
                accessToken:accessToken,
                user:{
                    id:user.id,
                    name:user.name,
                    email:user.email
                }
            }
        });
    } catch (error) {
        next(error)
    }
}

async function refreshToken(req,res,next){
    try {
        const {refreshToken} = req.cookies;
        if(!refreshToken) return next(new appError("Refresh token is required",4000));
        const decoded = jwt.verify(refreshToken,appConfig.JWT_REFRESH_TOKEN);
        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await prisma.session.findUnique({
            where:{
                refreshToken:hashedRefreshToken,
                revoked:false
            }
        });
        if(!session) return next(new appError("Session not found",4000));
        const user = await prisma.user.findUnique({
            where:{
                id:decoded.id
            }
        });
        
        if(!user) return next(new appError("User not found",4000));

        const accessToken = jwt.sign({id:user.id},appConfig.JWT_ACCESS_TOKEN,{expiresIn:"15m"});
        const newRefreshToken = jwt.sign({id:user.id},appConfig.JWT_REFRESH_TOKEN,{expiresIn:"7d"});
        const newHashedRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        await prisma.session.update({
            where:{
                id:session.id
            },
            data:{
                refreshToken:newHashedRefreshToken
            }
        });

        res.cookie("refreshToken",newRefreshToken,{
            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        });

        return res.status(200).json({
            status:"success",
            data:{
                accessToken:accessToken
            }
        });
    } catch (error) {
        next(error)
    }
}

async function userLogout(req,res,next){
    try {
        const {refreshToken} = req.cookies;
        if(!refreshToken) return next(new appError("Refresh token is required",4000));
        const decoded = jwt.verify(refreshToken,appConfig.JWT_REFRESH_TOKEN);
        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

        await prisma.session.findUnique({
            where:{
                refreshToken:hashedRefreshToken,
                revoked:false
            }
        });

        if(!session) return next(new appError("Session not found",4000));

        await prisma.session.update({
            where:{
                id:session.id
            },
            data:{
                revoked:true
            }
        });

        res.clearCookie("refreshToken");

        return res.status(200).json({
            status:"success",
            message:"User logged out successfully"
        });
    } catch (error) {
        next(error)
    }
}




export default {userRegister, verifyEmail, resendVerificationEmail, userLogin, userLogout, refreshToken};