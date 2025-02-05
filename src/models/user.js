const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName:{
        type:"String",
        required:true,
        trim:true,
        minlength:4,
        maxlenght:50

    },
    lastName:{
        type:"String"
    },
    emailId:{
        type:"String",
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new error("email is not valid : " + value);
            }
        },
    },
    password:{
        type:"String",
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a Strong Password"+value)
            }
        }
    },
    age:{
        type:"number",
        min:18,
        
    },
    gender:{
        type:"String",
        enum:{
            values:["male","female","other"],
            message:`{VALUE} is not a valid gender type`
        }
    },
    photoUrl:{
        type:"String",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid photo Url"+ value)
            }
        }
    },
    about:{
        type:"String",
        default:"This is default value"
    },
    skills:{
        type:["Strings"]
    }
},
{
    timestamps:true,
}
);
userSchema.methods.getJwt = async function(){
    const user = this;
    const token =  await jwt.sign({_id:user._id},"DEV@TINDER#790",{
            expiresIn:"1d",
    });
    return token;
}

module.exports = mongoose.model("User",userSchema);