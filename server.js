import express from "express"
import cors from "cors"
import "dotenv/config"
import cron from "node-cron"

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
      "https://docappoint-admin.netlify.app",
      "http://localhost:5173",
      "http://localhost:5174",
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

// Wakeup route for external cron jobs
app.get("/api/wakeup", (req, res) => {
    console.log("Wakeup API hit!");
    res.status(200).json({ success: true, message: "Server is awake!" });
});

// Self-pinging cron job to keep the server alive on free hosting
// It pings the server's own URL every 14 minutes
cron.schedule("*/14 * * * *", () => {
    const url = process.env.SERVER_URL || `http://localhost:${PORT}`;
    fetch(url)
        .then(res => console.log(`[Cron Job] Server pinged successfully at ${new Date().toISOString()}`))
        .catch(err => console.error(`[Cron Job] Error pinging server:`, err.message));
});

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