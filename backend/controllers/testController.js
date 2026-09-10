const Submission = require('../models/Submission');
const Question = require('../models/Question');

const startTest = async (req, res) => {
  try {
    const teamId = req.user.id;

    if (req.user.role !== 'team') {
      return res.status(403).json({ message: 'Access denied. Team account required.' });
    }

    let submission = await Submission.findOne({ teamId });

    if (submission) {
      if (submission.submitted) {
        return res.status(403).json({ message: 'Test has already been submitted.' });
      }
      return res.status(200).json({
        message: 'Test in progress',
        startTime: submission.startTime,
        submitted: false,
      });
    }

    const startTime = new Date();
    submission = new Submission({
      teamId,
      startTime,
      submitted: false,
      answers: [],
    });

    await submission.save();

    return res.status(200).json({
      message: 'Test started successfully',
      startTime: submission.startTime,
      submitted: false,
    });
  } catch (error) {
    console.error('Error starting test:', error);
    return res.status(500).json({ message: 'Server error starting test' });
  }
};

const getTestQuestions = async (req, res) => {
  try {
    if (req.user.role !== 'team') {
      return res.status(403).json({ message: 'Access denied. Team account required.' });
    }

    const questions = await Question.find().select('-correctOption').sort({ _id: 1 });
    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching test questions:', error);
    return res.status(500).json({ message: 'Server error fetching questions' });
  }
};

module.exports = {
  startTest,
  getTestQuestions,
};

