import { z } from 'zod';

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const cancelAppointmentAdminSchema = z.object({
  body: z
    .object({
      appointmentId: z.string().optional(),
      id: z.string().optional(),
    })
    .refine((data) => data.appointmentId || data.id, {
      message: 'Appointment ID is required',
    }),
});

export const changeAvailabilitySchema = z.object({
  body: z.object({
    docId: z.string().min(1, 'Doctor ID is required'),
  }),
});
