import { Request, Response } from 'express';
import { catchAsync } from '../../middlewares/asyncWrapper';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);

export const addDoctor = catchAsync(async (req: Request, res: Response) => {
  const doctor = await adminService.addDoctor(req.body, req.file!);
  res.status(200).json({ success: true, message: 'Doctor added', Doctor: doctor });
});

export const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const token = await adminService.loginAdmin(req.body);
  res.status(200).json({ success: true, token });
});

export const allDoctors = catchAsync(async (_req: Request, res: Response) => {
  const doctors = await adminService.getAllDoctors();
  res.status(200).json({ success: true, doctors });
});

export const appointmentsAdmin = catchAsync(async (_req: Request, res: Response) => {
  const allAppointmentsData = await adminService.getAllAppointments();
  res.status(200).json({ success: true, allAppointmentsData });
});

export const appointmentCancellatiion = catchAsync(async (req: Request, res: Response) => {
  await adminService.cancelAppointment(req.body.appointmentId);
  res.status(200).json({ success: true, message: 'Appointment cancellation successful' });
});

export const adminDashboard = catchAsync(async (_req: Request, res: Response) => {
  const dashData = await adminService.getDashboard();
  res.status(200).json({ success: true, dashData });
});
