const express = require("express");
const app = express();
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require('http');

require("dotenv").config()

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
const razorpayRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");
const initializeSocket = require("./utils/socket");


app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);
app.use('/',razorpayRouter);
app.use("/",chatRouter);

const server = http.createServer(app);
initializeSocket(server);



connectDb().then(()=>{
    console.log("Database connection successfully.....")
    server.listen(process.env.PORT,()=>{
        console.log("sever is running on port no : ",process.env.PORT)
    });
}).catch((err)=>{
    console.log("connection not connected",err)
})






