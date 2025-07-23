# DocAppoint Backend Documentation

## Overview

The **DocAppoint** backend is a robust and scalable RESTful API built using **Node.js** and **Express.js**. It serves as the backbone for managing users, doctors, appointments, and admin functionalities. The backend integrates with **MongoDB** for data storage, **Cloudinary** for image uploads, and **Razorpay** for payment processing.

---

## Features

- **User Management**: Registration, login, profile management, and appointment booking.
- **Doctor Management**: Doctor login, profile updates, and appointment handling.
- **Admin Panel**: Manage doctors, appointments, and dashboard analytics.
- **Payment Integration**: Razorpay for secure payment processing.
- **Image Uploads**: Cloudinary for storing and managing images.
- **Authentication**: Secure JWT-based authentication for users, doctors, and admins.

---

## Tech Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **Cloudinary**: Image storage
- **Razorpay**: Payment gateway
- **JWT**: Authentication
- **Multer**: File uploads
- **dotenv**: Environment variable management

---

## Project Structure

```
docappoint-backend
│
├── config
│   ├── db.js
│   └── cloudinary.js
│
├── controllers
│   ├── userController.js
│   ├── doctorController.js
│   └── adminController.js
│
├── middleware
│   ├── authMiddleware.js
│   └── errorMiddleware.js
│
├── models
│   ├── userModel.js
│   ├── doctorModel.js
│   └── appointmentModel.js
│
├── routes
│   ├── userRoutes.js
│   ├── doctorRoutes.js
│   └── adminRoutes.js
│
├── uploads
│   └── profilePics
│
├── .env
├── .gitignore
├── package.json
└── server.js
```

- **config/**: Configuration files for database and cloudinary.
- **controllers/**: Request handlers for users, doctors, and admins.
- **middleware/**: Custom middleware for authentication and error handling.
- **models/**: Mongoose models for users, doctors, and appointments.
- **routes/**: Express routes for user, doctor, and admin endpoints.
- **uploads/**: Directory for storing uploaded profile pictures.
- **.env**: Environment variables.
- **.gitignore**: Git ignore file.
- **package.json**: Project metadata and dependencies.
- **server.js**: Entry point of the application.

---

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/docappoint-backend.git
   ```

2. Navigate to the project directory:

   ```bash
   cd docappoint-backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables in a `.env` file. Refer to `.env.example` for the required variables.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. The server will run on `http://localhost:5000` by default.

---

## API Documentation

### User Endpoints

- **Register**: `POST /api/users/register`
- **Login**: `POST /api/users/login`
- **Profile**: `GET /api/users/profile`
- **Book Appointment**: `POST /api/users/appointment`

### Doctor Endpoints

- **Login**: `POST /api/doctors/login`
- **Profile**: `GET /api/doctors/profile`
- **Appointments**: `GET /api/doctors/appointments`

### Admin Endpoints

- **Login**: `POST /api/admin/login`
- **Dashboard**: `GET /api/admin/dashboard`
- **Manage Doctors**: `CRUD /api/admin/doctors`
- **Manage Appointments**: `CRUD /api/admin/appointments`

### Payment

- **Order**: `POST /api/payment/order`
- **Payment Verification**: `POST /api/payment/verify`

### Image Upload

- **Upload**: `POST /api/upload`

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`
3. Make your changes.
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/YourFeature`
6. Submit a pull request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Node.js** and **Express.js** for the backend framework.
- **MongoDB** and **Mongoose** for the database.
- **Cloudinary** for image storage.
- **Razorpay** for payment processing.
- **JWT** for authentication.
- **Multer** for file uploads.
- OpenAI for providing the AI assistance in documentation.

---

## Contact

For any inquiries, please contact:

- **Tarun Pal**: [tarunpal0812@example.com](mailto:tarunpal0812@example.com)
- **GitHub**: [TarunPal0812](https://github.com/TarunPal0812)
