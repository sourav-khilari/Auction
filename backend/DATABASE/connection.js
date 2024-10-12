import mongoose from "mongoose";

export const connection =()=>{
    mongoose.connect(process.env.MONGO_URI, {
        dbName:"MERN_AUCTION_PLATFORM",
    }).then(()=>{
        console.log("connected to database");
        
    }).catch(error=>{
        console.log("show some error while connecting to database");
        
    })
}