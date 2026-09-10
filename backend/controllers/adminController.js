const bcrypt = require('bcryptjs');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Question = require('../models/Question');

const createTeam = async (req, res) => {
  try {
    const { teamName, username, password } = req.body;

    if (!teamName || !username || !password) {
      return res.status(400).json({ message: 'teamName, username, and password are required' });
    }

    const existingTeam = await Team.findOne({ username });
    if (existingTeam) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newTeam = new Team({
      teamName: teamName.trim(),
      username: username.trim(),
      passwordHash,
    });

    await newTeam.save();

    return res.status(201).json({
      message: 'Team created successfully',
      team: {
        id: newTeam._id,
        teamName: newTeam.teamName,
        username: newTeam.username,
        createdAt: newTeam.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Server error while creating team' });
  }
};

const listTeams = async (req, res) => {
  try {
    const teams = await Team.find().select('-passwordHash').sort({ createdAt: -1 });

    const submissions = await Submission.find();
    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(sub.teamId.toString(), sub);
    });

    const teamsWithStatus = teams.map((team) => {
      const submission = submissionMap.get(team._id.toString());
      return {
        _id: team._id,
        id: team._id,
        teamName: team.teamName,
        username: team.username,
        createdAt: team.createdAt,
        submitted: submission ? submission.submitted : false,
        score: submission ? submission.score : null,
        startTime: submission ? submission.startTime : null,
        endTime: submission ? submission.endTime : null,
        timeTakenMs: submission ? submission.timeTakenMs : null,
      };
    });

    return res.status(200).json(teamsWithStatus);
  } catch (error) {
    console.error('Error listing teams:', error);
    return res.status(500).json({ message: 'Server error while fetching teams' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { questionText, options, correctOption } = req.body;

    if (!questionText || !options || !Array.isArray(options) || options.length === 0 || !correctOption) {
      return res.status(400).json({ message: 'questionText, options (array), and correctOption are required' });
    }

    const question = new Question({
      questionText: questionText.trim(),
      options: options.map((opt) => String(opt).trim()),
      correctOption: correctOption.trim(),
    });

    await question.save();

    return res.status(201).json({
      message: 'Question added successfully',
      question,
    });
  } catch (error) {
    console.error('Error adding question:', error);
    return res.status(500).json({ message: 'Server error while adding question' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ _id: 1 });
    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    return res.status(500).json({ message: 'Server error while fetching questions' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    return res.status(200).json({ message: 'Question deleted successfully', id });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ message: 'Server error while deleting question' });
  }
};

module.exports = {
  createTeam,
  listTeams,
  addQuestion,
  getQuestions,
  deleteQuestion,
};


