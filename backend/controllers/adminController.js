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
    const { questionText, options, correctOption, type, codeSnippet } = req.body;

    if (!questionText || !options || !Array.isArray(options) || options.length === 0 || !correctOption) {
      return res.status(400).json({ message: 'questionText, options (array), and correctOption are required' });
    }

    const question = new Question({
      questionText: questionText.trim(),
      type: type === 'code_rearrange' ? 'code_rearrange' : 'mcq',
      codeSnippet: codeSnippet ? codeSnippet.trim() : '',
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

const bulkImportQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'questions array is required' });
    }

    const validQuestions = questions
      .filter((q) => q.questionText && Array.isArray(q.options) && q.options.length >= 2 && q.correctOption)
      .map((q) => ({
        questionText: q.questionText.trim(),
        type: q.type === 'code_rearrange' ? 'code_rearrange' : 'mcq',
        codeSnippet: q.codeSnippet ? q.codeSnippet.trim() : '',
        options: q.options.map((opt) => String(opt).trim()),
        correctOption: q.correctOption.trim(),
      }));

    if (validQuestions.length === 0) {
      return res.status(400).json({ message: 'No valid questions found in payload' });
    }

    const inserted = await Question.insertMany(validQuestions);

    return res.status(201).json({
      message: `Successfully imported ${inserted.length} questions into the bank!`,
      count: inserted.length,
    });
  } catch (error) {
    console.error('Error importing questions:', error);
    return res.status(500).json({ message: 'Server error while importing questions' });
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

const { generateTeamPdf } = require('../utils/generatePdf');

const calculateResults = async (req, res) => {
  try {
    const questions = await Question.find();
    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q.correctOption);
    });

    const submissions = await Submission.find({ submitted: true });

    for (const submission of submissions) {
      let score = 0;
      if (Array.isArray(submission.answers)) {
        submission.answers.forEach((ans) => {
          if (ans.questionId && ans.selectedOption) {
            const correctOpt = questionMap.get(ans.questionId.toString());
            if (correctOpt && correctOpt.trim() === ans.selectedOption.trim()) {
              score += 1;
            }
          }
        });
      }
      submission.score = score;
      await submission.save();
    }

    return await getResults(req, res);
  } catch (error) {
    console.error('Error calculating results:', error);
    return res.status(500).json({ message: 'Server error calculating results' });
  }
};

const getResults = async (req, res) => {
  try {
    const submissions = await Submission.find({ submitted: true })
      .populate('teamId', 'teamName username')
      .sort({ score: -1, timeTakenMs: 1 });

    const results = submissions.map((sub, index) => ({
      rank: index + 1,
      submissionId: sub._id,
      teamId: sub.teamId ? sub.teamId._id : null,
      teamName: sub.teamId ? sub.teamId.teamName : 'Unknown Team',
      username: sub.teamId ? sub.teamId.username : '',
      score: sub.score !== null ? sub.score : 0,
      timeTakenMs: sub.timeTakenMs || 0,
      startTime: sub.startTime,
      endTime: sub.endTime,
      submitted: sub.submitted,
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({ message: 'Server error fetching results' });
  }
};

const downloadTeamPdf = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const submission = await Submission.findOne({ teamId });
    if (!submission) {
      return res.status(404).json({ message: 'No submission found for this team' });
    }

    const questions = await Question.find().sort({ _id: 1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${team.teamName.replace(/\s+/g, '_')}_result.pdf"`
    );

    generateTeamPdf(res, team, submission, questions);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Server error generating PDF' });
    }
  }
};

const clearSubmissions = async (req, res) => {
  try {
    const result = await Submission.deleteMany({});
    return res.status(200).json({
      message: 'All test submissions and results have been cleared successfully.',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing submissions:', error);
    return res.status(500).json({ message: 'Server error while clearing submissions' });
  }
};

const clearTeams = async (req, res) => {
  try {
    const teamResult = await Team.deleteMany({});
    const subResult = await Submission.deleteMany({});
    return res.status(200).json({
      message: 'All candidate teams and associated submissions have been deleted successfully.',
      deletedTeamsCount: teamResult.deletedCount,
      deletedSubmissionsCount: subResult.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing teams:', error);
    return res.status(500).json({ message: 'Server error while deleting teams' });
  }
};

const clearQuestions = async (req, res) => {
  try {
    const result = await Question.deleteMany({});
    return res.status(200).json({
      message: 'All questions have been cleared from the question bank.',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing questions:', error);
    return res.status(500).json({ message: 'Server error while clearing questions' });
  }
};

const clearEntireDatabase = async (req, res) => {
  try {
    const subResult = await Submission.deleteMany({});
    const teamResult = await Team.deleteMany({});
    const questionResult = await Question.deleteMany({});

    return res.status(200).json({
      message: 'System factory reset complete. All test data cleared (Admin credentials preserved).',
      details: {
        submissionsDeleted: subResult.deletedCount,
        teamsDeleted: teamResult.deletedCount,
        questionsDeleted: questionResult.deletedCount,
      },
    });
  } catch (error) {
    console.error('Error wiping database:', error);
    return res.status(500).json({ message: 'Server error during database reset' });
  }
};

module.exports = {
  createTeam,
  listTeams,
  addQuestion,
  bulkImportQuestions,
  getQuestions,
  deleteQuestion,
  calculateResults,
  getResults,
  downloadTeamPdf,
  clearSubmissions,
  clearTeams,
  clearQuestions,
  clearEntireDatabase,
};




