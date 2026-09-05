import {Router} from "express";
import columnController from "../controllers/column.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const columnRoute = Router();


columnRoute.post("/:boardId",authMiddleware, columnController.createColumn);
columnRoute.get("/:boardId", authMiddleware, columnController.getColumns);
columnRoute.patch("/columns/:columnId", authMiddleware, columnController.updateColumn);
columnRoute.delete("/columns/:columnId", authMiddleware, columnController.deleteColumn);

export default columnRoute;