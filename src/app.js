const express = require("express");
const connectDb = require("./config/database")
const User = require("./models/user")

const app = express();

app.use(express.json());

connectDb().then(()=>{
    console.log("Database connection successfully.....")
    app.listen(3000,()=>{
        console.log("sever is running on port no 3000.....")
    });
}).catch((err)=>{
    console.log("connection not connected")
})


app.post("/signup", async(req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
    res.send("user data added successfully");
    }catch(err){
        console.log(err)
    }
    
})

app.get("/user", async(req,res)=>{
    try{
        const userEmail = req.body.emailId;
    const user = await User.find({emailId : userEmail})
    res.send(user)
    }catch(err){
        res.status(402).send("User Not Found");
    }
    
})

app.get("/feed",async(req,res)=>{
    try{
        const users = await User.find({})
        res.send(users);
    }catch(err){
        res.status(500).send("No Users Found")
    }
})





