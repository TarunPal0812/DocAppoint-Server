import express from 'express';
import {
  bookAppointment,
  cancelAppointment,
  getProfile,
  listAppointment,
  loginUser,
  paymentRazorpay,
  refundPayment,
  registerUser,
  updateProfile,
  verifyRazorpay,
} from './user.controller';
import { authUser } from '../../middlewares/auth.user.guard';
import { upload } from '../../middlewares/upload.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { registerUserSchema, loginUserSchema } from './user.validation';

const userRoute = express.Router();

userRoute.post('/register', validateRequest(registerUserSchema), registerUser);
userRoute.post('/login', validateRequest(loginUserSchema), loginUser);
userRoute.get('/get-profile', authUser, getProfile);
userRoute.post('/update-profile', upload.single('image'), authUser, updateProfile);
userRoute.post('/book-appointment', authUser, bookAppointment);
userRoute.get('/appointments', authUser, listAppointment);
userRoute.post('/cancle-appointment', authUser, cancelAppointment);
userRoute.post('/cancel-appointment', authUser, cancelAppointment);

userRoute.post('/payment-razorpay', authUser, paymentRazorpay);
userRoute.post('/verifyRazorpay', authUser, verifyRazorpay);
userRoute.post('/refund-payment', authUser, refundPayment);

export default userRoute;
