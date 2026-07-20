import request from 'supertest';
import { connect, closeDatabase, clearDatabase } from '../e2e_test_helpers/db-hander';
import app from '../app';

// Setup connection before running any tests
beforeAll(async () => await connect());

// Clear database data after each individual test to prevent data leakage
afterEach(async () => await clearDatabase());

// Clean up and shut down the server entirely after all tests finish
afterAll(async () => await closeDatabase());



describe('Jobs (e2e)', () => {

  describe('Get all jobs', () => {

    it('Should return all jobs', async() => {
      const res = await request(app).get('/api/v1/jobs').send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

  });

  describe('Create a job', () => {
    it('Should fail to create a job because of missing fields', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const res = await request(app)
        .post('/api/v1/jobs/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Job'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Job validation failed: salary: Salary is required, experience: Experience is required, minEducation: Minimum education is required, jobType: Job type is required, company: Company name is required, address: Address is required, description: Description is required');
    });

    it('Should create a job', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const res = await request(app)
        .post('/api/v1/jobs/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Job',
          salary: 1500,
          experience: '1 year',
          minEducation: 'PhD',
          jobType: 'Permanent',
          company: 'Test',
          address: 'some address',
          description: 'nice job with high pay'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data._id).toBeDefined();
    });
  });

  describe('Get a job', () => {
    it('Should get a job by id', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const job = {
        title: 'node developer',
        salary: 1500,
        experience: '1 year',
        minEducation: 'PhD',
        jobType: 'Permanent',
        company: 'Test',
        address: 'some address',
        description: 'nice job with high pay'
      };

      const resCreateJob = await request(app)
        .post('/api/v1/jobs/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(job);

      const resGetJob = await request(app)
        .get(`/api/v1/jobs/${resCreateJob.body.data._id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(resGetJob.statusCode).toBe(200);
      expect(resGetJob.body.data._id).toBeDefined();
    });

    it('Should return 404 for a job that doesn\'t exist', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const job = {
        title: 'node developer',
        salary: 1500,
        experience: '1 year',
        minEducation: 'PhD',
        jobType: 'Permanent',
        company: 'Test',
        address: 'some address',
        description: 'nice job with high pay'
      };

      const resGetJob = await request(app)
        .get('/api/v1/jobs/6a5e1474f7d44c34563dfdd5')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();
                
      expect(resGetJob.statusCode).toBe(404);
      expect(resGetJob.body.message).toBe('Job not found');
    });

    it('Should return 404 for a job with incorrect id', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const job = {
        title: 'node developer',
        salary: 1500,
        experience: '1 year',
        minEducation: 'PhD',
        jobType: 'Permanent',
        company: 'Test',
        address: 'some address',
        description: 'nice job with high pay'
      };

      const resGetJob = await request(app)
        .get('/api/v1/jobs/not-existing-job')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();
                
      expect(resGetJob.statusCode).toBe(404);
      expect(resGetJob.body.message).toBe('Resource not found. Invalid: _id');
    });
  });

  describe('Update job', () => {
    it('Should update a job', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const job = {
        title: 'node developer',
        salary: 1500,
        experience: '1 year',
        minEducation: 'PhD',
        jobType: 'Permanent',
        company: 'Test',
        address: 'some address',
        description: 'nice job with high pay'
      };

      const resCreateJob = await request(app)
        .post('/api/v1/jobs/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(job);

      const resGetJob = await request(app)
        .put(`/api/v1/jobs/${resCreateJob.body.data._id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'full stack developer'
        });

      expect(resGetJob.statusCode).toBe(200);
      expect(resGetJob.body.data.title).toEqual('full stack developer');
    });

    it('Should get 404', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const job = {
        title: 'node developer',
        salary: 1500,
        experience: '1 year',
        minEducation: 'PhD',
        jobType: 'Permanent',
        company: 'Test',
        address: 'some address',
        description: 'nice job with high pay'
      };

      const resCreateJob = await request(app)
        .post('/api/v1/jobs/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(job);

      const resGetJob = await request(app)
        .put('/api/v1/jobs/6a5e1474f7d44c34563dfdd5')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'new'
        });

      expect(resGetJob.statusCode).toBe(404);
      expect(resGetJob.body.message).toBe('Job not found');
    });
  });

  describe('Delete job', () => {
    it('Should delete a job', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const job = {
        title: 'node developer',
        salary: 1500,
        experience: '1 year',
        minEducation: 'PhD',
        jobType: 'Permanent',
        company: 'Test',
        address: 'some address',
        description: 'nice job with high pay'
      };

      const resCreateJob = await request(app)
        .post('/api/v1/jobs/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(job);

      const resGetJob = await request(app)
        .delete(`/api/v1/jobs/${resCreateJob.body.data._id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(resGetJob.statusCode).toBe(200);
      expect(resGetJob.body.message).toBe('Job deleted successfully');
    });

    it('Should get 404', async() => {

      const resReg = await request(app).post('/api/v1/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'test12',
        role: 'employer'
      });

      let jwtToken = resReg.body.token;

      const job = {
        title: 'node developer',
        salary: 1500,
        experience: '1 year',
        minEducation: 'PhD',
        jobType: 'Permanent',
        company: 'Test',
        address: 'some address',
        description: 'nice job with high pay'
      };

      const resGetJob = await request(app)
        .delete('/api/v1/jobs/6a5e1474f7d44c34563dfdd5')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();
                
      expect(resGetJob.statusCode).toBe(404);
      expect(resGetJob.body.message).toBe('Job not found');
    });
  });

});