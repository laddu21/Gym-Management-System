console.log('Starting server...');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

console.log('Express loaded');

const app = express();
const PORT = 5050;
console.log('App created, port:', PORT);

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process, just log
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Connect to database
const connectDB = require('./config/database');
connectDB().catch((err) => {
    console.error('Database connection failed:', err);
});

// Routes
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const membershipsRoutes = require('./routes/memberships');
const trainersRoutes = require('./routes/trainers');
const pitchesRoutes = require('./routes/pitches');
const reportsRoutes = require('./routes/reports');
const attendanceRoutes = require('./routes/attendance');
const otpRoutes = require('./routes/otp');
const userMembershipsRoutes = require('./routes/userMemberships');
const performanceRoutes = require('./routes/performance');
const monthlyReportsRoutes = require('./routes/monthly-reports');
const configRoutes = require('./routes/config');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/memberships', membershipsRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/pitches', pitchesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/user-memberships', userMembershipsRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/monthly-reports', monthlyReportsRoutes);
app.use('/api/config', configRoutes);

// Lightweight health check (readiness/liveness)
app.get('/api/health', (req, res) => {
    res.status(200).json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content response for favicon
});

app.get('/', (req, res) => {
    console.log('Request received');
    res.json({ status: 'ok', message: 'Gym API is running' });
});

console.log('About to listen on port', PORT);
app.listen(PORT, () => {
    console.log(`Gym API listening on port ${PORT}`);

    // Monthly archive feature temporarily disabled (needs implementation)
    // const { checkAndArchive } = require('./utils/monthlyArchive');
    // setTimeout(async () => {
    //     try {
    //         const result = await checkAndArchive();
    //         if (result.success && !result.skipped) {
    //             console.log(`Monthly archive completed: ${result.year}-${result.month} (${result.totalCount} leads)`);
    //         }
    //     } catch (error) {
    //         console.error('Error in monthly archive check:', error);
    //     }
    // }, 5000); // Wait 5 seconds after startup to allow DB connection
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});
