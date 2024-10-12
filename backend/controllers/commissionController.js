import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { PaymentProof } from "../models/commisionProofSchema.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { Auction } from "../models/auctionSchema.js";
import mongoose from "mongoose";

export const calculateCommission = async (auctionId) => {
    console.log("\ncalculate=\n");
    
    const auction = await Auction.findById(auctionId);
    console.log(auction);
    
    console.log("\ncalculate2\n");
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
        console.log("\nerror calculate\n");
        return next(new ErrorHandler("Invalid Auction Id format.", 400));
    }
    const commissionRate = 0.05;
    const commission = parseInt(auction.currentBid) * commissionRate;
    console.log("\ncalculate last\n");
    console.log("\n"+commission+"\n");
    
    return commission;
  };

export const proofOfCommission=catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length==0){
        return next(new ErrorHandler('Payment proof screensort required',404))
    }
    const {proof}=req.files;
    const {amount,comment}=req.body;
    const user=await User.findById(req.user._id);

    if(!amount || !comment){
        return next(new ErrorHandler('Amount & comment are required fields',404))
    }

    if(user.unpaidCommission===0){
        return res.status(200).json({
            success:true,
            message:'You have no unpaid commission to prove',
        })
    }

    if(user.unpaidCommission<amount){
        return next(new ErrorHandler(`the amount exceed your unpaid commission balance.Please enter a amount up to ${user.unpaidCommission}`,401))
    }

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"]
    if (!allowedFormats.includes(proof.mimetype)) {
        return next(new ErrorHandler("Screensort format not supported", 400))
    }
    
    const cloudinaryResponse = await cloudinary.uploader.upload(proof.tempFilePath, {
        folder: "Mern_Auction_Payment_proof"
    })
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.log("Cloudinary error:", cloudinaryResponse.error || "Unknown cloudinary error");
        return next(new ErrorHandler("Failed to upload payment proof", 500))

    }

    const CommissionProof=await PaymentProof.create({
        userId:req.user._id,
        proof:{
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.secure_url
        },
        amount,
        comment,

    })

    res.status(201).json({
        success:true,
        message:'Payment proof uploaded successfully.we will review it and response to you within 24 hours',
        CommissionProof
    });
})
