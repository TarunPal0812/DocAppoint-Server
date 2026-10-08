import { z } from 'zod';

export const doctorLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const appointmentActionSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
  }),
});
