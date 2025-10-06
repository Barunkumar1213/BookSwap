const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData, usersFile } = require('../utils/fileStorage');

class User {
  static async create({ name, email, password }) {
    const users = readData(usersFile);
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData(usersFile, users);
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static findByEmail(email) {
    const users = readData(usersFile);
    return users.find(user => user.email === email) || null;
  }

  static findById(id) {
    const users = readData(usersFile);
    return users.find(user => user.id === id) || null;
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;