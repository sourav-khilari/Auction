import ErrorHandler from "../middlewares/error.js"
import { v2 as cloudinary } from "cloudinary"
import { User } from "../models/userSchema.js"
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js"
import { generateToken } from "../utils/jwtToken.js"

export const register = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("profile image required", 400))
    }

    const { profileImage } = req.files

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"]
    if (!allowedFormats.includes(profileImage.mimetype)) {
        return next(new ErrorHandler("invalid image format", 400))
    }

    const {
        userName,
        email,
        password,
        phone,
        address,
        role,
        bankAccountNumber,
        bankAccountName,
        bankName,
        easypaisaAccountNumber,
        paypalEmail } = req.body;

    if (!userName || !email || !phone || !password || !address || !role) {
        return next(new ErrorHandler("please fill full form first", 400))
    }
    if (role == "Auctioneer") {
        if (!bankAccountNumber || !bankAccountName || !bankName) {
            return next(new ErrorHandler("please fill full bank details", 400))
        }
        if (!easypaisaAccountNumber) {
            return next(new ErrorHandler("please fill easypaisa account number", 400))
        }
        if (!paypalEmail) {
            return next(new ErrorHandler("please fill paypal email", 400))
        }
    }
    const isRegistered = await User.findOne({ email })
    if (isRegistered) {
        return next(new ErrorHandler("user already registered", 400))
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(profileImage.tempFilePath, {
        folder: "Mern_Auction_Platform_Users"
    })
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.log("Cloudinary error:", cloudinaryResponse.error || "Unknown cloudinary error");
        return next(new ErrorHandler("Failed to upload profile image", 500))

    }
    const user = await User.create({
        userName,
        email,
        password,
        phone,
        address,
        role,
        profileImage: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        },
        PaymentMethod: {
            bankAccountNumber,
            bankAccountName,
            bankName,
        },
        easypaisa: {
            easypaisaAccountNumber
        },
        paypal: {
            paypalEmail
        }
    })
    generateToken(user, "User Registered", 201, res)
    // res.status(200).json({
    //     success:true,
    //     message:"User Registered",
    // })

})

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new ErrorHandler("please fill email and password", 400))
    }
    const user = await User.findOne({ email })
    console.log("user 1");
    
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401))
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 401))
    }
    generateToken(user, "login successfull", 200, res);
})

export const getProfile = catchAsyncErrors(async (req, res, next) => {
    const user = req.user
    res.status(200).json({
        success: true,
        user,
    })
})


export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged out successfully"
    })
})


export const fetchLeaderboard = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find({moneySpent:{$gt:0}});
    const leaderboard=users.sort((a,b)=>b.moneySpent-a.moneySpent);
    res.status(200).json({
        success:true,
        leaderboard,
    })
})