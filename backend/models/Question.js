const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
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
});

module.exports = mongoose.model('Question', questionSchema);
