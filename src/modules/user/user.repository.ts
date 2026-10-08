import UserModel from './user.model';
import DoctorModel from '../doctor/doctor.model';
import AppointmentModel from '../appointment/appointment.model';

export class UserRepository {
  async findByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  async findById(userId: string) {
    return UserModel.findById(userId);
  }

  async findByIdWithoutPassword(userId: string) {
    return UserModel.findById(userId).select('-password');
  }

  async createUser(userData: Record<string, unknown>) {
    const newUser = new UserModel(userData);
    return newUser.save();
  }

  async updateUser(userId: string, updateData: Record<string, unknown>) {
    return UserModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async findDoctorById(docId: string) {
    return DoctorModel.findById(docId).select('-password');
  }

  async updateDoctor(docId: string, docData: Record<string, unknown>) {
    return DoctorModel.findByIdAndUpdate(docId, docData);
  }

  async createAppointment(appointmentData: Record<string, unknown>) {
    const newAppointment = new AppointmentModel(appointmentData);
    return newAppointment.save();
  }

  async findAppointmentsByUserId(userId: string) {
    return AppointmentModel.find({ userId });
  }

  async findAppointmentById(appointmentId: string) {
    return AppointmentModel.findById(appointmentId);
  }

  async updateAppointment(appointmentId: string, updateData: Record<string, unknown>) {
    return AppointmentModel.findByIdAndUpdate(appointmentId, updateData);
  }
}
