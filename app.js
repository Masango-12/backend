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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback-app';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Test Schema and Model
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

const Test = mongoose.model('Test', testSchema);

// Feedback Schema and Model
const feedbackSchema = new mongoose.Schema({
    issueType: { type: String, required: true },
    customIssue: { type: String },
    comments: { type: String, required: true },
    location: {
        latitude: Number,
        longitude: Number,
        address: String,
    },
    screenshot: { type: String }, // base64 string
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Routes
app.get('/', (req, res) => res.send('Hello from backend!'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Save a new test result
app.post('/api/tests', async (req, res, next) => {
    try {
        const {
            userId,
            downloadSpeed,
            uploadSpeed,
            ping,
            jitter,
            carrier,
            networkType,
            testedAt,
            location
        } = req.body;

        if (!userId || downloadSpeed == null || uploadSpeed == null || ping == null || jitter == null || !carrier || !networkType || !testedAt) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const test = new Test({
            userId,
            downloadSpeed,
            uploadSpeed,
            ping,
            jitter,
            carrier,
            networkType,
            testedAt,
            location: location || { type: 'Point', coordinates: [0, 0] }
        });

        const saved = await test.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
});

// Get test results (optionally filtered by userId)
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

// Feedback submission route
app.post('/api/feedback', async (req, res, next) => {
    try {
        const {
            issueType,
            customIssue,
            comments,
            location,
            screenshot,
        } = req.body;

        if (!comments || !issueType) {
            return res.status(400).json({ message: 'issueType and comments are required' });
        }

        if (issueType === 'Other' && (!customIssue || !customIssue.trim())) {
            return res.status(400).json({ message: 'customIssue is required when issueType is Other' });
        }

        const feedback = new Feedback({
            issueType,
            customIssue,
            comments,
            location,
            screenshot,
        });

        const savedFeedback = await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', data: savedFeedback });
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
