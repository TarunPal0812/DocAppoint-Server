import DoctorModel from "../models/doctors.model.js"

import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import fs from "fs";
import jwt from "jsonwebtoken"
import AppointmentModel from "../models/Appointment.model.js";
import UserModel from "../models/user.model.js";

// API for add Doctor

const addDoctor = async(req,res)=>{
    try {
       const { name,email,password,speciality,degree,experience,about,fees,address } = req.body
       const imageFile = req.file 

       if (!imageFile) {
        return res.status(400).json({ success: false, message: "Image file is missing" });
      }

       // Checking for all data to add doctor
       if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {

            return res.json({success:false,message:"Missing details"})
       }

       // validating email format

       if (!validator.isEmail(email)) {
        return res.json({success:false,message:"Please enter a valid email"})
       }

       // validating strong password

       if (password.length < 8 ) {
        return res.json({success:false,message:"Please enter a strong password"})
       }

       // Check the doctor already exist or not
       const existingDoctor = await DoctorModel.findOne({email:email})
       if (existingDoctor) {
        return res.json({success:false,message:"This email already exist"})
       }

       // Hash the Password 

       const salt = await bcrypt.genSalt(10)
       const hashPassword = await bcrypt.hash(password,salt)

       // Upload the img in the cloudinary

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

       // create the doctor and save it on the datebase

       const doctor = {
        name,
        email,
        image : imageUrl,
        password : hashPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        address : JSON.parse(address),
        date : Date.now()
    } 

    const newDoctor = new DoctorModel(doctor)
    await newDoctor.save()

    res.json({success:true,message:"Doctor added",Doctor:newDoctor}).status(200)
}catch (error) {
        console.log("Error:",error);
      res.json({success:false,message:error.message})   
}
}

// API for admin login

const loginAdmin = async (req,res) => {
    try {
        const { email,password } = req.body
        if (!email || !password) {
            return res.json({success:false,message:"Provide all details"})
        }
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({success:false,message:"Provide all details correctly"})
        }else{
            const token = jwt.sign(email+password,process.env.JWT_SECRET)

         return res.json({success:true,token:token}).status(200)
        }


    } catch (error) {
       console.log("Error:",error.message);
       res.json({success:false,message:"somethin went wrong"}).status(500)
        
    }
}

// API to get all doctors list for admin panel

const allDoctors = async(req,res)=>{
   try {
     const allDoctorsData = await DoctorModel.find({}).select("-password")
     return res.json({success:true,doctors:allDoctorsData}).status(200)
   } catch (error) {
    console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
    
   }
}

// API to get all appointments list

const appointmentsAdmin = async (req,res) => {
   try {
     const allAppointmentsData = await AppointmentModel.find({})
     return res.status(200).json({success:true,allAppointmentsData})
   } catch (error) {
    console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
    
   }
}

// API for appointment cancellation

const appointmentCancellatiion = async(req,res)=>{
  try {
     const { appointmentId } = req.body;

        const appointment = await AppointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
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
    console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
  }
}

// API to get dashboard data for admin panel

const adminDashboard = async(req,res)=>{
  try {

    const doctors = await DoctorModel.find({})
    const users = await UserModel.find({})
    const appointments = await AppointmentModel.find({})

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0,5)
    }

    
      return res.status(200).json({ success: true, dashData });
    
  } catch (error) {
    console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
  }
}

export {
    addDoctor,
    loginAdmin,
    allDoctors,
    appointmentsAdmin,
    appointmentCancellatiion,
    adminDashboard
}