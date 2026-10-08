import { Request, Response } from 'express';
import { catchAsync } from '../../middlewares/asyncWrapper';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const token = await userService.registerUser(req.body);
  res.status(201).json({ success: true, token });
});

export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const token = await userService.loginUser(req.body);
  res.status(200).json({ success: true, token });
});

export const getProfile = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    const userProfile = await userService.getProfile(req.user.userId);
    res.status(200).json({ success: true, userProfile });
  },
);

export const updateProfile = catchAsync(
  async (
    req: Request & { user: { userId: string }; file?: Express.Multer.File },
    res: Response,
  ) => {
    await userService.updateProfile(req.user.userId, req.body, req.file);
    res.status(200).json({ success: true, message: 'Profile updated' });
  },
);

export const bookAppointment = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    await userService.bookAppointment(req.user.userId, req.body);
    res.status(200).json({ success: true, message: 'Appointment Booked..!!' });
  },
);

export const listAppointment = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    const appointments = await userService.listAppointment(req.user.userId);
    res.status(200).json({ success: true, appointments });
  },
);

export const cancelAppointment = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    await userService.cancelAppointment(req.user.userId, req.body.appointmentId);
    res.status(200).json({ success: true, message: 'Appointment cancellation successful' });
  },
);

export const paymentRazorpay = catchAsync(async (req: Request, res: Response) => {
  const order = await userService.paymentRazorpay(req.body.appointmentId);
  res.status(200).json({ success: true, order });
});

export const verifyRazorpay = catchAsync(async (req: Request, res: Response) => {
  const isPaid = await userService.verifyRazorpay(req.body.razorpay_order_id);
  if (isPaid) {
    res.status(200).json({ success: true, message: 'Payment Successfull' });
  } else {
    res.status(200).json({ success: false, message: 'Payment faild' });
  }
});

export const refundPayment = catchAsync(async (req: Request, res: Response) => {
  await userService.refundPayment(req.body.razorpay_payment_id);
  res.status(200).json({ success: true, message: 'Refund initiated' });
});
