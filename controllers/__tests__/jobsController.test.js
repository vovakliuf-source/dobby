import Job, { populate } from '../../models/jobs';
import { getJobs, createJob, getJob, updateJob, deleteJob } from '../jobsController';


const mockJob = {
  "title": "Node Developer",
  "description": "Must be a full-stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, Express, Angular and/or React, and Node.js).",
  "email": "employeer1@gmail.com",
  "address": "651 Rr 2, Oquawka, IL, 61469",
  "company": "Knack Ltd",
  "industry": [
    "Information Technology"
  ],
  "jobType": "Internship",
  "minEducation": "Bachelors",
  "positions": 3,
  "experience": "1 year",
  "salary": 155000,
  "lastDate": {
    "$date": "2026-05-22T13:35:20.249Z"
  },
  "applicantsApplied": [],
  "postingDate": {
    "$date": "2026-05-15T13:35:23.690Z"
  },
  "__v": 0
}

const mockRequest = () => ({
    body: {},
    query: {},
    params: {},
    user: {},
    
})

const mockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
});

const mockNext = () => jest.fn()

describe('Jobs Controller', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    })

    it('should return jobs with status 200', async () => {
        jest.spyOn(Job, 'find').mockImplementationOnce(() => ({
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnValueOnce([mockJob]),
        }));

        const mockReq = mockRequest();
        const mockRes = mockResponse();

        await getJobs(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            middleware: undefined,
            results: 1,
            data: [mockJob],
        });
    })

    it('should throw 404 if job is not found', async () => {
        jest.spyOn(Job, 'find').mockImplementationOnce(() => ({
            populate: jest.fn().mockReturnValueOnce(null),
        }));
        const mockReq = mockRequest().params = {params: { id: 'jobId', slug: 'jobSlug' }};
        const mockRes = mockResponse();
        const mockN = mockNext();

        await getJob(mockReq, mockRes, mockN);
        expect(mockN).toHaveBeenCalledWith(new Error('Job not found'));
    })

    it('should return a job by id', async () => {
        jest.spyOn(Job, 'find').mockImplementationOnce(() => ({
            populate: jest.fn().mockReturnValueOnce(mockJob),
        }));
        const mockReq = mockRequest().params = {params: { id: 'jobId', slug: 'jobSlug' }};
        const mockRes = mockResponse();
        const mockN = mockNext();

        await getJob(mockReq, mockRes, mockN);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            data: mockJob,
        });
    })

    it('should create a new job 201', async () => {
        const spy = jest.spyOn(Job.prototype, 'save').mockResolvedValue(mockJob);
        const mockReq = mockRequest().body = {
            "title": "Node Developer",
            "description": "Must be a full-stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, Express, Angular and/or React, and Node.js).",
            "email": "employeer1@gmail.com",
            "address": "651 Rr 2, Oquawka, IL, 61469",
            "company": "Knack Ltd",
            "industry": [
                "Information Technology"
            ],
            "jobType": "Internship",
            "minEducation": "Bachelors",
            "positions": 3,
            "experience": "1 year",
            "salary": 155000,
            "lastDate": {
                "$date": "2026-05-22T13:35:20.249Z"
            },
            "applicantsApplied": [],
            "postingDate": {
                "$date": "2026-05-15T13:35:23.690Z"
            }
        };

        mockReq.user = { id: 'userId' };
        const mockRes = mockResponse();
        await createJob(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Job created successfully',
            data: mockJob
        });
    });

    it('should not create a new job without a title and return 400', async () => {
        const spy = jest.spyOn(Job.prototype, 'save').mockRejectedValue(new Error('Title is required'));
        const mockReq = mockRequest().body = {
            "title": "",
            "description": "Must be a full-stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, Express, Angular and/or React, and Node.js).",
            "email": "employeer1@gmail.com",
            "address": "651 Rr 2, Oquawka, IL, 61469",
            "company": "Knack Ltd",
            "industry": [
                "Information Technology"
            ],
            "jobType": "Internship",
            "minEducation": "Bachelors",
            "positions": 3,
            "experience": "1 year",
            "salary": 155000,
            "lastDate": {
                "$date": "2026-05-22T13:35:20.249Z"
            },
            "applicantsApplied": [],
            "postingDate": {
                "$date": "2026-05-15T13:35:23.690Z"
            }
        };

        mockReq.user = { id: 'userId' };
        const mockRes = mockResponse();
        await createJob(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Failed to create job',
            error: 'Title is required'
        });
    });

    it('should not update non-existent job', async () => {
        const spy = jest.spyOn(Job, 'findById').mockResolvedValue(null);
        const mockReq = mockRequest();

        mockReq.user = { id: 'userId' };
        mockReq.params = { id: 'nonExistentJobId' };
        const mockRes = mockResponse();
        const mockN = mockNext();

        await updateJob(mockReq, mockRes, mockN);
        expect(mockN).toHaveBeenCalledWith(new Error('Job not found'));
    });

    it('should not update a job if user is not admin', async () => {
        const spy = jest.spyOn(Job, 'findById').mockResolvedValue({...mockJob, user: { id: 'differentUserId' }});
        const mockReq = mockRequest();
        mockReq.user = { id: 'userId', role: 'user' };
        mockReq.params = { id: 'nonExistentJobId' };
        const mockRes = mockResponse();
        const mockN = mockNext();

        await updateJob(mockReq, mockRes, mockN);
        expect(mockN).toHaveBeenCalledWith(new Error('You are not authorized to update this job'));

    });

    it('should update a job', async () => {
        jest.spyOn(Job, 'findById').mockResolvedValue({...mockJob, user: { id: 'userId' }});
        jest.spyOn(Job, 'findByIdAndUpdate').mockResolvedValue({...mockJob, "title": "Node Developer 1"});
        
        const mockReq = mockRequest().body = {
            "title": "Node Developer 1",
            "description": "Must be a full-stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, Express, Angular and/or React, and Node.js).",
            "email": "employeer1@gmail.com",
            "address": "651 Rr 2, Oquawka, IL, 61469",
            "company": "Knack Ltd",
            "industry": [
                "Information Technology"
            ],
            "jobType": "Internship",
            "minEducation": "Bachelors",
            "positions": 3,
            "experience": "1 year",
            "salary": 155000,
            "lastDate": {
                "$date": "2026-05-22T13:35:20.249Z"
            },
            "applicantsApplied": [],
            "postingDate": {
                "$date": "2026-05-15T13:35:23.690Z"
            }
        };

        mockReq.user = { id: 'userId', role: 'admin' };
        mockReq.params = { id: 'existingJobId' };
        const mockRes = mockResponse();

        await updateJob(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Job updated successfully',
            data: {...mockJob, title: "Node Developer 1"}
        });
    });

    it('should not delete non-existent job', async () => {
        const spy = jest.spyOn(Job, 'findById').mockResolvedValue(null);
        const mockReq = mockRequest();

        mockReq.params = { id: 'nonExistentJobId' };
        const mockRes = mockResponse();
        const mockN = mockNext();

        await deleteJob(mockReq, mockRes, mockN);
        expect(mockN).toHaveBeenCalledWith(new Error('Job not found'));
    });

    it('should not delete a job if user is not admin', async () => {
        const spy = jest.spyOn(Job, 'findById').mockResolvedValue({...mockJob, user: { id: 'differentUserId' }});
        const mockReq = mockRequest();
        mockReq.user = { id: 'userId', role: 'user' };
        mockReq.params = { id: 'nonExistentJobId' };
        const mockRes = mockResponse();
        const mockN = mockNext();

        await deleteJob(mockReq, mockRes, mockN);
        expect(mockN).toHaveBeenCalledWith(new Error('You are not authorized to delete this job'));

    });

    it('should delete a job', async () => {
        jest.spyOn(Job, 'findById').mockResolvedValue({...mockJob, user: { id: 'userId' }});
        jest.spyOn(Job, 'findByIdAndDelete').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnValueOnce({...mockJob, "title": "Node Developer 1", applicantsApplied: []})
        }));
        
        const mockReq = mockRequest();
        mockReq.user = { id: 'userId', role: 'admin' };
        mockReq.params = { id: 'existingJobId' };
        const mockRes = mockResponse();

        await deleteJob(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Job deleted successfully',
            data: {}
        });
    });

})