// utils/fileStorage.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const usersFile = path.join(dataDir, 'users.json');
const booksFile = path.join(dataDir, 'books.json');
const requestsFile = path.join(dataDir, 'requests.json');

const initializeDataFiles = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(booksFile)) {
    fs.writeFileSync(booksFile, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(requestsFile)) {
    fs.writeFileSync(requestsFile, JSON.stringify([], null, 2));
  }
};

const readData = (file) => {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${file}:`, error);
    return [];
  }
};

const writeData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to file ${file}:`, error);
    return false;
  }
};

module.exports = {
  initializeDataFiles,
  readData,
  writeData,
  usersFile,
  booksFile,
  requestsFile
};