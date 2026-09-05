import {Router} from "express";
import taskController from "../controllers/task.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const taskRoute = Router();


taskRoute.post("/:columnId", authMiddleware, taskController.createTask);

// all task in column
taskRoute.get("/column/:columnId", authMiddleware, taskController.getTasks);

taskRoute.get("/:taskId", authMiddleware, taskController.getTask);


taskRoute.patch("/:taskId", authMiddleware, taskController.updateTask);

taskRoute.delete("/:taskId", authMiddleware, taskController.deleteTask);

taskRoute.patch("/:taskId/move", authMiddleware, taskController.moveTask);

export default taskRoute;