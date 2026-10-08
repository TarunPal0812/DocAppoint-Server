import { DoctorRepository } from './doctor.repository';
import { HashUtil } from '../../utils/hash.util';
import { TokenUtil } from '../../utils/token.util';
import { AppError } from '../../utils/AppError';

export class DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async changeAvailability(docId: string) {
    const doctor = await this.doctorRepository.findById(docId);
    if (!doctor) throw new AppError('Doctor not found', 404);
    await this.doctorRepository.updateDoctor(docId, { available: !doctor.available });
  }

  async getDoctorList() {
    return this.doctorRepository.findAllWithoutSensitive();
  }

  async loginDoctor(credentials: Record<string, string>) {
    const { email, password } = credentials;
    const doctor = await this.doctorRepository.findByEmail(email);
    if (!doctor) throw new AppError('No Doctor found', 404);

    const isMatch = await HashUtil.compare(password, doctor.password);
    if (!isMatch) throw new AppError('Invalid email or password', 400);

    return TokenUtil.signToken({ id: doctor._id }, '1d');
  }

  async getAppointments(docId: string) {
    return this.doctorRepository.findAppointmentsByDoctorId(docId);
  }

  async markAppointmentComplete(docId: string, appointmentId: string) {
    const appointment = await this.doctorRepository.findAppointmentById(appointmentId);
    if (appointment?.docId === docId) {
      await this.doctorRepository.updateAppointment(appointmentId, { isCompleted: true });
    } else {
      throw new AppError('Mark Failed', 400);
    }
  }

  async cancelAppointment(docId: string, appointmentId: string) {
    const appointment = await this.doctorRepository.findAppointmentById(appointmentId);
    if (appointment?.docId === docId) {
      await this.doctorRepository.updateAppointment(appointmentId, { cancelled: true });
    } else {
      throw new AppError('Cancellation Failed', 400);
    }
  }

  async getDashboard(docId: string) {
    const appointments = await this.doctorRepository.findAppointmentsByDoctorId(docId);
    let earning = 0;
    const patients: string[] = [];

    appointments.forEach((docItem: unknown) => {
      const item = docItem as {
        isCompleted?: boolean;
        payment?: boolean;
        amount: number;
        userId: string;
      };
      if (item.isCompleted || item.payment) {
        earning += item.amount;
      }
      if (!patients.includes(item.userId.toString())) {
        patients.push(item.userId.toString());
      }
    });

    return {
      earning,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointmets: appointments.reverse().slice(0, 5),
    };
  }

  async getProfile(docId: string) {
    return this.doctorRepository.findByIdWithoutPassword(docId);
  }

  async updateProfile(docId: string, updateData: Record<string, unknown>) {
    const { fees, address, available } = updateData;
    await this.doctorRepository.updateDoctor(docId, { fees, available, address });
  }
}
