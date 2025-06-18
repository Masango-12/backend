const express = require('express');
const router = express.Router();
const PrivacySettings = require('../models/PrivacySettings');

// GET /api/privacy-settings/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    let settings = await PrivacySettings.findOne({ userId });

    // If not found, create with default values
    if (!settings) {
      settings = new PrivacySettings({ userId });
      await settings.save();
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/privacy-settings/:userId
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { backgroundMonitoring, shareAnonymousData, saveLocationHistory } = req.body;

  try {
    const updated = await PrivacySettings.findOneAndUpdate(
      { userId },
      { backgroundMonitoring, shareAnonymousData, saveLocationHistory },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Could not update settings' });
  }
});

module.exports = router;
