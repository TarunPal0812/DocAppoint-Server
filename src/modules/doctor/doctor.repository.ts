import DoctorModel from './doctor.model';
import AppointmentModel from '../appointment/appointment.model';

export class DoctorRepository {
  async findById(docId: string) {
    return DoctorModel.findById(docId);
  }

  async findByIdWithoutPassword(docId: string) {
    return DoctorModel.findById(docId).select('-password');
  }

  async findByEmail(email: string) {
    return DoctorModel.findOne({ email });
  }

  async findAllWithoutSensitive() {
    return DoctorModel.find({}).select(['-password', '-email']);
  }

  async updateDoctor(docId: string, updateData: Record<string, unknown>) {
    return DoctorModel.findByIdAndUpdate(docId, updateData, { new: true });
  }

  async findAppointmentsByDoctorId(docId: string) {
    return AppointmentModel.find({ docId });
  }

  async findAppointmentById(appointmentId: string) {
    return AppointmentModel.findById(appointmentId);
  }

  async updateAppointment(appointmentId: string, updateData: Record<string, unknown>) {
    return AppointmentModel.findByIdAndUpdate(appointmentId, updateData);
  }
}
