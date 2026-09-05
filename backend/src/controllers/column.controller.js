import prisma from "../db/db.js";
import appError from "../errors/appError.js";

async function createColumn(req, res, next) {
    try {
        const { boardId } = req.params;
        const { title } = req.body;

        if (!title?.trim()) {
            return next(new appError("Column title is required", 400));
        }

        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                OR: [
                    { ownerId: req.user.id },
                    {
                        members: {
                            some: {
                                userId: req.user.id
                            }
                        }
                    }
                ]
            }
        });

        if (!board) {
            return next(
                new appError("Board not found or access denied", 404)
            );
        }

        const lastColumn = await prisma.column.findFirst({
            where: { boardId },
            orderBy: { position: "desc" }
        });

        const column = await prisma.column.create({
            data: {
                title: title.trim(),
                position: lastColumn ? lastColumn.position + 1 : 0,
                boardId
            }
        });

        return res.status(201).json({
            status: "success",
            data: { column }
        });
    } catch (error) {
        next(error);
    }
}

async function getColumns(req, res, next) {
    try {
        const { boardId } = req.params;

        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                OR: [
                    { ownerId: req.user.id },
                    {
                        members: {
                            some: {
                                userId: req.user.id
                            }
                        }
                    }
                ]
            }
        });

        if (!board) {
            return next(
                new appError("Board not found or access denied", 404)
            );
        }

        const columns = await prisma.column.findMany({
            where: { boardId },
            orderBy: { position: "asc" },
            include: {
                tasks: {
                    orderBy: { position: "asc" }
                }
            }
        });

        return res.status(200).json({
            status: "success",
            data: { columns }
        });
    } catch (error) {
        next(error);
    }
}

async function updateColumn(req, res, next) {
    try {
        const { columnId } = req.params;
        const { title } = req.body;

        if (!title?.trim()) {
            return next(new appError("Column title is required", 400));
        }

        const column = await prisma.column.findFirst({
            where: {
                id: columnId,
                board: {
                    OR: [
                        { ownerId: req.user.id },
                        {
                            members: {
                                some: {
                                    userId: req.user.id
                                }
                            }
                        }
                    ]
                }
            }
        });

        if (!column) {
            return next(
                new appError("Column not found or access denied", 404)
            );
        }

        const updatedColumn = await prisma.column.update({
            where: { id: columnId },
            data: {
                title: title.trim()
            }
        });

        return res.status(200).json({
            status: "success",
            data: {
                column: updatedColumn
            }
        });
    } catch (error) {
        next(error);
    }
}

async function deleteColumn(req, res, next) {
    try {
        const { columnId } = req.params;

        const column = await prisma.column.findFirst({
            where: {
                id: columnId,
                board: {
                    OR: [
                        { ownerId: req.user.id },
                        {
                            members: {
                                some: {
                                    userId: req.user.id
                                }
                            }
                        }
                    ]
                }
            }
        });

        if (!column) {
            return next(
                new appError("Column not found or access denied", 404)
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.column.delete({
                where: { id: columnId }
            });

            await tx.column.updateMany({
                where: {
                    boardId: column.boardId,
                    position: {
                        gt: column.position
                    }
                },
                data: {
                    position: {
                        decrement: 1
                    }
                }
            });
        });

        return res.status(200).json({
            status: "success",
            message: "Column deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createColumn,
    getColumns,
    updateColumn,
    deleteColumn
};