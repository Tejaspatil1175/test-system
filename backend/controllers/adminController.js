const bcrypt = require('bcryptjs');
const Team = require('../models/Team');

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

module.exports = {
  createTeam,
};
