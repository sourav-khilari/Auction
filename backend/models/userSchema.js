import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        minLength:[3,"Username must contain atleast 3 character"],
        maxLength:[40,"Username must contain maximum 40 character"],
    },
    password:{
        type:String,
        selected:false,
        minLength:[8,"Password must contain atleast 8 character"],
        //maxLength:[32,"Password must contain maximum 32 character"]
    },
    email:String,
    address:String,
    phone:{
        type:String,
        minLength:[10,"Phone no. must contain atleast 10 character"],
        minLength:[10,"Phone no must contain maximum 10 character"]
    },
    profileImage:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    paymentMethods:{
        bankTransfer:{
            bankAccountNumber:String,
            bankAccountName:String,
            bankName:String
        },
        easypaisa:{
            easypaisaAccountNumber:String,
        },
        paypal:{
            paypalEmail:String, 
        }
    },
    role:{
        type:String,
        enum:["Auctioner","Bidder","Super Admin"],
    },
    unpaidCommission:{
        type:Number,
        default:0
    },
    auctionWon:{
        type:Number,
        default:0
    },
    moneySpent:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }

})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password=await bcrypt.hash(this.password,10)
})

userSchema.methods.comparePassword=async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.generateJsonWebToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE,
    }
    )
}

export const User=mongoose.model("User",userSchema)