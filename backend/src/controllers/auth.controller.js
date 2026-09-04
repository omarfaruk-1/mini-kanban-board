import prisma from "../db/db.js";

async function userRegister (req,res,next){
    try {
        const {name,email,password}=req.body;
        if(!name || !email || !password) return next(new appError("All fields are required",4000));

        const existUser = await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(existUser) return next(new appError("User already exists",4000));

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data:{  
                name:name,
                email:email,
                password:hashedPassword
            }
        });

        // const emailToken= jwt.sign({id:user.id},process.env.EMAIL_SECRET,{expiresIn:"20m"});
        // const url = `${process.env.BASE_URL}/api/v1/auth/verify-email/${emailToken}`;

        res.status(201).json({
            status:"success",
            data:user
        })

    } catch (error) {
        next(error)
    }
}