import DoctorModel from "../models/doctors.model.js"

import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import fs from "fs";
import jwt from "jsonwebtoken"

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

export {
    addDoctor,
    loginAdmin
}