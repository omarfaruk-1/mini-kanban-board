import express from "express";
import authRoute from "./routes/auth.route.js";

const app= express();

app.use(express.json());


//? routes
app.use("/api/users",authRoute);




app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"Health response"
    })
})

export default app;