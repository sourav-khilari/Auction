import express from "express"
import { isAuthenticated,isAuthorized } from "../middlewares/auth.js"
import { 
    deleteAuction,
    daletePaymentProof,
    getAllPaymentProofs,
    getPaymentProofDetails,
    updateProofStatus, 
    fetchAllUsers,monthlyRevenue} from "../controllers/superAdminControllers.js"

const router=express.Router();



router.delete("/auctionitem/delete/:id",isAuthenticated,isAuthorized("Super Admin"),deleteAuction)

router.get("/paymentproofs/getall",isAuthenticated,isAuthorized("Super Admin"),getAllPaymentProofs);

router.get("/paymentproof/:id",isAuthenticated,isAuthorized("Super Admin"),getPaymentProofDetails);

router.put("/paymentproofs/status/update/:id",isAuthenticated,isAuthorized("Super Admin"),updateProofStatus);

router.delete("/paymentproofs/delete/:id",isAuthenticated,isAuthorized("Super Admin"),daletePaymentProof);

router.get("/users/getall",isAuthenticated,isAuthorized("Super Admin"),fetchAllUsers);

router.get("/monthlyincome",isAuthenticated,isAuthorized("Super Admin"),monthlyRevenue);


export default router;