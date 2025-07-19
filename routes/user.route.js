import express from "express"
import { bookAppointment, cancelAppointment, getProfile, listAppointment, loginUser, paymentRazorpay, refundPayment, registerUser, updateProfile, verifyRazorpay } from "../controllers/userController.js"
import { authUser } from "../middlewares/authUser.js"
import upload from "../middlewares/multer.js"


const userRoute = express.Router()

userRoute.post("/register",registerUser)
userRoute.post("/login",loginUser)
userRoute.get("/get-profile",authUser,getProfile)
userRoute.post("/update-profile",upload.single("image"),authUser,updateProfile)
userRoute.post("/book-appointment",authUser,bookAppointment)
userRoute.get("/appointments",authUser,listAppointment)
userRoute.post("/cancle-appointment",authUser,cancelAppointment)
userRoute.post("/payment-razorpay",authUser,paymentRazorpay)
userRoute.post("/verifyRazorpay",authUser,verifyRazorpay)
userRoute.post("/refund-payment",authUser,refundPayment)


export default userRoute