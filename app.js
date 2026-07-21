const express = require('express');
const PORT = process.env.PORT || 3000;
const connectDb = require('./config/database');
const errorMiddleware = require('./middleware/error');
const ErrorHandler = require('./utils/errorHandler');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const requestRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const path = require('path');

dotenv.config({ path: './config/config.env' });

// Must be at the top of the file to catch errors in other files
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

const app = express();

connectDb();

// Middleware to make req.query mutable for nested query parameters xssclean and mongoSanitize
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(fileUpload());
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp({whitelist: ['industry', 'jobType', 'minEducation', 'experience', 'positions']})); // Allow duplicate query parameters for filtering

app.use(requestRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
}));

app.set('query parser', 'extended'); // To support nested query parameters like ?price[gt]=1000

const jobsRouter = require('./routes/jobRouter');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1', authRouter);
app.use('/api/v1', jobsRouter);
app.use('/api/v1', userRouter);
app.all('/*splat', (req, res, next) => {
  next(new ErrorHandler('Can\'t find on this server', 404));
});

// Error middleware
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Dobby Free API is running at http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;