import express from "express"
import cors from "cors"
import "dotenv/config"

import { connectDB } from "./config/db.js"
import connectCloudinary from "./config/cloudinary.js"
import adminRouter from "./routes/admin.route.js"
import doctorRoutes from "./routes/doctor.route.js"
import userRoute from "./routes/user.route.js"

// App config
const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(
  cors({
    origin: [
      "https://docappoint-client.netlify.app",
      "https://docappoint-admin.netlify.app/",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json())


// Test route

app.get("/", (req, res) => {
    res.send("Welcome to the DocAppointment API")   
})

// API Endpoints for Admin

app.use("/api/admin",adminRouter)

// API Endpoints for Doctor

app.use("/api/doctor",doctorRoutes)

// API Endpoints for User

app.use("/api/user",userRoute)

app.listen(PORT,()=>{
    connectDB()
    connectCloudinary()
    console.log("Surver is running..!!");
    
})