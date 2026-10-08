import express from 'express';
import {
  addDoctor,
  adminDashboard,
  allDoctors,
  appointmentsAdmin,
  loginAdmin,
  appointmentCancellatiion,
} from './admin.controller';
import { upload } from '../../middlewares/upload.middleware';
import { authAdmin } from '../../middlewares/auth.admin.guard';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  adminLoginSchema,
  cancelAppointmentAdminSchema,
  changeAvailabilitySchema,
} from './admin.validation';
import { changeAvailability } from '../doctor/doctor.controller';

const adminRouter = express.Router();

adminRouter.post('/login', validateRequest(adminLoginSchema), loginAdmin);
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
adminRouter.get('/all-doctors', authAdmin, allDoctors);
adminRouter.post(
  '/change-availability',
  authAdmin,
  validateRequest(changeAvailabilitySchema),
  changeAvailability,
);
adminRouter.get('/appointments', authAdmin, appointmentsAdmin);
adminRouter.post(
  '/cancel-appointments',
  authAdmin,
  validateRequest(cancelAppointmentAdminSchema),
  appointmentCancellatiion,
);
adminRouter.get('/dashboard', authAdmin, adminDashboard);

export default adminRouter;
