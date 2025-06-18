require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Schemas & Models
const testSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    downloadSpeed: { type: Number, required: true },
    uploadSpeed: { type: Number, required: true },
    ping: { type: Number, required: true },
    jitter: { type: Number, required: true },
    carrier: { type: String, required: true },
    networkType: { type: String, required: true },
    testedAt: { type: Date, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
            required: true
        }
    }
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
    issueType: { type: String, required: true },
    customIssue: { type: String },
    comments: { type: String, required: true },
    location: {
        latitude: Number,
        longitude: Number,
        address: String,
    },
    screenshot: { type: String },
}, { timestamps: true });

const privacySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    backgroundMonitoring: { type: Boolean, default: true },
    shareAnonymousData: { type: Boolean, default: false },
    saveLocationHistory: { type: Boolean, default: true },
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const PrivacySettings = mongoose.model('PrivacySettings', privacySchema);

// Routes
app.get('/', (req, res) => res.send('Hello from backend!'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// POST /api/tests
app.post('/api/tests', async (req, res, next) => {
    try {
        const {
            userId, downloadSpeed, uploadSpeed, ping,
            jitter, carrier, networkType, testedAt, location
        } = req.body;

        if (!userId || downloadSpeed == null || uploadSpeed == null || ping == null || jitter == null || !carrier || !networkType || !testedAt) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const test = new Test({
            userId, downloadSpeed, uploadSpeed, ping,
            jitter, carrier, networkType, testedAt,
            location: location || { type: 'Point', coordinates: [0, 0] }
        });

        const saved = await test.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
});

// GET /api/tests
app.get('/api/tests', async (req, res, next) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        const tests = await Test.find(filter).sort({ testedAt: -1 });
        res.json(tests);
    } catch (error) {
        next(error);
    }
});

// POST /api/feedback
app.post('/api/feedback', async (req, res, next) => {
    try {
        const { issueType, customIssue, comments, location, screenshot } = req.body;

        if (!comments || !issueType) {
            return res.status(400).json({ message: 'issueType and comments are required' });
        }

        if (issueType === 'Other' && (!customIssue || !customIssue.trim())) {
            return res.status(400).json({ message: 'customIssue is required when issueType is Other' });
        }

        const feedback = new Feedback({ issueType, customIssue, comments, location, screenshot });
        const savedFeedback = await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', data: savedFeedback });
    } catch (error) {
        next(error);
    }
});

// GET /api/privacy-settings/:userId
app.get('/api/privacy-settings/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        let settings = await PrivacySettings.findOne({ userId });

        if (!settings) {
            settings = new PrivacySettings({ userId });
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        next(error);
    }
});

// PUT /api/privacy-settings/:userId
app.put('/api/privacy-settings/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { backgroundMonitoring, shareAnonymousData, saveLocationHistory } = req.body;

        const updated = await PrivacySettings.findOneAndUpdate(
            { userId },
            { backgroundMonitoring, shareAnonymousData, saveLocationHistory },
            { new: true, upsert: true }
        );

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
