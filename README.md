# DocAppoint - Backend API

**DocAppoint** is a comprehensive, production-ready doctor appointment booking system. This repository contains the backend REST API that handles authentication, scheduling, payments, and data management for both the Patient Portal and the Admin/Doctor Dashboard.

---

## Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt password hashing
- **Media Storage:** Cloudinary (integrated via Multer)
- **Payment Gateway:** Razorpay
- **Security & Utils:** CORS, Dotenv, Validator

---

## Project Structure

```text
backend/
├── config/           # Database and Cloudinary configurations
├── controllers/      # Route controllers (admin, doctor, user)
├── middlewares/      # Auth validation (authUser, authAdmin, authDoctor) & Multer
├── models/           # Mongoose schemas (Appointment, Doctor, User)
├── routes/           # API route definitions
├── uploads/          # Temporary local storage for image uploads
├── seed.js           # Database seeding script for sample doctors
└── server.js         # Entry point and Express app setup
```

---

## Setup & Installation

### 1. Clone & Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `backend` directory with the following variables:

```env
PORT=3001
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0..."

# Cloudinary Storage
CLOUDINARY_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_SECRET_KEY="your_secret_key"

# Admin Credentials
ADMIN_EMAIL="admin@gmail.com"
ADMIN_PASSWORD="admin"

# Security
JWT_SECRET="your_secure_jwt_secret"

# Razorpay Integration
KEY_ID="rzp_test_..."
KEY_SECRET="..."
CURRENCY="INR"
```

### 3. Database Seeding (Optional)
To quickly populate the database with sample doctors across various specializations:
```bash
npm run seed
```
*(All seeded doctors use the password `Doctor@1234`)*

### 4. Start the Server
```bash
# Starts the server using nodemon for development
npm run start 
```

The server will be running on `http://localhost:3001`.

---

## Live Deployment

- **Production API URL:** https://docappoint-server-eyak.onrender.com

---

## Core API Endpoints

### User Endpoints (/api/user)
- `POST /register` - Register a new patient
- `POST /login` - Patient login
- `GET /get-profile` - Fetch patient profile
- `POST /update-profile` - Update profile & avatar
- `POST /book-appointment` - Schedule a new appointment
- `GET /appointments` - List patient's appointments
- `POST /cancle-appointment` - Cancel an appointment
- `POST /payment-razorpay` - Create Razorpay order
- `POST /verifyRazorpay` - Verify payment signature

### Doctor Endpoints (/api/doctor)
- `POST /login` - Doctor login
- `GET /appointments` - List assigned appointments
- `POST /appointment-complete` - Mark appointment as completed
- `POST /appointment-cancled` - Cancel an appointment
- `GET /dashboard` - Doctor analytics dashboard
- `GET /profile` - Fetch doctor profile
- `POST /update-profile` - Update doctor profile

### Admin Endpoints (/api/admin)
- `POST /login` - Admin login
- `POST /add-doctor` - Register a new doctor with image upload
- `GET /all-doctors` - List all registered doctors
- `POST /change-availability` - Toggle doctor availability
- `GET /appointments` - View all system appointments
- `POST /cancel-appointments` - Admin cancellation
- `GET /dashboard` - System-wide analytics dashboard

---

## License
MIT License
