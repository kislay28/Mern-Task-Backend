# Assignment Workflow Portal - Backend

## Features (Backend)
- **Assignment Management**: Create, edit, delete assignments
- **Status Control**: Manage assignment lifecycle (Draft → Published → Completed)
- **Submission Tracking**: View and review student submissions
- **Dashboard Analytics**: Overview of assignments and submission statistics
- **JWT Authentication**: Secure role-based access control
- **Real-time Validation**: Backend input validation
- **Error Handling**
- **Security**: Rate limiting, CORS, and security headers

## Tech Stack (Backend)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

## Project Structure (Backend)
```
backend/
├── config/
│   ├── database.js
│   └── jwt.js
├── controllers/
│   ├── authController.js
│   ├── assignmentController.js
│   └── submissionController.js
├── middleware/
│   ├── auth.js
│   ├── roleAuth.js
│   └── validation.js
├── models/
│   ├── User.js
│   ├── Assignment.js
│   └── Submission.js
├── routes/
│   ├── auth.js
│   ├── assignments.js
│   └── submissions.js
├── server.js
├── package.json
└── .env
```

## Setup Instructions (Backend)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/assignment-portal
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=24h
   ```

5. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `assignment-portal`
3. The application will automatically create collections and indexes

## API Endpoints
### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (for testing)
- `GET /api/auth/me` - Get current user

### Assignments
- `GET /api/assignments` - Get assignments (filtered by role)
- `GET /api/assignments/:id` - Get specific assignment
- `POST /api/assignments` - Create assignment (teacher only)
- `PUT /api/assignments/:id` - Update assignment (teacher only)
- `DELETE /api/assignments/:id` - Delete assignment (teacher only)
- `PUT /api/assignments/:id/status` - Update assignment status (teacher only)

### Submissions
- `POST /api/submissions` - Create submission (student only)
- `GET /api/submissions/assignment/:assignmentId` - Get submissions for assignment (teacher only)
- `GET /api/submissions/my` - Get user's submissions (student only)
- `GET /api/submissions/:id` - Get specific submission
- `PUT /api/submissions/:id/review` - Mark submission as reviewed (teacher only)

## Development (Backend)
### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Environment Variables (Backend)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assignment-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:3000
```

## Demo Accounts
### Teacher Account
- Email: `teacher@example.com`
- Password: `teacher123`

### Student Account
- Email: `student@example.com`
- Password: `student123`

## Security Features
- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs with salt rounds
- **Input Validation**
- **Rate Limiting**
- **CORS Configuration**
- **Security Headers** via Helmet.js
- **Role-based Access Control**

## License
This project is licensed under the MIT License.

## Support
For support or questions, please open an issue in the repository.
