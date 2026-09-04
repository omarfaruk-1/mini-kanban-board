import express from "express";

const app= express();

app.use(express.json());


app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"Health response"
    })
})

export default app;