import cron from "node-cron"
import { Auction } from "../models/auctionSchema.js"
import { User } from "../models/userSchema.js"
import { calculateCommission } from "../controllers/commissionController.js"
import { Bid } from "../models/bidSchema.js"
import { sendEmail } from "../utils/sendEmail.js"

export const endedAuctionCron = () => {
    //min,hour,days,month,year
    //after 1 min run
    cron.schedule("*/1 * * * *", async () => {
        const now = new Date();
        //console.log(now);
        const endedAuctions = await Auction.find({
            endTime: { $lt: now },
            commissionCalculate: false,
        });
        console.log(endedAuctions);
        
        for (const auction of endedAuctions) {
            try {
                
                const commissionAmount = await calculateCommission(auction._id);
                auction.commissionCalculate = true;
                console.log("\ninside loop\n");
                const highestBidder = await Bid.findOne({
                    auctionItem: auction._id,
                    amount: auction.currentBid,
                })
                const auctioneer = await User.findById(auction.createdBy);
                auctioneer.unpaidCommission = commissionAmount;
                console.log("\nbidder\n"+highestBidder);
                if (highestBidder) {
                    
                    
                    auction.highestBidder=highestBidder.bidder.id;
                    await auction.save();
                    const bidder=await User.findById(highestBidder.bidder.id);
                    //const highestBidAmount=bidder.moneySpent+highestBidder.amount;
                    await User.findByIdAndUpdate(bidder._id,{
                        $inc:{
                            moneySpent:highestBidder.amount,
                            auctionWon:1,
                        },
                    },{new:true});
                    await User.findByIdAndUpdate(auctioneer._id,{
                        $inc:{
                            unpaidCommission:commissionAmount,
                        }
                    },
                    {new:true},
                );
                const subject=`Congrulations! You won the auction for ${auction.title}`
                const message = `Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email:${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName}\n\n2. **Easypaise**:\n- You can send payment via Easypaise: ${auctioneer.paymentMethods.easypaisa.easypaisaAccountNumber}\n\n3. **PayPal**:\n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n- To pay the 20% upfront, use any of the above methods.\n- The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\nSourav Auction Team`;
                console.log("SENDING EMAIL TO HIGHEST BIDDER");
                sendEmail({email:bidder.email,subject,message})
                }else{
                    await auction.save()
                }
            } catch (error) {
                return next(console.log(error || "Some error in ended auction crone"));
            
            }
        }
    })
}