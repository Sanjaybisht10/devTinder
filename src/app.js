const express = require("express");
const app = express();
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors")

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));


const authRouter =require("./routes/auth");
const profileRouter =require("./routes/profile");
const requestRouter =require("./routes/request");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);


connectDb().then(()=>{
    console.log("Database connection successfully.....")
    app.listen(3000,()=>{
        console.log("sever is running on port no 3000.....")
    });
}).catch((err)=>{
    console.log("connection not connected")
})






