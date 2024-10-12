import { config } from "dotenv";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connection } from "./DATABASE/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import auctionItemRouter from "./router/auctionItemRoutes.js"
import bidRouter from "./router/bidRoutes.js"
import commissionRouter from "./router/commissionRouter.js"
import superAdminRouter from "./router/superAdminRoutes.js"
import { endedAuctionCron } from "./automation/endedAuctionCron.js";
import { verifyCommissionCron } from "./automation/verifyCommissionCron.js";

const app = express()

config({
    path: "./config/config.env"
})

//for connect frontend and backend
//middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    //http nethod 
    methods: ["POST", "GET", "PUT", "DELETE"],
    // This option allows the browser to include credentials (like cookies, HTTP authentication, and client-side SSL certificates) in the requests
    credentials: true
}));



//without it cookie genrated but you not access it
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}))

app.use("/api/v1/user",userRouter)

app.use("/api/v1/auctionitem",auctionItemRouter)

app.use("/api/v1/bid",bidRouter)

app.use("/api/v1/commission",commissionRouter)

app.use("/api/v1/superadmin",superAdminRouter)

endedAuctionCron()
verifyCommissionCron();
connection()

app.use(errorMiddleware)

export default app;