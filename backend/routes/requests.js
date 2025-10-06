// In routes/requests.js
const express = require('express');
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const Book = require('../models/Book');
const router = express.Router();

// Get all requests for user's books
router.get('/my-books', auth, async (req, res) => {
  try {
    const books = await Book.findByUserId(req.user.id);
    const bookIds = books.map(book => book.id);
    const requests = await Request.findByBookIds(bookIds);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests made by the user
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.findByRequesterId(req.user.id);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching my requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new request
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, message } = req.body;
    
    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.status !== 'available') {
      return res.status(400).json({ message: 'Book is not available for swapping' });
    }
    if (book.userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot request your own book' });
    }

    // Check if request already exists
    const existingRequest = await Request.findByBookAndRequester(bookId, req.user.id);
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested this book' });
    }

    const request = await Request.create({
      bookId,
      requesterId: req.user.id,
      message,
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the user owns the book being requested
    const book = await Book.findById(request.bookId);
    if (!book || book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update request status
    const updatedRequest = await Request.updateStatus(req.params.id, status);
    
    // If request is accepted, update book status
    if (status === 'accepted') {
      await Book.updateStatus(request.bookId, 'traded');
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;