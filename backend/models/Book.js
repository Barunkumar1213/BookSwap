// models/Book.js
const { v4: uuidv4 } = require('uuid');
const { readData, writeData, booksFile } = require('../utils/fileStorage');

class Book {
  static create({ title, author, condition, userId , status = 'available' }) {
    const books = readData(booksFile);
    const newBook = {
      id: uuidv4(),
      title,
      author,
      condition,
      userId,
      status: status,
  createdAt: { type: Date, default: Date.now }

    };
  
    books.push(newBook);
    writeData(booksFile, books);
    return newBook;
  }

  static findByUserId(userId) {
    const books = readData(booksFile);
    return books.filter(book => book.userId === userId);
  }

  static findAll() {
    return readData(booksFile);
  }

  static findById(id) {
    const books = readData(booksFile);
    return books.find(book => book.id === id) || null;
  }
  static async findByIdAndUpdate(id, updates, options = {}) {
    const books = readData(booksFile);
    const index = books.findIndex(book => book.id === id);
    
    if (index === -1) {
      return null;
    }
  
    const updatedBook = {
      ...books[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
  
    books[index] = updatedBook;
    writeData(booksFile, books);
    return updatedBook;
  }
  static async updateBook(id, updates) {
    const books = readData(booksFile);
    const index = books.findIndex(book => book.id === id);
    
    if (index === -1) {
      return null;
    }
  
    const updatedBook = {
      ...books[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
  
    books[index] = updatedBook;
    writeData(booksFile, books);
    return updatedBook;
  }
  static updateStatus(id, status) {
    const books = readData(booksFile);
    const bookIndex = books.findIndex(book => book.id === id);
    
    if (bookIndex === -1) return null;

    books[bookIndex] = {
      ...books[bookIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    writeData(booksFile, books);
    return books[bookIndex];
  }

  static delete(id, userId) {
    const books = readData(booksFile);
    const bookIndex = books.findIndex(book => book.id === id && book.userId === userId);
    
    if (bookIndex === -1) return false;

    books.splice(bookIndex, 1);
    writeData(booksFile, books);
    return true;
  }
}

module.exports = Book;