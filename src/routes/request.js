const express = require("express");

const requestRouter = express.Router();
const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


requestRouter.post("/request/send/:status/:receiverId",userAuth, async(req,res)=>{
    
    try{

        const senderId = req.user._id;
        const receiverId = req.params.receiverId;
        const status = req.params.status;

        const allowedStatus = ["ignored","interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message:"Invalid Status Type :"+ status})
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {senderId,receiverId},
                {senderId:receiverId,receiverId:senderId},
            ],
        });
        if(existingConnectionRequest){
            return res.status(400).send({
                message:"Connection Request Already exist"
            })
        }

        const isUser = await User.findById(receiverId);
        if(!isUser){
            res.status(404).send({message:"User is not found.."})
        }

        const connectionRequest = new ConnectionRequest({
            senderId,
            receiverId,
            status
    });

        const data = await connectionRequest.save(); 

        res.json({
            message:req.user.firstName  +  " is " + status + "in" + isUser.firstName,
            data,
        });

    }catch(err){
        res.status(400).send("ERROR :" + err.message)
    }

});

requestRouter.post("/request/review/:status/:requestId",userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;
        const {status,requestId} = req.params;
        const allowedStatus = ["accepted","rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(401).json({message:"status not allowed"})
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id:requestId,
            receiverId:loggedInUser._id,
            status:"interested"
        });

        if(!connectionRequest){
            return res.status(400).json({message:"connection request not found"});
        }

        connectionRequest.status = status;
        const data  = connectionRequest.save();

        res.json({
            message:"connection request " + status,
            data,
        })
    }catch(err){
        res.status(400).send("ERROR:"+err.message);
    }
})

module.exports = requestRouter;