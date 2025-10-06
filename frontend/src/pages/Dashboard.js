import React, { useState, useEffect } from 'react';
import { Link as RouterLink, Routes, Route } from 'react-router-dom';
import BookDetails from './BookDetails';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  CardActions,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Book as BookIcon } from '@mui/icons-material';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddBook, setOpenAddBook] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    condition: 'good',
  });

  useEffect(() => {
    // In Dashboard.js, update the fetchData function
const fetchData = async () => {
  try {
    setLoading(true);
    const [booksRes, requestsRes, myRequestsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/books/my-books', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }),
      axios.get('http://localhost:5000/api/requests/my-books', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }),
      axios.get('http://localhost:5000/api/requests/my-requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
    ]);
    
    setMyBooks(booksRes.data);
    setRequests(requestsRes.data);
    setMyRequests(myRequestsRes.data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAddBook = () => {
    setOpenAddBook(true);
  };

  const handleCloseAddBook = () => {
    setOpenAddBook(false);
    setNewBook({
      title: '',
      author: '',
      condition: 'good',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/books',
        newBook,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setMyBooks([...myBooks, data]);
      handleCloseAddBook();
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${requestId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (status === 'accepted') {
        const updatedRequests = requests.map(req => 
          req.id === requestId ? { ...req, status } : req
        );
        setRequests(updatedRequests);
        
        const request = requests.find(req => req.id === requestId);
        if (request) {
          setMyBooks(myBooks.map(book => 
            book.id === request.bookId ? { ...book, status: 'traded' } : book
          ));
        }
      } else {
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status } : req
        ));
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddBook}
        >
          Add Book
        </Button>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="My Books" />
            <Tab label="Requests for My Books" />
            <Tab label="My Requests" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {myBooks.length > 0 ? (
              myBooks.map((book) => (
                <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '200px',
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      <BookIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {book.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        by {book.author}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip
                          label={book.status}
                          color={
                            book.status === 'available' ? 'success' :
                            book.status === 'traded' ? 'secondary' : 'default'
                          }
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {book.condition}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        component={RouterLink}
                        to={`/books/${book.id}`}
                        size="small"
                        color="primary"
                        fullWidth
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" gutterBottom>
                    You haven't added any books yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddBook}
                    sx={{ mt: 2 }}
                  >
                    Add Your First Book
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {requests.length > 0 ? (
            <List>
              {requests.map((request) => {
                const book = myBooks.find(b => b.id === request.bookId);
                if (!book) return null;
                
                return (
                  <React.Fragment key={request.id}>
                    <ListItem
                      secondaryAction={
                        request.status === 'pending' ? (
                          <Box>
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              sx={{ mr: 1 }}
                              onClick={() => handleRequestAction(request.id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleRequestAction(request.id, 'declined')}
                            >
                              Decline
                            </Button>
                          </Box>
                        ) : (
                          <Chip
                            label={request.status}
                            color={request.status === 'accepted' ? 'success' : 'default'}
                            size="small"
                          />
                        )
                      }
                    >
                      <ListItemText
                        primary={`${request.requesterName} wants to trade for "${book.title}"`}
                        secondary={`Status: ${request.status} • ${new Date(request.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                You don't have any book requests yet.
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {myRequests.length > 0 ? (
            <List>
              {myRequests.map((request) => {
                const book = myBooks.find(b => b.id === request.bookId) || {};
                return (
                  <React.Fragment key={request.id}>
                    <ListItem>
                      <ListItemText
                        primary={`Your request for "${book.title || 'Unknown Book'}"`}
                        secondary={`Status: ${request.status} • ${new Date(request.createdAt).toLocaleDateString()}`}
                      />
                      <Chip
                        label={request.status}
                        color={
                          request.status === 'accepted' ? 'success' :
                          request.status === 'declined' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                You haven't made any requests yet.
              </Typography>
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Browse Books
              </Button>
            </Paper>
          )}
        </TabPanel>
      </Box>

      {/* Add Book Dialog */}
      <Dialog open={openAddBook} onClose={handleCloseAddBook} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitBook}>
          <DialogTitle>Add a New Book</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  name="title"
                  label="Book Title"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newBook.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="author"
                  label="Author"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newBook.author}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="condition-label">Condition</InputLabel>
                  <Select
                    labelId="condition-label"
                    name="condition"
                    value={newBook.condition}
                    label="Condition"
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="like new">Like New</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddBook}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Book
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Nested Routes */}
      <Routes>
        <Route path="books/:id" element={<BookDetails />} />
      </Routes>
    </Container>
  );
};

export default Dashboard;