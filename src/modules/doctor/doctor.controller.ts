import { Request, Response } from 'express';
import { catchAsync } from '../../middlewares/asyncWrapper';
import { DoctorService } from './doctor.service';
import { DoctorRepository } from './doctor.repository';

const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);

export const changeAvailability = catchAsync(async (req: Request, res: Response) => {
  await doctorService.changeAvailability(req.body.docId);
  res.status(200).json({ success: true, message: 'Availability Changed' });
});

export const doctorList = catchAsync(async (_req: Request, res: Response) => {
  const doctors = await doctorService.getDoctorList();
  res.status(200).json({ success: true, doctors });
});

export const loginDoctor = catchAsync(async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ success: false, message: 'Provide all details' });
  }
  const token = await doctorService.loginDoctor(req.body);
  res.status(200).json({ success: true, token });
});

export const appointmentsDoctor = catchAsync(
  async (req: Request & { doc: { docId: string } }, res: Response) => {
    const appointments = await doctorService.getAppointments(req.doc.docId);
    res.status(200).json({ success: true, appointments });
  },
);

export const appointmentComplete = catchAsync(
  async (req: Request & { doc: { docId: string } }, res: Response) => {
    await doctorService.markAppointmentComplete(req.doc.docId, req.body.appointmentId);
    res.status(200).json({ success: true, message: 'Appointment Completed' });
  },
);

export const appointmentCancled = catchAsync(
  async (req: Request & { doc: { docId: string } }, res: Response) => {
    await doctorService.cancelAppointment(req.doc.docId, req.body.appointmentId);
    res.status(200).json({ success: true, message: 'Appointment Cancled' });
  },
);

export const doctorDashboard = catchAsync(
  async (req: Request & { doc: { docId: string } }, res: Response) => {
    const dasData = await doctorService.getDashboard(req.doc.docId);
    res.status(200).json({ success: true, dasData });
  },
);

export const doctorProfile = catchAsync(
  async (req: Request & { doc: { docId: string } }, res: Response) => {
    const doctorData = await doctorService.getProfile(req.doc.docId);
    res.status(200).json({ success: true, doctorData });
  },
);

export const updateDoctorProfile = catchAsync(
  async (req: Request & { doc: { docId: string } }, res: Response) => {
    await doctorService.updateProfile(req.doc.docId, req.body);
    res.status(200).json({ success: true, message: 'Update details successfully' });
  },
);
