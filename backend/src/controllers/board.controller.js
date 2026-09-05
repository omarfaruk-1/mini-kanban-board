import prisma from "../db/db.js";
import appError from "../errors/appError.js";


// =========================
// CREATE BOARD
// =========================
async function createBoard(req, res, next) {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return next(
                new appError("Board title is required", 400)
            );
        }

        const board = await prisma.board.create({
            data: {
                title: title.trim(),
                ownerId: req.user.id
            }
        });

        return res.status(201).json({
            status: "success",
            data: {
                board
            }
        });

    } catch (error) {
        next(error);
    }
}


// =========================
// GET ALL BOARDS
// =========================
async function getBoards(req, res, next) {
    try {
        const userId = req.user.id;

        const boards = await prisma.board.findMany({
            where: {
                OR: [
                    {
                        ownerId: userId
                    },
                    {
                        members: {
                            some: {
                                userId
                            }
                        }
                    }
                ]
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            status: "success",
            data: {
                boards
            }
        });

    } catch (error) {
        next(error);
    }
}


// =========================
// GET SINGLE BOARD
// =========================
async function getBoard(req, res, next) {
    try {
        const { boardId } = req.params;
        const userId = req.user.id;

        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                OR: [
                    {
                        ownerId: userId
                    },
                    {
                        members: {
                            some: {
                                userId
                            }
                        }
                    }
                ]
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                columns: {
                    orderBy: {
                        position: "asc"
                    },
                    include: {
                        tasks: {
                            orderBy: {
                                position: "asc"
                            }
                        }
                    }
                }
            }
        });

        if (!board) {
            return next(
                new appError(
                    "Board not found or access denied",
                    404
                )
            );
        }

        return res.status(200).json({
            status: "success",
            data: {
                board
            }
        });

    } catch (error) {
        next(error);
    }
}


// =========================
// UPDATE BOARD
// =========================
async function updateBoard(req, res, next) {
    try {
        const { boardId } = req.params;
        const { title } = req.body;

        if (!title || !title.trim()) {
            return next(
                new appError("Board title is required", 400)
            );
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

        const updatedBoard = await prisma.board.update({
            where: {
                id: boardId
            },
            data: {
                title: title.trim()
            }
        });

        return res.status(200).json({
            status: "success",
            data: {
                board: updatedBoard
            }
        });

    } catch (error) {
        next(error);
    }
}


// =========================
// DELETE BOARD
// =========================
async function deleteBoard(req, res, next) {
    try {
        const { boardId } = req.params;

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

        await prisma.board.delete({
            where: {
                id: boardId
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Board deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}


export default {
    createBoard,
    getBoards,
    getBoard,
    updateBoard,
    deleteBoard
};