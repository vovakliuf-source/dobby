import request from 'supertest';
import { connect, closeDatabase, clearDatabase } from '../e2e_test_helpers/db-hander';
import app from '../app';

// Setup connection before running any tests
beforeAll(async () => await connect());

// Clear database data after each individual test to prevent data leakage
afterEach(async () => await clearDatabase());

// Clean up and shut down the server entirely after all tests finish
afterAll(async () => await closeDatabase());

describe('Authentication (e2e)', () => {
  describe('Register user', () => {
    it('Should throw validation error that not all fields are provided', async () => {
      const res = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Please provide name, email, and password');
    });

    it('Should throw validation error that user exists', async () => {
      await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12'
      });

      const res = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('Should register new user', async () => {
      const res = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('Register user', () => {
    it('Should throw validation error that email or password not provided', async () => {
      const res = await request(app).post('/api/v1/login').send({
        email: 'test@gmail.com'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Please provide email and password');
    });

    it('Should throw validation error that user not found', async () => {
      const res = await request(app).post('/api/v1/login').send({
        email: 'fake_email@gmail.com',
        password: 'test12'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User not found');
    });

    it('Should throw an error that credentials are invalid', async () => {
      await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12'
      });

      const res = await request(app).post('/api/v1/login').send({
        email: 'test@gmail.com',
        password: 'test123'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('Should login user', async () => {
      await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12'
      });

      const res = await request(app).post('/api/v1/login').send({
        email: 'test@gmail.com',
        password: 'test12'
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('404 - route not found', () => {
    it('Should throw route not found', async () => {
      const res = await request(app).post('/api/v1/some/route/that/not/exists').send({
        email: 'test@gmail.com'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Can\'t find on this server');
    });
  });
});