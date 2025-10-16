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
- React Router for navigation
- Responsive design with Bootstrap-inspired styling

## Quick Start

### Using Pre-built Binaries

1. Download the latest release from [GitHub Releases](../../releases)
2. Extract the appropriate zip file for your platform:
   - `saral-ledger-wallet-windows-x64.zip` for Windows
   - `saral-ledger-wallet-linux-x64.zip` for Linux
3. Run the executable:
   - Windows: `SaralLedgerAPI.exe`
   - Linux: `./SaralLedgerAPI`
4. Open your browser to `https://localhost:7000`

### Development Setup

#### Backend Setup

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

#### Frontend Setup

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
2. View profile and wallet amount on dashboard
3. Upload ledgers with amount, description, and evidence files
4. View ledger status (Pending/Approved/Rejected)
5. Edit or delete pending ledgers

### For Admins:
1. Sign in with admin credentials
2. View all pending ledgers on home page
3. Approve or reject ledgers with evidence file download
4. Navigate to Users page to create new users
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
- `POST /api/ledger/upload` - Upload ledger with file
- `GET /api/ledger/my-ledgers` - Get user's ledgers
- `GET /api/ledger/pending` - Get pending ledgers (Admin only)
- `POST /api/ledger/approve/{id}` - Approve ledger (Admin only)
- `POST /api/ledger/reject/{id}` - Reject ledger (Admin only)
- `PUT /api/ledger/{id}` - Update ledger
- `DELETE /api/ledger/{id}` - Delete ledger
- `GET /api/ledger/{id}/download` - Download evidence file

## Routes

- `/` - Dashboard (User ledger management or Admin pending ledgers)
- `/ledgers` - Admin ledger approval page
- `/users` - Admin user management page
- `/login` - Login page

## Database

The application uses SQLite database (`saralledger.db`) which is created automatically when you run the backend for the first time.

## Security Features

- JWT token-based authentication
- Password hashing with BCrypt
- Role-based authorization
- File upload validation
- CORS configuration for React frontend

## CI/CD

The project includes GitHub Actions workflows:

- **CI**: Runs on every push/PR to test builds
- **Build and Release**: Creates deployable binaries on tag push

To create a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Development Notes

- The backend runs on HTTPS (port 7000)
- The frontend runs on HTTP (port 3000) in development
- CORS is configured to allow requests from the React app
- Database migrations are applied automatically on startup
- Seed data is inserted on first run
- Frontend is built and served by the backend in production

## License

This project is licensed under the MIT License.