

---

# 🏥 DocAppoint – Backend API

**DocAppoint** is a full-stack doctor appointment system that streamlines patient-doctor bookings, profile management, payments, and digital scheduling.

This is the **backend** built with `Node.js`, `Express`, `MongoDB`, `Cloudinary`, and `Razorpay`.

---

## 🔧 Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB + Mongoose
* **Auth**: JWT, bcrypt
* **Image Upload**: Cloudinary, Multer
* **Payments**: Razorpay
* **Utils**: dotenv, cors

---

## 📦 Folder Structure

```
docappoint-backend/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── config/
├── uploads/
└── server.js
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/TarunPal0812/docappoint-backend.git
cd docappoint-backend
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
```

### 3. Run the Server

```bash
npm run dev
```

---

## 🧪 API Documentation

All routes start with `/api/<role>` (user, doctor, admin)

---

## 👤 USER ROUTES – `/api/user`

### Register – `POST /register`

**Request:**

```json
{
  "name": "John",
  "email": "john@mail.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here"
}
```

---

### Login – `POST /login`

```json
{
  "email": "john@mail.com",
  "password": "123456"
}
```

---

### Get Profile – `GET /get-profile`

**Headers:** `Authorization: Bearer <token>`

```json
{
  "name": "John",
  "email": "john@mail.com",
  "appointments": []
}
```

---

### Update Profile – `POST /update-profile`

**Headers:** Form-data with image file + token

---

### Book Appointment – `POST /book-appointment`

```json
{
  "doctorId": "64c...",
  "date": "2025-07-24",
  "time": "11:30"
}
```

**Response:**

```json
{
  "success": true,
  "appointmentId": "abc123"
}
```

---

### List Appointments – `GET /appointments`

---

### Cancel Appointment – `POST /cancle-appointment`

```json
{
  "appointmentId": "abc123"
}
```

---

### Razorpay Payment – `POST /payment-razorpay`

```json
{
  "amount": 500
}
```

**Response:**

```json
{
  "order": {
    "id": "order_9A33XWu170gUtm",
    "amount": 500,
    "currency": "INR"
  }
}
```

---

### Verify Payment – `POST /verifyRazorpay`

```json
{
  "order_id": "order_9A33XWu170gUtm",
  "payment_id": "pay_29QQoUBi66xm2f",
  "signature": "generated_signature"
}
```

---

### Refund Payment – `POST /refund-payment`

```json
{
  "paymentId": "pay_29QQoUBi66xm2f"
}
```

---

## 🩺 DOCTOR ROUTES – `/api/doctor`

### Login – `POST /login`

```json
{
  "email": "doc@mail.com",
  "password": "secret"
}
```

---

### Get Appointments – `GET /appointments`

---

### Complete Appointment – `POST /appointment-complete`

```json
{
  "appointmentId": "abc123"
}
```

---

### Cancel Appointment – `POST /appointment-cancled`

```json
{
  "appointmentId": "abc123"
}
```

---

### Doctor Dashboard – `GET /dashboard`

Returns patient count, revenue, etc.

---

### Profile – `GET /profile`

---

### Update Profile – `POST /update-profile`

```json
{
  "about": "Updated doctor profile",
  "experience": "7 years"
}
```

---

## 👨‍⚕️ ADMIN ROUTES – `/api/admin`

### Login – `POST /login`

```json
{
  "email": "admin@mail.com",
  "password": "admin123"
}
```

---

### Add Doctor – `POST /add-doctor`

**Form Data with image + JSON body:**

```json
{
  "name": "Dr. Smith",
  "email": "smith@mail.com",
  "password": "123456",
  "speciality": "Cardiology",
  "degree": "MBBS",
  "experience": "10 years",
  "about": "Expert in heart care",
  "fees": 500,
  "address": "New Delhi"
}
```

---

### All Doctors – `GET /all-doctors`

---

### Change Availability – `POST /change-availability`

```json
{
  "doctorId": "64c...",
  "isAvailable": true
}
```

---

### Cancel Appointment (Admin) – `POST /cancel-appointments`

```json
{
  "appointmentId": "abc123"
}
```

---

### Dashboard – `GET /dashboard`

---

## 🔐 Auth Middlewares

* **authUser** – Validates user token
* **authDoctor** – Validates doctor token
* **authAdmin** – Validates admin token

---

## 📷 Image Upload

Handled via Multer middleware. Stored in Cloudinary via the `/config/cloudinary.js` integration.

---

## 💰 Payments

* Razorpay order creation, verification & refund is handled securely via backend.
* Routes: `/payment-razorpay`, `/verifyRazorpay`, `/refund-payment`

---

## 🧪 Testing

Use **Postman** or **Thunder Client**. Auth-protected routes require `Authorization: Bearer <token>` header.

---

## 📄 License

MIT © 2025 DocAppoint Team

---

