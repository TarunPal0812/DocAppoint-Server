import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { TokenUtil } from '../../utils/token.util';
import { AppError } from '../../utils/AppError';

jest.mock('./admin.repository');
jest.mock('../../utils/token.util');

describe('AdminService', () => {
  let adminService: AdminService;
  let mockAdminRepository: jest.Mocked<AdminRepository>;

  beforeEach(() => {
    mockAdminRepository = new AdminRepository() as jest.Mocked<AdminRepository>;
    adminService = new AdminService(mockAdminRepository);
    process.env.ADMIN_EMAIL = 'admin@docappoint.com';
    process.env.ADMIN_PASSWORD = 'AdminPassword123';
  });

  describe('loginAdmin', () => {
    it('should throw AppError if credentials do not match', async () => {
      await expect(
        adminService.loginAdmin({ email: 'wrong@test.com', password: 'wrong' }),
      ).rejects.toThrow(AppError);
    });

    it('should return signed token on valid admin credentials', async () => {
      (TokenUtil.signToken as jest.Mock).mockReturnValue('adminMockToken');

      const token = await adminService.loginAdmin({
        email: 'admin@docappoint.com',
        password: 'AdminPassword123',
      });

      expect(token).toBe('adminMockToken');
      expect(TokenUtil.signToken).toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    it('should return aggregate counts and latest appointments', async () => {
      mockAdminRepository.countDoctors.mockResolvedValue(5);
      mockAdminRepository.countUsers.mockResolvedValue(10);
      mockAdminRepository.getDashboardAppointments.mockResolvedValue([
        { _id: '1', slotDate: '2026-10-08' } as any,
      ]);

      const dashboard = await adminService.getDashboard();
      expect(dashboard.doctors).toBe(5);
      expect(dashboard.patients).toBe(10);
      expect(dashboard.appointments).toBe(1);
    });
  });
});
