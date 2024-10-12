import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Commission } from "../models/commissionSchema.js";
import { User } from "../models/userSchema.js";
import mongoose from "mongoose";
import { Auction } from "../models/auctionSchema.js";
import { PaymentProof } from "../models/commisionProofSchema.js";

export const deleteAuction = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid user id", 400))
    }
    const auctionItem = await Auction.findById(id)
    if (!auctionItem) {
        return next(new ErrorHandler("Auction item not found", 404))
    }
    await auctionItem.deleteOne();
    res.status(200).json({
        success: true,
        message: "Auction item deleted successfully"
    })
})

export const getAllPaymentProofs=catchAsyncErrors(async(req,res,next)=>{
    const paymentProofs=await PaymentProof.find();
    
    
    res.status(200).json({
        success:true,
        paymentProofs,
    })
})

export const getPaymentProofDetails=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params
    const paymentProofDetail=await PaymentProof.findById(id);
    res.status(200).json({
        success:true,
        paymentProofDetail,
    })
})

export const updateProofStatus=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    const {amount,status}=req.body;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid user id", 400))
    }
    let proof=await PaymentProof.findById(id);
    if(!proof){
        return next(new ErrorHandler("Payment proof not found", 404))
    }
    proof=await PaymentProof.findByIdAndUpdate(id,{status,amount},{
        new:true,
        runValidators:true,
        userFindAndModify:false
    })
    res.status(200).json({
        success:true,
        message:"Payment proof amount status updated",
        proof
    })
})

export const daletePaymentProof=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    const proof=await PaymentProof.findById(id);
    if(!proof){
        return next(new ErrorHandler("Payment proof not found", 404))
    }
    await proof.deleteOne();
    res.status(200).json({
        success:true,
        message:"Payment proof deleted successfully",

    })
})

export const fetchAllUsers=catchAsyncErrors(async(req,res,next)=>{
    const users=await User.aggregate([
        {
            $group:{
                _id:{
                    month:{$month:"$createdAt"},
                    year:{$year:"$createdAt"},
                    role:"$role"
                },
                count: {$sum: 1},
            },
           
        },
        {
            //modify the data
            $project:{
                month:"$_id.month",
                year:"$_id.year",
                role:"$_id.role",
                count:1,
                _id:0,
            }
        },
        {
            $sort:{year:1,month:1},
        }
    ])

    const bidders=users.filter((user)=>user.role==="Bidder");
    const auctioneers=users.filter((user)=>user.role==="Auctioneer");

    const transformDataToMonthlyArray=(data,totalMonths=12)=>{
        const result=Array(totalMonths).fill(0);

        data.forEach((item)=>{
            result[item.month-1]=item.count
        });
        return result;
    }

    const bidderArray=transformDataToMonthlyArray(bidders);
    const auctioneerArray=transformDataToMonthlyArray(auctioneers);

    res.status(200).json({
        success:true,
        bidderArray,
        auctioneerArray,
    });
})

export const monthlyRevenue=catchAsyncErrors(async(req,res,next)=>{
    const payments=await Commission.aggregate([
        {
            $group:{
                _id:{
                    month:{$month:"$createdSAt"},
                    year:{$year:"$createdSAt"},
                },
                totalAmount:{$sum:"amount"}
            }
        },{
            $sort:{"_id.year":1,"_id.month":1}
        }
    ]);

    const transformDataToMonthlyArray=(payments,totalMonths=12)=>{
        const result=Array(totalMonths).fill(0);

        payments.forEach((payment)=>{
            result[payment._id.month-1]=payment.totalAmount
        });

        return result;
    }

    const totalMonthRevenue=transformDataToMonthlyArray(payments);
    res.status(200).json({
        success:true,
        totalMonthRevenue,
    })
})

