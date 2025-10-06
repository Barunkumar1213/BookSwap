# BookSwap

A web application for book lovers to trade books with others in their community.

## Features

- User authentication (Register/Login)
- Browse available books
- Add books to your collection
- Request to swap books with other users
- Manage your book requests
- View your book collection and swap history

## Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls
- Context API for state management

### Backend
- Node.js
- Express.js
- JSON Web Tokens (JWT) for authentication
- File-based data storage (JSON files)
- RESTful API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/BookSwap.git](https://github.com/yourusername/BookSwap.git)
   cd BookSwap


install backend dependencies:
```bash
cd backend
npm install
```

install frontend dependencies:
```bash
cd ../frontend
npm install
```

create a .env file in the backend directory and add the following variables:
```bash
PORT=5000
JWT_SECRET=your_jwt_secret
```

create a .env file in the frontend directory and add the following variables:
```bash
REACT_APP_API_URL=http://localhost:5000
```

run the backend server:
```bash
cd backend
npm start
```

run the frontend server:
```bash
cd frontend
npm start
```

open http://localhost:3000 in your browser to see the application.

api endpoints:

Auth:
```bash
POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
```

Books:
```bash
GET /api/books - Get all books
GET /api/books/my-books - Get current user's books
GET /api/books/:id - Get a single book
POST /api/books - Add a new book
PUT /api/books/:id - Update a book
DELETE /api/books/:id - Delete a book
```

Requests:
```bash
GET /api/requests/my-books - Get requests for user's books
GET /api/requests/my-requests - Get user's requests
POST /api/requests - Create a new request
PATCH /api/requests/:id/status - Update request status
```

Project Structure 

BookSwap/
├── backend/               # Backend server
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── data/             # JSON data storage
│   ├── middleware/       # Custom middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── server.js         # Main server file
│   └── package.json
│
└── frontend/             # Frontend React app
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable components
        ├── context/      # React context
        ├── pages/        # Page components
        ├── App.js        # Main App component
        └── index.js      # Entry point
