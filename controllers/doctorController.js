import jwt  from "jsonwebtoken";
import DoctorModel from "../models/doctors.model.js";
import bcrypt from "bcrypt"
import AppointmentModel from "../models/Appointment.model.js";

const changeAvailability = async(req,res)=>{
    try {

        const { docId } = req.body

        const doctor = await DoctorModel.findById(docId)

        await DoctorModel.findByIdAndUpdate(docId,{available:!doctor.available})

        return res.json({success:true,message:'Availability Changed'}).status(200)
        
    } catch (error) {
        console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

const doctorList = async(req,res)=>{
    try {

        const doctors = await DoctorModel.find({}).select(['-password','-email'])

        return res.json({success:true,doctors:doctors}).status(200)
        
    } catch (error) {
        console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

// API for Doctor login

const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Provide all details" });
        }

        const doctorData = await DoctorModel.findOne({ email });

        if (!doctorData) {
            return res.status(404).json({ success: false, message: "No Doctor found" });
        }

        const isMatch = await bcrypt.compare(password, doctorData.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: doctorData._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({ success: true, token });

    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

// API to get doctor appointments for doctor panel

const appointmentsDoctor = async (req,res) => {
    try {

        const { docId } = req.doc
        const appointments = await AppointmentModel.find({docId})

        return res.status(200).json({ success: true, appointments });
        
    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// API to mark appointment completed for doctor panel

const appointmentComplete = async (req,res) => {
    try {

        const { appointmentId } = req.body
        const { docId } = req.doc

        const appointment = await AppointmentModel.findById(appointmentId)

        if (appointment && appointment.docId === docId) {
            await AppointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})

             return res.status(200).json({ success: true, message:"Appointment Completed" });
        }else{
             return res.status(400).json({ success: false, message:"Mark Failed" });
        }

    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// API to mark appointment cancled for doctor panel

const appointmentCancled = async (req,res) => {
    try {

        const { appointmentId } = req.body
        const { docId } = req.doc

        const appointment = await AppointmentModel.findById(appointmentId)

        if (appointment && appointment.docId === docId) {
            await AppointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

             return res.status(200).json({ success: true, message:"Appointment Cancled" });
        }else{
             return res.status(400).json({ success: false, message:"Cancellation Failed" });
        }
           
    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// API to get dashboard data for doctor panel

const doctorDashboard = async (req,res)=>{
    try {
        const { docId } = req.doc
        const appointments  = await AppointmentModel.find({docId})

        let earning = 0
        appointments.map((item)=>{
            if (item.isCompleted || item.payment) {
                earning += item.amount
            }
        })

        let patients = []

        appointments.map((item)=>{
            if (!patients.includes(item.userId)) {
                
                patients.push(item.userId)
            }
        })

        const dasData = {
            earning,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointmets: appointments.reverse().slice(0,5)
        }

        return res.status(200).json({ success: true, dasData });
        
    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}


// API to get doctor profile for Doctor Panel

const doctorProfile = async (req,res) => {
    try {

        const { docId } = req.doc

        const doctorData = await DoctorModel.findById(docId).select("-password")
        return res.status(200).json({ success: true, doctorData });
        
    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// API to update doctor profile data from Doctor Panel

const updateDoctorProfile = async (req,res) => {
    try {

        const { fees, address, available } = req.body
        const { docId } = req.doc

        const doctorData = await DoctorModel.findByIdAndUpdate(docId,{fees,available,address})
        return res.status(200).json({ success: true, message: "Update details successfully" });
        
    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}


export{
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancled,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}