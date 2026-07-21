import jwt from 'jsonwebtoken';
import sendToken from '../jwtToken';

const getMockRes = () => ({
  status: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnValue({
    success: true,
    token: 'mockedToken',
  })
});

describe('getToken', () => {
  it('should return a valid JWT token', async() => {
    jest.spyOn(jwt, 'sign').mockReturnValue('mockedToken');
    const mockRes = getMockRes();
    const user = {
      getJwtToken: jest.fn().mockResolvedValue('mockedToken'),
    };
    const token = await sendToken(user, 200, mockRes);
    expect(mockRes.cookie).toHaveBeenCalledWith('token', 'mockedToken', expect.objectContaining({ expires: expect.any(Date), httpOnly: true, secure: false, sameSite: 'Strict' }));
  });
});