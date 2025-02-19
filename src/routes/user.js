const express = require("express");

const userRouter = express.Router();
const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl about age gender skills "; 

userRouter.get("/user/requests/received" , userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            receiverId:loggedInUser._id,
            status:"interested"
        }).populate("senderId",
            USER_SAFE_DATA
        );

        res.json({
            message:"Data fetch successfully",
            data:connectionRequest
        })
    }catch(err){
        res.status(400).send("ERROR"+err.message);
    }
});

userRouter.get("/user/connections" , userAuth, async(req,res)=>{
    try{
        const loggedInUser =req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {receiverId:loggedInUser._id,status:"accepted"},
                {senderId:loggedInUser._id,status:"accepted"}
            ],
        }).populate("senderId",USER_SAFE_DATA)
        .populate("receiverId",USER_SAFE_DATA);

        const data = connectionRequests.map((row)=>{
            if(row.senderId._id.toString()===loggedInUser._id.toString()){
                return row.receiverId;
            }
            return row.senderId;
        });

        res.json({
            data,
        });
    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});

userRouter.get("/feed", userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page)||1;
        let limit = parseInt(req.query.limit)||10;
        limit  = limit>50 ? 50 : limit;
        const skip =(page-1)*10;

        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {senderId:loggedInUser._id},
                {receiverId:loggedInUser._id}
            ],
        }).select("senderId receiverId");

        const hideFromUserFeed = new Set();
        connectionRequests.forEach((req)=>{
            hideFromUserFeed.add(req.senderId.toString());
            hideFromUserFeed.add(req.receiverId.toString());
        });

        const users = await User.find({
        $and:[
            {_id: {$nin: Array.from(hideFromUserFeed)},},
            {_id:{$ne:loggedInUser._id} },
        ],
        }).skip(skip).limit(limit);

        res.send(users);
    }catch(err){
        res.status(400).send("ERROR:" + err.message);
    }
})


module.exports = userRouter;