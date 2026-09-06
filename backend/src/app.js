import express from "express";
import authRoute from "./routes/auth.route.js";
import boardRoute from "./routes/board.routes.js";
import boardMemberRoute from "./routes/boardMember.routes.js";
import columnRoute from "./routes/column.controller.js";
import taskRoute from "./routes/task.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "https://mini-kanban-board-xi.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

//? routes
app.use("/api/users", authRoute);
app.use("/api/boards", boardRoute);
app.use("/api/board-members", boardMemberRoute);
app.use("/api/columns", columnRoute);
app.use("/api/tasks", taskRoute);

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Health response",
  });
});

export default app;
