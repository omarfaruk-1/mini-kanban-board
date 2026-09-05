import { Router } from "express";
import boardController from "../controllers/board.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const boardRoute = Router();

boardRoute.post("/",authMiddleware, boardController.createBoard);
boardRoute.get("/", authMiddleware, boardController.getBoards);
boardRoute.get("/:boardId", authMiddleware, boardController.getBoard);
boardRoute.patch("/:boardId", authMiddleware, boardController.updateBoard);
boardRoute.delete("/:boardId", authMiddleware, boardController.deleteBoard);

export default boardRoute;