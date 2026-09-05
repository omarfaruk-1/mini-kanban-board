import prisma from "../db/db.js";
import appError from "../errors/appError.js";

async function createTask(req, res, next) {
    try {
        const { columnId } = req.params;
        const { title, description } = req.body;

        if (!title?.trim()) {
            return next(new appError("Task title is required", 400));
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

        const lastTask = await prisma.task.findFirst({
            where: { columnId },
            orderBy: { position: "desc" }
        });

        const task = await prisma.task.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                position: lastTask ? lastTask.position + 1 : 0,
                columnId
            }
        });

        return res.status(201).json({
            status: "success",
            data: { task }
        });
    } catch (error) {
        next(error);
    }
}

async function getTasks(req, res, next) {
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

        const tasks = await prisma.task.findMany({
            where: { columnId },
            orderBy: { position: "asc" }
        });

        return res.status(200).json({
            status: "success",
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
}

async function getTask(req, res, next) {
    try {
        const { taskId } = req.params;

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                column: {
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
            }
        });

        if (!task) {
            return next(
                new appError("Task not found or access denied", 404)
            );
        }

        return res.status(200).json({
            status: "success",
            data: { task }
        });
    } catch (error) {
        next(error);
    }
}

async function updateTask(req, res, next) {
    try {
        const { taskId } = req.params;
        const { title, description } = req.body;

        if (title !== undefined && !title?.trim()) {
            return next(
                new appError("Task title cannot be empty", 400)
            );
        }

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                column: {
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
            }
        });

        if (!task) {
            return next(
                new appError("Task not found or access denied", 404)
            );
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...(title !== undefined && {
                    title: title.trim()
                }),
                ...(description !== undefined && {
                    description: description?.trim() || null
                })
            }
        });

        return res.status(200).json({
            status: "success",
            data: { task: updatedTask }
        });
    } catch (error) {
        next(error);
    }
}

async function deleteTask(req, res, next) {
    try {
        const { taskId } = req.params;

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                column: {
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
            }
        });

        if (!task) {
            return next(
                new appError("Task not found or access denied", 404)
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.task.delete({
                where: { id: taskId }
            });

            await tx.task.updateMany({
                where: {
                    columnId: task.columnId,
                    position: {
                        gt: task.position
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
            message: "Task deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function moveTask(req, res, next) {
    try {
        const { taskId } = req.params;
        const { targetColumnId, targetPosition } = req.body;

        if (
            !targetColumnId ||
            !Number.isInteger(targetPosition) ||
            targetPosition < 0
        ) {
            return next(
                new appError(
                    "Valid targetColumnId and targetPosition are required",
                    400
                )
            );
        }

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                column: {
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
                },
            },
            include: {
                    column: true
            }
        });

        if (!task) {
            return next(
                new appError("Task not found or access denied", 404)
            );
        }

        const targetColumn = await prisma.column.findFirst({
            where: {
                id: targetColumnId,
                boardId: task.column.boardId
            }
        });

        if (!targetColumn) {
            return next(
                new appError(
                    "Target column does not belong to the same board",
                    400
                )
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const sourceColumnId = task.columnId;
            const sourcePosition = task.position;

            if (sourceColumnId === targetColumnId) {
                const taskCount = await tx.task.count({
                    where: {
                        columnId: sourceColumnId
                    }
                });

                const newPosition = Math.min(
                    targetPosition,
                    taskCount - 1
                );

                if (newPosition === sourcePosition) {
                    return task;
                }

                if (newPosition < sourcePosition) {
                    await tx.task.updateMany({
                        where: {
                            columnId: sourceColumnId,
                            position: {
                                gte: newPosition,
                                lt: sourcePosition
                            }
                        },
                        data: {
                            position: {
                                increment: 1
                            }
                        }
                    });
                } else {
                    await tx.task.updateMany({
                        where: {
                            columnId: sourceColumnId,
                            position: {
                                gt: sourcePosition,
                                lte: newPosition
                            }
                        },
                        data: {
                            position: {
                                decrement: 1
                            }
                        }
                    });
                }

                return tx.task.update({
                    where: { id: taskId },
                    data: {
                        position: newPosition
                    }
                });
            }

            const targetTaskCount = await tx.task.count({
                where: {
                    columnId: targetColumnId
                }
            });

            const newPosition = Math.min(
                targetPosition,
                targetTaskCount
            );

            await tx.task.updateMany({
                where: {
                    columnId: sourceColumnId,
                    position: {
                        gt: sourcePosition
                    }
                },
                data: {
                    position: {
                        decrement: 1
                    }
                }
            });

            await tx.task.updateMany({
                where: {
                    columnId: targetColumnId,
                    position: {
                        gte: newPosition
                    }
                },
                data: {
                    position: {
                        increment: 1
                    }
                }
            });

            return tx.task.update({
                where: { id: taskId },
                data: {
                    columnId: targetColumnId,
                    position: newPosition
                }
            });
        });

        return res.status(200).json({
            status: "success",
            data: {
                task: result
            }
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    moveTask
};