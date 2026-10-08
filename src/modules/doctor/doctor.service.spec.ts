import { DoctorService } from './doctor.service';
import { DoctorRepository } from './doctor.repository';
import { HashUtil } from '../../utils/hash.util';
import { TokenUtil } from '../../utils/token.util';
import { AppError } from '../../utils/AppError';

jest.mock('./doctor.repository');
jest.mock('../../utils/hash.util');
jest.mock('../../utils/token.util');

describe('DoctorService', () => {
  let doctorService: DoctorService;
  let mockDoctorRepository: jest.Mocked<DoctorRepository>;

  beforeEach(() => {
    mockDoctorRepository = new DoctorRepository() as jest.Mocked<DoctorRepository>;
    doctorService = new DoctorService(mockDoctorRepository);
  });

  describe('loginDoctor', () => {
    it('should throw AppError if doctor is not found', async () => {
      mockDoctorRepository.findByEmail.mockResolvedValue(null);
      await expect(
        doctorService.loginDoctor({ email: 'doc@test.com', password: 'password123' }),
      ).rejects.toThrow(AppError);
    });

    it('should return doctor token if credentials are valid', async () => {
      mockDoctorRepository.findByEmail.mockResolvedValue({
        _id: 'doc123',
        password: 'hashedpassword',
      } as any);
      (HashUtil.compare as jest.Mock).mockResolvedValue(true);
      (TokenUtil.signToken as jest.Mock).mockReturnValue('mockDoctorToken');

      const token = await doctorService.loginDoctor({
        email: 'doc@test.com',
        password: 'password123',
      });

      expect(token).toBe('mockDoctorToken');
      expect(TokenUtil.signToken).toHaveBeenCalledWith({ id: 'doc123' }, '1d');
    });
  });

  describe('changeAvailability', () => {
    it('should toggle doctor availability', async () => {
      mockDoctorRepository.findById.mockResolvedValue({
        _id: 'doc123',
        available: true,
      } as any);

      await doctorService.changeAvailability('doc123');
      expect(mockDoctorRepository.updateDoctor).toHaveBeenCalledWith('doc123', {
        available: false,
      });
    });
  });
});
