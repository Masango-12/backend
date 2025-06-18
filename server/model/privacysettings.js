const mongoose = require('mongoose');

const PrivacySettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  backgroundMonitoring: { type: Boolean, default: true },
  shareAnonymousData: { type: Boolean, default: false },
  saveLocationHistory: { type: Boolean, default: true },
});

module.exports = mongoose.model('PrivacySettings', PrivacySettingsSchema);
