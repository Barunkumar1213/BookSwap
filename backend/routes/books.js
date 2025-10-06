// routes/books.js
const express = require('express');
const auth = require('../middleware/auth');
const Book = require('../models/Book');
const router = express.Router();
const User = require('../models/User');

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ 
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only images are allowed (jpeg, jpg, png)'));
//     }
//   }
// });

// Get all books
router.get('/', (req, res) => {
  try {
    const books = Book.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's books
router.get('/my-books', auth, (req, res) => {
  try {
    const books = Book.findByUserId(req.user.id);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Include user information
    const user = await User.findById(book.userId);
    const bookWithUser = {
      ...book,
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || ''
    };
    
    res.json(bookWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update book
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, author, condition } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the user is the owner of the book
    if (book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    const updatedBook = await Book.updateBook(req.params.id, { 
      title, 
      author, 
      condition 
    });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Error updating book' });
    }

    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new book
// Update the POST /api/books route
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, condition } = req.body;

    if (!title || !author || !condition) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const book = Book.create({
      title,
      author,
      condition,
      userId: req.user.id
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book status
router.patch('/:id/status', auth, (req, res) => {
  try {
    const { status } = req.body;
    const book = Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedBook = Book.updateStatus(req.params.id, status);
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book
router.delete('/:id', auth, (req, res) => {
  try {
    const book = Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const success = Book.delete(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;