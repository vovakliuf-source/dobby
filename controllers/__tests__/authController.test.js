import { registerUser, loginUser } from '../authController';
import User from '../../models/users';
import bcrypt from 'bcryptjs';
import jwtToken from '../../utils/jwtToken';

jest.fn(jwtToken).mockResolvedValue('jwt_token');


const mockRequest = () => {
    return {
        body: {
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123'
        }
    }
}

const mockResponse = () => {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis()
    }
}

const mockNext = () => jest.fn()

const mockedUser = {
    _id: '12345',
    name: 'Test User',
    email: 'test@test.com',
    password: 'hashedPassword',
    getJwtToken: jest.fn().mockResolvedValue('jwt_token')
}

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Register User', () => {

    it('should register a new user', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);
        jest.spyOn(User, 'create').mockResolvedValue(mockedUser);
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

        const req = mockRequest();
        const res = mockResponse();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, token: "jwt_token" });
        expect(User.create).toHaveBeenCalledWith({
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123'
        });
    });

    it('should throw validation error if required fields are missing', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);

        const req = (mockRequest().body = { body: {}});
        const res = mockResponse();
        const next = mockNext();

        await registerUser(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Please provide name, email, and password'));
    });

    it('should throw error if user already exists', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(mockedUser);

        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext();
        await registerUser(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('User already exists'));
    });
});

describe('Login User', () => {
    it('should throw missing credentials error if email or password is not provided', async () => {

        const req = mockRequest().body = { body: {} };
        const res = mockResponse();
        const next = mockNext();

        await loginUser(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error('Please provide email and password'));
    });

    it('should throw that user doesn\'t exist error if user is not found', async () => {
        jest.spyOn(User, 'findOne').mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        const req = mockRequest().body = { body: { email: 'nonexistent@test.com', password: 'password123' } };
        const res = mockResponse();
        const next = mockNext();

        await loginUser(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error('User not found'));
    });

    it('Should throw invalid credentials error if password is incorrect', async () => {
        jest.spyOn(User, 'findOne').mockReturnValue({
            select: jest.fn().mockResolvedValue({...mockedUser, isPasswordMatched: jest.fn().mockResolvedValue(false)})
        });

        const req = mockRequest().body = { body: { email: 'test@test.com', password: 'wrongpassword' } };
        const res = mockResponse();
        const next = mockNext();

        await loginUser(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Invalid credentials'));
    });

    it('Should login user and set auth cookie', async () => {
        jest.spyOn(User, 'findOne').mockReturnValue({
            select: jest.fn().mockResolvedValue({...mockedUser, isPasswordMatched: jest.fn().mockResolvedValue(true)})
        });

        const req = mockRequest().body = { body: { email: 'test@test.com', password: 'password123' } };
        const res = mockResponse();
        const next = mockNext();

        await loginUser(req, res, next);
        expect(res.cookie).toHaveBeenCalledWith('token', 'jwt_token', expect.objectContaining({ expires: expect.any(Date), httpOnly: true, secure: false, sameSite: 'Strict' }));
    })
})