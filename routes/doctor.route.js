import express from "express"
import { appointmentCancled, appointmentComplete, appointmentsDoctor, doctorDashboard, doctorList, doctorProfile, loginDoctor, updateDoctorProfile } from "../controllers/doctorController.js"
import { authDoctor } from "../middlewares/authDoctor.js"

const doctorRoutes = express.Router()

doctorRoutes.get("/list",doctorList)
doctorRoutes.post("/login",loginDoctor)
doctorRoutes.get("/appointments",authDoctor,appointmentsDoctor)
doctorRoutes.post("/appointment-complete",authDoctor,appointmentComplete)
doctorRoutes.post("/appointment-cancled",authDoctor,appointmentCancled)
doctorRoutes.get("/dashboard",authDoctor,doctorDashboard)
doctorRoutes.get("/profile",authDoctor,doctorProfile)
doctorRoutes.post("/update-profile",authDoctor,updateDoctorProfile)



export default doctorRoutes