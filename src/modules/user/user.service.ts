import { UserRepository } from './user.repository';
import { HashUtil } from '../../utils/hash.util';
import { TokenUtil } from '../../utils/token.util';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import razorpay from 'razorpay';
import fs from 'fs';

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async registerUser(userData: Record<string, string>) {
    const { name, email, password } = userData;
    const existUser = await this.userRepository.findByEmail(email);
    if (existUser) {
      throw new AppError('User Already exist.', 400);
    }
    const hashPassword = await HashUtil.hash(password);

    const userToSave = { name, email, password: hashPassword };
    const user = await this.userRepository.createUser(userToSave);
    const token = TokenUtil.signToken({ id: user._id });
    return token;
  }

  async loginUser(credentials: Record<string, string>) {
    const { email, password } = credentials;
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError('User Not exist.', 404);

    const passwordCheck = await HashUtil.compare(password, user.password);
    if (!passwordCheck) throw new AppError('Invalid credentials.', 401);

    return TokenUtil.signToken({ id: user._id });
  }

  async getProfile(userId: string) {
    return this.userRepository.findByIdWithoutPassword(userId);
  }

  async updateProfile(
    userId: string,
    bodyData: Record<string, string>,
    imageFile?: Express.Multer.File,
  ) {
    const { name, phone, address, dob, gender } = bodyData;
    if (!name || !phone || !dob || !gender) {
      throw new AppError('Data is missing', 400);
    }

    await this.userRepository.updateUser(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
      });
      await this.userRepository.updateUser(userId, { image: imageUpload.secure_url });

      fs.unlink(imageFile.path, (err) => {
        if (err) logger.error('Error deleting local file:', { error: err });
      });
    }
  }

  async bookAppointment(userId: string, bodyData: Record<string, string>) {
    const { docId, slotDate, slotTime } = bodyData;
    if (!docId || !slotDate || !slotTime) {
      throw new AppError('Missing appointment details', 400);
    }

    const docData = await this.userRepository.findDoctorById(docId);
    if (!docData) throw new AppError('Doctor not found', 404);
    if (!docData.available) throw new AppError('Doctor is not available', 400);

    const slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate]?.includes(slotTime)) {
      throw new AppError('Slot is already booked', 400);
    }

    slots_booked[slotDate] = slots_booked[slotDate]
      ? [...slots_booked[slotDate], slotTime]
      : [slotTime];

    const userData = await this.userRepository.findByIdWithoutPassword(userId);

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    await this.userRepository.createAppointment(appointmentData);
    await this.userRepository.updateDoctor(docId, { slots_booked });
  }

  async listAppointment(userId: string) {
    return this.userRepository.findAppointmentsByUserId(userId);
  }

  async cancelAppointment(userId: string, appointmentId: string) {
    const appointment = await this.userRepository.findAppointmentById(appointmentId);
    if (!appointment) throw new AppError('Appointment not found', 404);
    if (appointment.userId.toString() !== userId.toString())
      throw new AppError('Unauthorized action', 401);

    await this.userRepository.updateAppointment(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointment;
    const doctorData = await this.userRepository.findDoctorById(docId);
    if (!doctorData) throw new AppError('Doctor not found', 404);

    const slots_booked = doctorData.slots_booked || {};
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter((e: string) => e !== slotTime);
    }
    await this.userRepository.updateDoctor(docId, { slots_booked });
  }

  async paymentRazorpay(appointmentId: string) {
    const appointmentData = await this.userRepository.findAppointmentById(appointmentId);
    if (!appointmentData || appointmentData.cancelled) {
      throw new AppError('Appointment not found', 404);
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY || 'INR',
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  }

  async verifyRazorpay(razorpay_order_id: string) {
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === 'paid') {
      await this.userRepository.updateAppointment(orderInfo.receipt!, { payment: true });
      return true;
    }
    return false;
  }

  async refundPayment(razorpay_payment_id: string) {
    const refund = await razorpayInstance.payments.refund(razorpay_payment_id, {
      speed: 'normal',
      notes: { reason: 'Appointment canceled' },
    });
    return refund;
  }
}
