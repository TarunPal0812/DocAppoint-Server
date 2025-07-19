import validator from "validator"
import UserModel from "../models/user.model.js"
import bcrypt from "bcrypt"
import Jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary"
import fs from "fs";
import DoctorModel from "../models/doctors.model.js"
import AppointmentModel from "../models/Appointment.model.js"
import razorpay from "razorpay"


// API to register user

const registerUser = async(req,res)=>{
    try {

        const { name,email,password } = req.body

        if (!name || !email || !password) {
            return res.json({success:false,message:"Missing details"})
        }

        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Missing details"})
        }

        if(password.length < 8){
            return res.json({success:false,message:"Enter a strong password"})
        }

        const existUser = await UserModel.findOne({email:email})

        if (existUser) {
            return res.json({success:false,message:"This email already exist enter another one"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt) 

        const User = {
            name,
            email,
            password:hashPassword
        }

        const newUser = new UserModel(User)
        const user = await newUser.save()
        
        // Generate the token with the help of JWT

        const token = Jwt.sign({id:user._id},process.env.JWT_SECRET)


        return res.json({success:true,message:"Registration Successfull",token}).status(200) 
    } catch (error) {
        console.log("Error:",error.message);
        res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

// API for user login

const loginUser = async(req,res)=>{
    try {
        
        const { email,password } = req.body
        if (!email || !password) {
            return res.json({success:false,message:"Missing details"})
        }

        const user = await UserModel.findOne({email})

        if (!user) {
            return res.json({success:false,message:"Invalid cradential"})
        }

        const passwordCheck = await bcrypt.compare(password,user.password)

        if (!passwordCheck) {
            return res.json({success:false,message:"Invalid cradential"})
        }


        const token = Jwt.sign({id:user._id},process.env.JWT_SECRET)


        return res.json({success:true,message:"Login successfull",token}).status(200) 

    } catch (error) {
        console.log("Error:",error.message);
        res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

// API to get user Profile data

const getProfile = async (req,res)=>{
    try {

        const { userId } = req.user

        const userProfile = await UserModel.findById(userId).select("-password")

        return res.json({success:true, userProfile}).status(200) 
        
    } catch (error) {
        console.log("Error:",error.message);
        res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

// API to update user profile

const updateProfile = async(req,res)=>{
    try {
        const { userId } = req.user
        const { name,phone,address,dob,gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
           return res.json({success:false,message:"Data Missing"}) 
        }

        await UserModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

        if (imageFile) {
            // Upload image to cloudinary

                   const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
                   const imageUrl = imageUpload.secure_url
            
                   // Delete the local file
            
            fs.unlink(imageFile.path, (err) => {
                if (err) {
                  console.error("Error deleting local file:", err);
                } else {
                  console.log("Local file deleted successfully");
                }
              });

              await UserModel.findByIdAndUpdate(userId,{image:imageUrl})

        }

        return res.json({success:true,message:"Profile updated" }).status(200)

        
    } catch (error) {
        console.log("Error:",error.message);
        res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

// API to book the appointment

const bookAppointment = async (req,res) => {
    try {

        const { userId } = req.user
        const { docId,slotDate,slotTime } = req.body

        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: "Missing appointment details" });
          }

        const docData = await DoctorModel.findById(docId).select("-password")

        if (!docData.available) {
           return res.json({success:false,message:"Doctor is not availble"}).status(500)
        }

        let slots_booked = docData.slots_booked
        
        // Checking for slot availability

        if(slots_booked[slotDate]){
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({success:false,message:"Slot not available"}).status(500)
            }else{
               slots_booked[slotDate].push(slotTime) 
            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await UserModel.findById(userId).select("-password")

        
        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            data: Date.now()
        }

        const newAppointment = new AppointmentModel(appointmentData)

        await newAppointment.save()

        // Save new slots data in docData

        await DoctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:"Appointment Booked"})
        
    } catch (error) {
        console.log("Error:",error.message);
        res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

// API to get user appointments

const listAppointment = async (req,res) => {
    try {

        const { userId } = req.user

        const appointments = await AppointmentModel.find({userId})
               
        res.json({success:true,appointments})
        
    } catch (error) {
        console.log("Error:",error.message);
        res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

// API to cancel appointment


const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const { userId } = req.user;

        const appointment = await AppointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized action" });
        }

        await AppointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Releasing doctor slot
        const { docId, slotDate, slotTime } = appointment;

        const doctorData = await DoctorModel.findById(docId);
        if (!doctorData) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        let slots_booked = doctorData.slots_booked;

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
        }

        await DoctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.status(200).json({ success: true, message: "Appointment cancellation successful" });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

// API to make payment of the appointment using razorpay

const razorpayInstance = new razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
})

const paymentRazorpay = async(req,res)=>{
    try {

        const { appointmentId } = req.body

        
        

        const appointmentData = await AppointmentModel.findById(appointmentId)
         if (!appointmentData || appointmentData.cancelled) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        // Creating options for razorpay payment

        const options = {
            amount: appointmentData.amount*100,
            currency: process.env.CURRENCY,
            receipt: appointmentId
        }

        // Creation of an order

        const order = await razorpayInstance.orders.create(options)

        res.status(200).json({ success: true, order})
        
        
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// API to verify payment razorpay

const verifyRazorpay = async (req,res) => {
    try {
        
        const { 
razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        // console.log(orderInfo);
        
        
        if (orderInfo.status === "paid") {
            
            await AppointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})

            res.status(200).json({ success: true,message:"Payment Successfull"})
        }else{
             res.status(200).json({ success: false,message:"Payment faild"})
        }
        

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// API to refund the money if cancled to booking

const refundPayment = async (req,res) => {
  try {
    const{ razorpay_payment_id
 } = req.body
    const refund = await razorpayInstance.payments.refund(razorpay_payment_id, {
      speed: "normal",
      notes: {
        reason: "Appointment canceled"
      }
    });

   console.log(refund);
   
    
    
  } catch (error) {
     console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong" });
  }
};






export{
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    refundPayment
}