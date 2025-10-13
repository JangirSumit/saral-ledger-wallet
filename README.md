# Saral Ledger Wallet Application

A full-stack application with React frontend and .NET backend for ledger management with user roles and approval workflow.

## Features

- **User Authentication**: Sign-in with JWT tokens
- **Role-based Access**: Admin and User roles
- **Ledger Management**: Users can upload ledgers, admins can approve/reject
- **Wallet System**: Approved ledgers add to user wallet amount
- **Admin Panel**: Create new users, manage pending ledgers

## Tech Stack

### Backend (.NET 9)
- ASP.NET Core Web API
- Entity Framework Core with SQLite
- JWT Authentication
- BCrypt for password hashing

### Frontend (React + TypeScript)
- React 18 with TypeScript
- Axios for API calls
- Basic CSS styling

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend/SaralLedgerAPI
   ```

2. Restore packages:
   ```bash
   dotnet restore
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:7000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend/saral-ledger-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

## Default Users

The application comes with pre-seeded users:

### Admin User
- **Username**: admin
- **Password**: admin123
- **Role**: Admin

### Test User
- **Username**: user1
- **Password**: user123
- **Role**: User

## Usage

### For Users:
1. Sign in with user credentials
2. View profile and wallet amount
3. Upload ledgers with amount and description
4. View ledger status (Pending/Approved/Rejected)

### For Admins:
1. Sign in with admin credentials
2. View all pending ledgers
3. Approve or reject ledgers
4. Create new users
5. View all users and their wallet amounts

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/user/profile` - Get user profile
- `POST /api/user/create` - Create new user (Admin only)
- `GET /api/user/all` - Get all users (Admin only)

### Ledger Management
- `POST /api/ledger/upload` - Upload ledger
- `GET /api/ledger/my-ledgers` - Get user's ledgers
- `GET /api/ledger/pending` - Get pending ledgers (Admin only)
- `POST /api/ledger/approve/{id}` - Approve ledger (Admin only)
- `POST /api/ledger/reject/{id}` - Reject ledger (Admin only)

## Database

The application uses SQLite database (`saralledger.db`) which is created automatically when you run the backend for the first time.

## Security Features

- JWT token-based authentication
- Password hashing with BCrypt
- Role-based authorization
- CORS configuration for React frontend

## Development Notes

- The backend runs on HTTPS (port 7000)
- The frontend runs on HTTP (port 3000)
- CORS is configured to allow requests from the React app
- Database migrations are applied automatically on startup
- Seed data is inserted on first run