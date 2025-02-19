const express = require("express");

const authRouter = express.Router();
const {validateSignupData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");


authRouter.post("/signup", async(req,res)=>{
    try{
        // validate the data
        validateSignupData(req);

        const {firstName,lastName,emailId,password} = req.body;
        // encrypt the password
        const hashedPassword = await bcrypt.hash(password,10);
        const user = new User({
        firstName,
        lastName,
        emailId,
        password:hashedPassword,
    });
        await user.save();
        
    res.json({
        message:"user data added successfully",
    });
    }catch(err){
        res.status(500).send("ERROR : " + err.message)
    }
    
});


authRouter.post("/login", async(req,res)=>{
    try{
        const {emailId,password} = req.body;
        const user = await User.findOne({emailId:emailId});

        if(!user){
            throw new Error("Email id is not present in DB")
        }

        const isPassword = await bcrypt.compare(password,user.password);
        if(isPassword){
            //generate token
            const token =  await user.getJwt();
            res.cookie("token",token,{
                expires: new Date(Date.now()+ 8 * 360000),
            });

            res.send(user);
        }else{
            throw new Error("Password is not correct");
        }
    }catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

authRouter.post("/logout",async(req,res)=>{
    res.cookie("token",null,{
        expires:new Date (Date.now()),
    });
    res.send("User logout successfully");
})

module.exports = authRouter;
