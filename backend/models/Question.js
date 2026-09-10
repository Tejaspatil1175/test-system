const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'code_rearrange'],
    default: 'mcq',
  },
  codeSnippet: {
    type: String,
    default: '',
  },
  options: [
    {
      type: String,
      required: true,
      trim: true,
    },
  ],
  correctOption: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', questionSchema);

