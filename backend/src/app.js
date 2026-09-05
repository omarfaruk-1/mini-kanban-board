import express from "express";
import authRoute from "./routes/auth.route.js";
import boardRoute from "./routes/board.routes.js";
import boardMemberRoute from "./routes/boardMember.routes.js";
import columnRoute from "./routes/column.controller.js";
import taskRoute from "./routes/task.routes.js";

const app= express();

app.use(express.json());


//? routes
app.use("/api/users",authRoute);
app.use("/api/boards",boardRoute);
app.use("/api/board-members",boardMemberRoute);
app.use("/api/columns",columnRoute);
app.use("/api/tasks",taskRoute);


app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"Health response"
    })
})

export default app;