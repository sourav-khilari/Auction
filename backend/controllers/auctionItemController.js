import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary"
import mongoose from "mongoose";
import { Bid } from "../models/bidSchema.js";

export const addNewAuctionItem = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Auction item image required", 400))
    }

    const { image } = req.files

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"]
    if (!allowedFormats.includes(image.mimetype)) {
        return next(new ErrorHandler("invalid image format", 400))
    }

    const {
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime, } = req.body;

    if (!title ||
        !description ||
        !category ||
        !condition ||
        !startingBid ||
        !startTime ||
        !endTime) {
        return next(new ErrorHandler("Please provide all details", 400))
    }
    if (new Date(startTime) < Date.now()) {
        return next(new ErrorHandler("Auction starting time must be greater than present time", 400))
    }
    if (new Date(endTime) < new Date(startTime)) {
        return next(new ErrorHandler("Auction end time must be greater than auction start time", 400))
    }
    const alreadyOneAuctionActive = await Auction.find({
        createdBy: req.user._id,
        endTime: { $gt: Date.now() },
    })
    if (alreadyOneAuctionActive.length > 0) {
        return next(new ErrorHandler("You can't create multiple active auctions", 400))
    }
    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath, {
            folder: "Mern_Auction_Platform_Auctions"
        })
        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.log("Cloudinary error:", cloudinaryResponse.error + "last cloud" || "Unknown cloudinary error");
            return next(new ErrorHandler("Failed to upload auction image to cloudinary", 500))

        }
        const auctionItem = await Auction.create({
            title,
            description,
            category,
            condition,
            startingBid,
            startTime,
            endTime,
            image: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            },
            createdBy: req.user._id
        });
        return res.status(201).json({
            success: true,
            message: `Auction time created and will be listed on auction page at ${startTime}`,
            auctionItem,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message + "last" || "Failed to created auction", 500))
    }
})

export const getAllItem = catchAsyncErrors(async (req, res, next) => {
    let items = await Auction.find();
    res.status(200).json({
        success: true,
        items,
    })
})
export const getAuctionDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid user id", 400))
    }


    const auctionItem = await Auction.findById(id)
    if (!auctionItem) {
        return next(new ErrorHandler("Auction item not found", 404))
    }

    const bidders = auctionItem.bids.sort((a, b) => b.amount - a.amount)
    res.status(200).json({
        success: true,
        auctionItem,
        bidders,
    })
})
export const getMyAuctionItems = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user._id;
    const items = await Auction.find({ createdBy: userId })
    res.status(200).json({
        success: true,
        items,
    })
})
export const removeFromAuction = catchAsyncErrors(async (req, res, next) => {
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
export const republishItem = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid user id", 400))
    }
    let auctionItem = await Auction.findById(id)
    if (!auctionItem) {
        return next(new ErrorHandler("Auction item not found", 404))
    }
    if (!req.body.startTime || !req.body.endTime) {
        return next(new ErrorHandler("Starttime and Endtime for republish  is mandatory"))
    }
    if (new Date(auctionItem.endTime) > Date.now()) {
        return next(
            new ErrorHandler("Auction item is not ended yet,cannot republish", 400)
        )
    }
    const data = {
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
    }
    if (data.startTime < Date.now()) {
        return next(new ErrorHandler("Start time cannot be in the past", 400))
    }
    if (data.startTime > data.endTime) {
        return next(new ErrorHandler("End time cannot be before start time", 400))
    }

    if(auctionItem.highestBidder){
        const highestBidder = await User.findById(auctionItem.highestBidder);
        highestBidder.moneySpent-=auctionItem.currentBid;
        highestBidder.auctionWon-=1;
        highestBidder.save();
    }




    data.bids = [];
    data.commissionCalculated = false;
    data.currentBid=0;
    data.highestBidder=null;
    auctionItem = await Auction.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        userFindAndModify: false,
    })

    await Bid.deleteMany({auctionItem:auctionItem._id});

    const createdBy = await User.findByIdAndUpdate(req.user._id, { unpaidCommission: 0 }, {
        new: true,
        //false runValidator if it is true then give error because of password and password present in hash format it is long string it create problem
        runValidators: false,
        userFindAndModify: false,
    })
    // const createdBy=await User.findById(req.user._id)
    // createdBy.unpaidCommission=0;
    // await createdBy.save()
    res.status(200).json({
        success: true,
        message: `Auction item republished successfully and will be active on ${req.body.startTime}`,
        createdBy,
    })
})