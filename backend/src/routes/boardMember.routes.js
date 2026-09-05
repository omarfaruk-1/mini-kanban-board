import {Router} from "express";
import boardMemberController from "../controllers/boardMember.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const boardMemberRoute = Router();

boardMemberRoute.post("/:boardId",authMiddleware,boardMemberController.addBoardMember);

boardMemberRoute.delete("/:boardId/members/:userId",authMiddleware,boardMemberController.removeBoardMember);

export default boardMemberRoute;