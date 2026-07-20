import jwt from 'jsonwebtoken';
import User from '../../models/users';
import catchAsyncErrors from '../../middleware/catchAsyncErrors';
import ErrorHandler from '../../utils/errorHandler';
import { isAuthenticated, authorizeRoles } from '../../middleware/auth';

const mockRequest = () => ({
  headers: {
    authorization: 'Bearer'
  }
});

const mockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
});

const mockNext = jest.fn();

const mockUser = {
  id: 'userId',
  role: 'user',
  email: 'test@test.com',
};

describe('isAuthenticated middleware', () => {
  it('should return 401 if authorization header is missing', async () => {
    const req = mockRequest();
    req.headers.authorization = undefined; // Simulate missing authorization header
    const res = mockResponse();

    await isAuthenticated(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Missing authorization header',
      statusCode: 401
    }));
  });

  it('should return 401 if authorization header is not a Bearer token', async () => {
    const req = mockRequest();
    req.headers.authorization = 'Bearer';
    const res = mockResponse();

    await isAuthenticated(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Not authorized to access this route',
      statusCode: 401
    }));
  });

  it('should authenticate a user with a valid token', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUser.id });
    const req = mockRequest();
    req.headers.authorization = 'Bearer token';
    const res = mockResponse();

    await isAuthenticated(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});