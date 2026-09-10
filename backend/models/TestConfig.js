const mongoose = require('mongoose');

const testConfigSchema = new mongoose.Schema({
  isTestActive: {
    type: Boolean,
    default: false,
  },
  testStartTime: {
    type: Date,
    default: null,
  },
  durationMinutes: {
    type: Number,
    default: 60,
  },
  testEnded: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TestConfig', testConfigSchema);
