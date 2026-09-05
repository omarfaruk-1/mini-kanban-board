import jwt from "jsonwebtoken";
import prisma from "../db/db.js";
import appError from "../errors/appError.js";
import appConfig from "../config/appConfig.js";


const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(
                new appError("No token provided", 401)
            );
        }

        const decoded = jwt.verify(
            token,
            appConfig.JWT_ACCESS_TOKEN
        );

        const session = await prisma.session.findUnique({
            where: {
                id: decoded.sessionId
            }
        });

        if (!session || session.revoked) {
            return next(
                new appError("Invalid token", 401)
            );
        }

        if (session.userId !== decoded.userId) {
            return next(
                new appError("Invalid token", 401)
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        });

        if (!user) {
            return next(
                new appError("User not found", 404)
            );
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        next(
            new appError("Authentication failed", 401)
        );
    }
};


export default authMiddleware;