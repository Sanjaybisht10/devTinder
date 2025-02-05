const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({

    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:["ignored","interested","accepted","rejected"],
            message:`{value} is incorrect status type`,
        },
    }
},
{
    timestamps:true,
}
);

connectionRequestSchema.index({senderId:1,receiverid:1})

connectionRequestSchema.pre("save",function(next){
    const connectionRequest = this;
    if(connectionRequest.senderId.equals(connectionRequest.receiverId)){
        throw new Error("cannotsend connection request to yourself")
    }
    next();
});

const ConnectionRequestModel = new mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports = ConnectionRequestModel;