import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { connectDB } from "./config/db.js";
import DoctorModel from "./models/doctors.model.js";

const seedDoctors = [
  {
    name: "Dr. Aanya Sharma",
    email: "aanya.sharma@docappoint.com",
    speciality: "General physician",
    degree: "MBBS, MD",
    experience: "4 Years",
    about: "Dr. Aanya Sharma is a dedicated general physician with a patient-first approach. She specializes in preventive care, chronic disease management, and health screenings.",
    fees: 500,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    address: { line1: "27, MG Road", line2: "Connaught Place, New Delhi" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Rohan Mehta",
    email: "rohan.mehta@docappoint.com",
    speciality: "Gynecologist",
    degree: "MBBS, MS (OBG)",
    experience: "3 Years",
    about: "Dr. Rohan Mehta is an experienced gynecologist committed to women's health. He offers comprehensive care from routine check-ups to complex gynecological conditions.",
    fees: 600,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    address: { line1: "14, Park Street", line2: "Kolkata, West Bengal" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Priya Nair",
    email: "priya.nair@docappoint.com",
    speciality: "Dermatologist",
    degree: "MBBS, MD (Dermatology)",
    experience: "1 Year",
    about: "Dr. Priya Nair is a passionate dermatologist who treats a wide range of skin conditions including acne, eczema, and psoriasis using the latest clinical techniques.",
    fees: 450,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    address: { line1: "8, Brigade Road", line2: "Bangalore, Karnataka" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Vikram Iyer",
    email: "vikram.iyer@docappoint.com",
    speciality: "Pediatricians",
    degree: "MBBS, DCH",
    experience: "2 Years",
    about: "Dr. Vikram Iyer is a compassionate pediatrician who provides comprehensive child healthcare from newborns to teenagers, with a focus on developmental milestones.",
    fees: 550,
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    address: { line1: "3, Anna Salai", line2: "Chennai, Tamil Nadu" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Meera Joshi",
    email: "meera.joshi@docappoint.com",
    speciality: "Neurologist",
    degree: "MBBS, DM (Neurology)",
    experience: "4 Years",
    about: "Dr. Meera Joshi is a skilled neurologist specializing in headaches, epilepsy, stroke, and neurodegenerative disorders. She provides personalized neurological care.",
    fees: 800,
    image: "https://randomuser.me/api/portraits/women/21.jpg",
    address: { line1: "52, FC Road", line2: "Pune, Maharashtra" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Arjun Kapoor",
    email: "arjun.kapoor@docappoint.com",
    speciality: "Neurologist",
    degree: "MBBS, MD, DM",
    experience: "4 Years",
    about: "Dr. Arjun Kapoor focuses on clinical neurology with special interest in dementia, Parkinson's disease, and movement disorders. Known for empathetic patient care.",
    fees: 750,
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    address: { line1: "9, Banjara Hills", line2: "Hyderabad, Telangana" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Sneha Rao",
    email: "sneha.rao@docappoint.com",
    speciality: "Gastroenterologist",
    degree: "MBBS, MD, DM (Gastro)",
    experience: "4 Years",
    about: "Dr. Sneha Rao is an expert gastroenterologist treating digestive disorders including IBS, GERD, liver disease, and inflammatory bowel conditions.",
    fees: 700,
    image: "https://randomuser.me/api/portraits/women/35.jpg",
    address: { line1: "21, Jubilee Hills", line2: "Hyderabad, Telangana" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Kiran Patel",
    email: "kiran.patel@docappoint.com",
    speciality: "General physician",
    degree: "MBBS, MD (Internal Medicine)",
    experience: "3 Years",
    about: "Dr. Kiran Patel is a general physician with a holistic approach to internal medicine. He handles acute illnesses, chronic conditions, and preventive health screenings.",
    fees: 400,
    image: "https://randomuser.me/api/portraits/men/12.jpg",
    address: { line1: "77, CG Road", line2: "Ahmedabad, Gujarat" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Anjali Desai",
    email: "anjali.desai@docappoint.com",
    speciality: "Gynecologist",
    degree: "MBBS, MS, DNB",
    experience: "2 Years",
    about: "Dr. Anjali Desai specializes in obstetrics and gynecology with a focus on high-risk pregnancies, infertility, and minimally invasive surgical procedures.",
    fees: 650,
    image: "https://randomuser.me/api/portraits/women/57.jpg",
    address: { line1: "5, Law College Road", line2: "Pune, Maharashtra" },
    available: true,
    date: Date.now(),
  },
  {
    name: "Dr. Rahul Verma",
    email: "rahul.verma@docappoint.com",
    speciality: "Dermatologist",
    degree: "MBBS, MD (Skin & VD)",
    experience: "1 Year",
    about: "Dr. Rahul Verma is a dermatologist who treats skin, hair, and nail disorders. He specializes in cosmetic dermatology, hair loss treatment, and laser therapies.",
    fees: 500,
    image: "https://randomuser.me/api/portraits/men/29.jpg",
    address: { line1: "18, Linking Road", line2: "Mumbai, Maharashtra" },
    available: true,
    date: Date.now(),
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Wait a moment for the connection to be established
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const existingCount = await DoctorModel.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} doctor(s). Clearing and re-seeding...`);
      await DoctorModel.deleteMany({});
    }

    const defaultPassword = "Doctor@1234";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const doctorsWithPassword = seedDoctors.map((doc) => ({
      ...doc,
      password: hashedPassword,
    }));

    await DoctorModel.insertMany(doctorsWithPassword);

    console.log("✅ Successfully seeded 10 doctors!");
    console.log(`📧 All doctor accounts use password: ${defaultPassword}`);
    console.log("🏥 Specialities added:");
    const specialities = [...new Set(seedDoctors.map((d) => d.speciality))];
    specialities.forEach((s) => console.log(`   • ${s}`));
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database.");
    process.exit(0);
  }
};

seed();
