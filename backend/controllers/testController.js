const Submission = require('../models/Submission');

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

module.exports = {
  startTest,
};
