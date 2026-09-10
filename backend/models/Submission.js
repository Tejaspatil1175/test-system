const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: null,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  timeTakenMs: {
    type: Number,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Submission', submissionSchema);
