require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas for seeding.');

    const adminUsername = process.env.ADMIN_USERNAME || 'tejaspatil1175@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'tp8788244416';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    let admin = await Admin.findOne({ username: adminUsername });
    if (admin) {
      admin.passwordHash = passwordHash;
      await admin.save();
      console.log(`Admin user '${adminUsername}' updated with new password.`);
    } else {
      admin = new Admin({
        username: adminUsername,
        passwordHash,
      });
      await admin.save();
      console.log(`Admin user created successfully!`);
    }
    console.log(`Username / Email: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
