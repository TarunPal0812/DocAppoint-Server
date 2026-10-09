import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { HashUtil } from '../../utils/hash.util';
import { TokenUtil } from '../../utils/token.util';
import { AppError } from '../../utils/AppError';

// Mock the repository and external libs
jest.mock('./user.repository');
jest.mock('../../utils/hash.util');
jest.mock('../../utils/token.util');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(mockUserRepository);
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('loginUser', () => {
    it('should throw AppError if user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(
        userService.loginUser({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toThrow(AppError);
    });

    it('should return token if credentials are valid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        _id: '123',
        password: 'hashedpassword',
      } as unknown as ReturnType<UserRepository['findByEmail']>);
      (HashUtil.compare as jest.Mock).mockResolvedValue(true);
      (TokenUtil.signToken as jest.Mock).mockReturnValue('mocktoken');

      const result = await userService.loginUser({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toBe('mocktoken');
      expect(TokenUtil.signToken).toHaveBeenCalledWith({ id: '123' });
    });
  });

  describe('cancelAppointment', () => {
    it('should throw AppError if appointment userId does not match user', async () => {
      mockUserRepository.findAppointmentById.mockResolvedValue({
        _id: 'app123',
        userId: 'differentUser',
      } as any);

      await expect(userService.cancelAppointment('user123', 'app123')).rejects.toThrow(AppError);
    });

    it('should cancel appointment and free slot when user matches', async () => {
      mockUserRepository.findAppointmentById.mockResolvedValue({
        _id: 'app123',
        userId: 'user123',
        docId: 'doc123',
        slotDate: '12_10_2026',
        slotTime: '10:30 am',
      } as any);

      mockUserRepository.findDoctorById.mockResolvedValue({
        _id: 'doc123',
        slots_booked: {
          '12_10_2026': ['10:30 am'],
        },
      } as any);

      await userService.cancelAppointment('user123', 'app123');

      expect(mockUserRepository.updateAppointment).toHaveBeenCalledWith('app123', {
        cancelled: true,
      });
      expect(mockUserRepository.updateDoctor).toHaveBeenCalledWith('doc123', {
        slots_booked: {
          '12_10_2026': [],
        },
      });
    });
  });
});
