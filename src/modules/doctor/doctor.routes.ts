import express from 'express';
import {
  appointmentCancled,
  appointmentComplete,
  appointmentsDoctor,
  doctorDashboard,
  doctorList,
  doctorProfile,
  loginDoctor,
  updateDoctorProfile,
} from './doctor.controller';
import { authDoctor } from '../../middlewares/auth.doctor.guard';
import { validateRequest } from '../../middlewares/validate.middleware';
import { doctorLoginSchema, appointmentActionSchema } from './doctor.validation';

const doctorRoutes = express.Router();

doctorRoutes.get('/list', doctorList);
doctorRoutes.post('/login', validateRequest(doctorLoginSchema), loginDoctor);
doctorRoutes.get('/appointments', authDoctor, appointmentsDoctor);
doctorRoutes.post(
  '/appointment-complete',
  authDoctor,
  validateRequest(appointmentActionSchema),
  appointmentComplete,
);
doctorRoutes.post(
  '/appointment-cancled',
  authDoctor,
  validateRequest(appointmentActionSchema),
  appointmentCancled,
);
doctorRoutes.post(
  '/appointment-cancelled',
  authDoctor,
  validateRequest(appointmentActionSchema),
  appointmentCancled,
);
doctorRoutes.post(
  '/cancel-appointment',
  authDoctor,
  validateRequest(appointmentActionSchema),
  appointmentCancled,
);

doctorRoutes.get('/dashboard', authDoctor, doctorDashboard);
doctorRoutes.get('/profile', authDoctor, doctorProfile);
doctorRoutes.post('/update-profile', authDoctor, updateDoctorProfile);

export default doctorRoutes;
