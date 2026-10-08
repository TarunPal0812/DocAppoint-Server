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
});
