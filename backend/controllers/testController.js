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

const submitTest = async (req, res) => {
  try {
    const teamId = req.user.id;

    if (req.user.role !== 'team') {
      return res.status(403).json({ message: 'Access denied. Team account required.' });
    }

    let submission = await Submission.findOne({ teamId });
    if (!submission) {
      submission = new Submission({
        teamId,
        startTime: new Date(Date.now() - 3600000), // fallback if not started
      });
    }

    if (submission.submitted) {
      return res.status(403).json({ message: 'Test has already been submitted.' });
    }

    const endTime = new Date();
    const startTimeMs = submission.startTime ? new Date(submission.startTime).getTime() : endTime.getTime();
    const timeTakenMs = Math.max(0, endTime.getTime() - startTimeMs);

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

    submission.answers = answers;
    submission.endTime = endTime;
    submission.timeTakenMs = timeTakenMs;
    submission.submitted = true;

    await submission.save();

    return res.status(200).json({
      message: 'Test submitted successfully',
      submitted: true,
      timeTakenMs,
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({ message: 'Server error during test submission' });
  }
};

const autosaveAnswers = async (req, res) => {
  try {
    const teamId = req.user.id;

    if (req.user.role !== 'team') {
      return res.status(403).json({ message: 'Access denied. Team account required.' });
    }

    let submission = await Submission.findOne({ teamId });
    if (!submission) {
      submission = new Submission({
        teamId,
        startTime: new Date(),
        submitted: false,
      });
    }

    if (submission.submitted) {
      return res.status(403).json({ message: 'Test has already been submitted.' });
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    submission.answers = answers;

    await submission.save();

    return res.status(200).json({
      message: 'Answers saved successfully',
    });
  } catch (error) {
    console.error('Error autosaving answers:', error);
    return res.status(500).json({ message: 'Server error during autosave' });
  }
};

module.exports = {
  startTest,
  getTestQuestions,
  submitTest,
  autosaveAnswers,
};


