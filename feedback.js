const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const feedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  carrier: { type: String, required: true },
  networkType: { type: String, required: true },
  locationName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

router.post('/api/feedback', async (req, res, next) => {
  try {
    const { userId, carrier, networkType, locationName, rating, comment } = req.body;

    if (!userId || !carrier || !networkType || !locationName || rating == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const feedback = new Feedback({
      userId,
      carrier,
      networkType,
      locationName,
      rating,
      comment
    });

    const saved = await feedback.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
