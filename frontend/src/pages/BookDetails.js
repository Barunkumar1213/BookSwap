import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar
} from '@mui/material';
import axios from 'axios';

export const BookDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editedBook, setEditedBook] = useState({
    title: '',
    author: '',
    condition: 'good'
  });

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(data);
        setEditedBook({
          title: data.title,
          author: data.author,
          condition: data.condition
        });
      } catch (err) {
        setError('Failed to fetch book details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleOpenRequestDialog = () => {
    setOpenRequestDialog(true);
  };

  const handleCloseRequestDialog = () => {
    setOpenRequestDialog(false);
    setMessage('');
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/books/${id}`,
        {
          title: editedBook.title,
          author: editedBook.author,
          condition: editedBook.condition
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBook(data);
      setEditMode(false);
      showSnackbar('Book updated successfully', 'success');
    } catch (error) {
      console.error('Error updating book:', error);
      showSnackbar('Failed to update book', 'error');
    }
  };

  const handleSendRequest = async () => {
    try {
      await axios.post('http://localhost:5000/api/requests', {
        bookId: id,
        message,
      });
      setRequestSent(true);
      handleCloseRequestDialog();
      showSnackbar('Request sent successfully', 'success');
    } catch (err) {
      setError('Failed to send request');
      console.error('Error:', err);
      showSnackbar('Failed to send request', 'error');
    }
  };

  const handleDeleteBook = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        showSnackbar('Book deleted successfully', 'success');
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete book');
        console.error('Error:', err);
        showSnackbar('Failed to delete book', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button component={RouterLink} to="/" variant="contained" color="primary">
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Book not found
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" color="primary">
          Back to Home
        </Button>
      </Container>
    );
  }

  const isOwner = currentUser && currentUser.id === book.userId;
  const canRequest = currentUser && !isOwner && book.status === 'available' && !requestSent;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                width: '100%',
                height: '400px',
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
              }}
            >
              <BookIcon sx={{ fontSize: 100, opacity: 0.5, color: 'text.secondary' }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {book.title}
                  </Typography>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    by {book.author}
                  </Typography>
                </Box>
                <Chip
                  label={book.status}
                  color={
                    book.status === 'available' ? 'success' :
                    book.status === 'traded' ? 'secondary' : 'default'
                  }
                  size="medium"
                  sx={{ height: 32, fontSize: '0.875rem' }}
                />
              </Box>

              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Condition:
                </Typography>
                <Typography variant="body1" paragraph>
                  {book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
                  <Avatar
                    alt={book?.userName || 'User'}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {book?.userName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">
                      Listed by: {book?.userName || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {book?.userEmail || ''}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Listed on:
                </Typography>
                <Typography variant="body1" paragraph>
                  {new Date(book.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {isOwner ? (
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Book
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteBook}
                  >
                    Delete Book
                  </Button>
                </Box>
              ) : canRequest ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleOpenRequestDialog}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Request to Swap
                </Button>
              ) : requestSent ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Your swap request has been sent!
                </Alert>
              ) : book.status === 'traded' ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This book has already been traded.
                </Alert>
              ) : !currentUser ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please <RouterLink to="/login">log in</RouterLink> to request this book.
                </Alert>
              ) : null}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Request Dialog */}
      <Dialog open={openRequestDialog} onClose={handleCloseRequestDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request to Swap</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You're requesting to swap for <strong>{book.title}</strong> by {book.author}.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Message (optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to the book owner..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestDialog}>Cancel</Button>
          <Button onClick={handleSendRequest} variant="contained" color="primary">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditBook}>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Book Title"
              type="text"
              fullWidth
              variant="outlined"
              value={editedBook.title}
              onChange={(e) => setEditedBook({...editedBook, title: e.target.value})}
              required
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              name="author"
              label="Author"
              type="text"
              fullWidth
              variant="outlined"
              value={editedBook.author}
              onChange={(e) => setEditedBook({...editedBook, author: e.target.value})}
              required
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="condition-label">Condition</InputLabel>
              <Select
                labelId="condition-label"
                name="condition"
                value={editedBook.condition}
                label="Condition"
                onChange={(e) => setEditedBook({...editedBook, condition: e.target.value})}
                required
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="like new">Like New</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookDetails;