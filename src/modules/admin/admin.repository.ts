import DoctorModel from '../doctor/doctor.model';
import AppointmentModel from '../appointment/appointment.model';
import UserModel from '../user/user.model';

export class AdminRepository {
  async findDoctorByEmail(email: string) {
    return DoctorModel.findOne({ email });
  }

  async createDoctor(doctorData: Record<string, unknown>) {
    const newDoctor = new DoctorModel(doctorData);
    return newDoctor.save();
  }

  async findAllDoctors() {
    return DoctorModel.find({}).select('-password');
  }

  async findAllAppointments() {
    return AppointmentModel.find({});
  }

  async findAppointmentById(appointmentId: string) {
    return AppointmentModel.findById(appointmentId);
  }

  async updateAppointment(appointmentId: string, updateData: Record<string, unknown>) {
    return AppointmentModel.findByIdAndUpdate(appointmentId, updateData);
  }

  async findDoctorById(docId: string) {
    return DoctorModel.findById(docId);
  }

  async updateDoctor(docId: string, updateData: Record<string, unknown>) {
    return DoctorModel.findByIdAndUpdate(docId, updateData);
  }

  async countDoctors() {
    return DoctorModel.countDocuments();
  }

  async countUsers() {
    return UserModel.countDocuments();
  }

  async getDashboardAppointments() {
    return AppointmentModel.find({});
  }
}
