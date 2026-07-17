const sendEmail = require('../sendEmail');

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValueOnce({
        sendMail: jest.fn().mockResolvedValueOnce({
            accepted: ["test@gmail.com"]
        })
    })
}))

describe('Send email', () => {
    it('Should send email', async () => {

        const response = await sendEmail({
            email: "test@gmail.com",
            subject: "TEst",
            message: "this is something"
        })

        expect(response).toBeDefined();
        expect(response.accepted).toContain('test@gmail.com')
    })
})