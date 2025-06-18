const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  issueType: String,
  customIssue: String,
  comments: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  screenshot: String, // 📸 Just a string
  submittedAt: Date,
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
