import { AdminRepository } from './admin.repository';
import { TokenUtil } from '../../utils/token.util';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../../utils/AppError';
import { HashUtil } from '../../utils/hash.util';
import { logger } from '../../utils/logger';
import validator from 'validator';
import fs from 'fs';

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async addDoctor(bodyData: Record<string, string>, imageFile: Express.Multer.File) {
    const { name, email, password, speciality, degree, experience, about, fees, address } =
      bodyData;

    if (!imageFile) throw new AppError('Image file is missing', 400);
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      throw new AppError('Missing details', 400);
    }
    if (!validator.isEmail(email)) throw new AppError('Please enter a valid email', 400);
    if (password.length < 8) throw new AppError('Please enter a strong password', 400);

    const existingDoctor = await this.adminRepository.findDoctorByEmail(email);
    if (existingDoctor) throw new AppError('This email already exist', 400);

    const hashPassword = await HashUtil.hash(password);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: 'image',
    });
    const imageUrl = imageUpload.secure_url;

    fs.unlink(imageFile.path, (err) => {
      if (err) logger.error('Error deleting local file:', { error: err });
    });

    const doctor = {
      name,
      email,
      image: imageUrl,
      password: hashPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    return this.adminRepository.createDoctor(doctor);
  }

  async loginAdmin(credentials: Record<string, string>) {
    const { email, password } = credentials;
    if (!email || !password) throw new AppError('Provide all details', 400);
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      throw new AppError('Provide all details correctly', 400);
    }

    return TokenUtil.signToken(email + password);
  }

  async getAllDoctors() {
    return this.adminRepository.findAllDoctors();
  }

  async getAllAppointments() {
    return this.adminRepository.findAllAppointments();
  }

  async cancelAppointment(appointmentId: string) {
    const appointment = await this.adminRepository.findAppointmentById(appointmentId);
    if (!appointment) throw new AppError('Appointment not found', 404);

    await this.adminRepository.updateAppointment(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointment;
    if (docId) {
      const doctorData = await this.adminRepository.findDoctorById(docId);
      if (doctorData) {
        const slots_booked = { ...(doctorData.slots_booked || {}) };
        if (slots_booked[slotDate]) {
          slots_booked[slotDate] = (slots_booked[slotDate] as string[]).filter(
            (e: string) => e !== slotTime,
          );
          await this.adminRepository.updateDoctor(docId, { slots_booked });
        }
      }
    }
  }

  async getDashboard() {
    const doctors = await this.adminRepository.countDoctors();
    const patients = await this.adminRepository.countUsers();
    const appointments = await this.adminRepository.getDashboardAppointments();

    return {
      doctors,
      patients,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
  }
}
