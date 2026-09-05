import prisma from "../db/db.js";
import appError from "../errors/appError.js";

async function addBoardMember(req, res, next) {
    try {
        const { boardId } = req.params;
        const { email } = req.body;

        if (!email?.trim()) {
            return next(new appError("User email is required", 400));
        }

        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                ownerId: req.user.id
            }
        });

        if (!board) {
            return next(
                new appError(
                    "Board not found or you are not the owner",
                    404
                )
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email.trim()
            }
        });

        if (!user) {
            return next(
                new appError("Registered user not found", 404)
            );
        }

        if (user.id === req.user.id) {
            return next(
                new appError(
                    "Board owner already has access",
                    400
                )
            );
        }

        const member = await prisma.boardMember.create({
            data: {
                boardId,
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return res.status(201).json({
            status: "success",
            data: {
                member
            }
        });
    } catch (error) {
        if (error.code === "P2002") {
            return next(
                new appError(
                    "User already has access to this board",
                    409
                )
            );
        }

        next(error);
    }
}

async function removeBoardMember(req, res, next) {
    try {
        const { boardId, userId } = req.params;

        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                ownerId: req.user.id
            }
        });

        if (!board) {
            return next(
                new appError(
                    "Board not found or you are not the owner",
                    404
                )
            );
        }

        const member = await prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId,
                    userId
                }
            }
        });

        if (!member) {
            return next(
                new appError("Board member not found", 404)
            );
        }

        await prisma.boardMember.delete({
            where: {
                id: member.id
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Board member removed successfully"
        });
    } catch (error) {
        next(error);
    }
}

export default {
    addBoardMember,
    removeBoardMember
};  