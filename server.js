import express from "express"
import cors from "cors"
import "dotenv/config"

import { connectDB } from "./config/db.js"
import connectCloudinary from "./config/cloudinary.js"
import adminRouter from "./routes/admin.route.js"

// App config
const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json())

// Api Endpoints

app.use("/api/admin",adminRouter)



app.listen(PORT,()=>{
    connectDB()
    connectCloudinary()
    console.log("Surver is running..!!");
    
})