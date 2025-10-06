const fs = require('fs');
const path = require('path');

const requestsFile = path.join(__dirname, '../data/requests.json');

function readData() {
  try {
    const data = fs.readFileSync(requestsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(requestsFile, JSON.stringify(data, null, 2));
}

class Request {
  static async create(requestData) {
    const requests = readData();
    const newRequest = {
      id: require('crypto').randomUUID(),
      ...requestData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    requests.push(newRequest);
    writeData(requests);
    return newRequest;
  }

  static async findById(id) {
    const requests = readData();
    return requests.find(request => request.id === id) || null;
  }

  static async findByBookId(bookId) {
    const requests = readData();
    return requests.filter(request => request.bookId === bookId);
  }

  static async findByRequesterId(requesterId) {
    const requests = readData();
    return requests.filter(request => request.requesterId === requesterId);
  }

  static async findByBookIds(bookIds) {
    const requests = readData();
    return requests.filter(request => bookIds.includes(request.bookId));
  }

  static async findByBookAndRequester(bookId, requesterId) {
    const requests = readData();
    return requests.find(
      request => request.bookId === bookId && request.requesterId === requesterId
    ) || null;
  }

  static async updateStatus(id, status) {
    const requests = readData();
    const index = requests.findIndex(request => request.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedRequest = {
      ...requests[index],
      status,
      updatedAt: new Date().toISOString()
    };

    requests[index] = updatedRequest;
    writeData(requests);
    return updatedRequest;
  }
}

module.exports = Request;