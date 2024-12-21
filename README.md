# AI Guilt - AI Ethics Discussion Platform

A modern web application for discussing AI ethics and sharing experiences with artificial intelligence.

## Features

- User Authentication System
  - Registration with email verification
  - Secure login with JWT tokens
  - Password reset functionality
- User Profile Management
  - Update profile information
  - Change password
  - Delete account
- Dark Theme UI
  - Modern, responsive design
  - Consistent styling across pages
  - Smooth transitions and animations

## Tech Stack

- Frontend:
  - Vue.js 3.2.36
  - Bootstrap 5.3.0
  - Modern JavaScript (ES6+)
- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - JWT for authentication
- Security:
  - Password hashing with bcrypt
  - HTTP-only cookies
  - CORS protection

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aiguilt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/aiguilt
   JWT_SECRET=your_jwt_secret_key_here
   PORT=3000
   ```

4. Start MongoDB:
   ```bash
   mongod
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000` in your browser

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user

### User Management
- GET `/api/users/profile/:id` - Get user profile
- PUT `/api/users/profile` - Update user profile
- PUT `/api/users/password` - Update password
- DELETE `/api/users` - Delete account

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
