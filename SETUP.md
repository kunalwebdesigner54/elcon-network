# MLM P2P System - Setup Instructions

Complete setup guide for running both the backend and frontend of the MLM P2P Investment system.

## Quick Start Overview

```
Backend:   Node.js + Express + MongoDB on port 5000
Frontend:  React on port 3000
Admin Login Route: http://localhost:3000/admin-login
Admin Credentials: admin@gmail.com / admin123
```

## Prerequisites

### Required Software

1. **Node.js** (v14+) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download Community](https://www.mongodb.com/try/download/community)
3. **npm** or **yarn** (comes with Node.js)
4. **Git** (recommended)

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB
mongo --version
```

---

## Backend Setup (p2pbackend)

### Step 1: Navigate to Backend Folder

```bash
cd p2pbackend
```

### Step 2: Install Dependencies

```bash
npm install
```

Wait for all packages to install. You should see:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- express-validator
- nodemon (dev dependency)

### Step 3: Setup Environment Variables

Copy the template:
```bash
cp .env.example .env
```

Edit `.env` file and update if needed:
```env
MONGODB_URI=mongodb://localhost:27017/mlm_db
JWT_SECRET=my_super_strong_jwt_secret_change_this
PORT=5000
NODE_ENV=development
```

### Step 4: Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
- MongoDB should run as a service automatically after installation
- Or run: `mongod`

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongo --eval "db.adminCommand('ping')"
# Output: { "ok" : 1 }
```

### Step 5: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
✓ MongoDB Connected: localhost
✓ Admin user seeded successfully
✓ Server running on http://localhost:5000
✓ API endpoints available at http://localhost:5000/api/auth
✓ Admin credentials: admin@gmail.com / admin123
```

### Verify Backend is Running

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

---

## Frontend Setup (p2pfrontend)

### Step 1: Navigate to Frontend Folder

Open a **new terminal** and run:
```bash
cd p2pfrontend
```

### Step 2: Install Dependencies (if needed)

```bash
npm install
```

### Step 3: Start Frontend Development Server

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view p2pfrontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
```

The app should automatically open in your browser at `http://localhost:3000`.

### Step 4: Navigate to Admin Login

In your browser, go to:
```
http://localhost:3000/admin-login
```

Or click this route if available in your navigation.

---

## Admin Login

### Access Admin Login

**URL:** `http://localhost:3000/admin-login`

### Login Credentials

```
Email:    admin@gmail.com
Password: admin123
```

### What Happens

1. **Enter Credentials**: Email is pre-filled with `admin@gmail.com`, just enter password
2. **Validate**: Component checks that email is admin account
3. **API Call**: Sends login request to `http://localhost:5000/api/auth/login`
4. **Success**: 
   - JWT token stored in `localStorage` as `adminToken`
   - User info stored as `adminUser`
   - Redirects to `/admin/dashboard`
5. **Error**: Shows error message if credentials are invalid

### Troubleshooting Admin Login

| Issue | Solution |
|-------|----------|
| "Network error" | Ensure backend is running on port 5000 |
| "Invalid credentials" | Check email is `admin@gmail.com` and password is `admin123` |
| "Cannot reach server" | Verify backend started successfully, check firewall |
| Page shows blank | Check browser console (F12) for errors |

---

## Complete System Verification

### Checklist

- [ ] MongoDB is running
- [ ] Backend server started successfully (`npm run dev` in p2pbackend)
- [ ] Backend shows "Admin user seeded" message
- [ ] Frontend is running (`npm start` in p2pfrontend)
- [ ] Can access http://localhost:3000/admin-login
- [ ] Can see admin login form with email field filled
- [ ] Can login with admin@gmail.com / admin123
- [ ] Redirects to admin dashboard after login

### Test API Endpoints

#### Test Backend Connection

```bash
# Health check
curl http://localhost:5000/api/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'
```

---

## Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Start MongoDB: `brew services start mongodb-community`
- Check if port 27017 is in use: `lsof -i :27017`

#### Port 5000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Kill the process: `lsof -ti :5000 | xargs kill -9`
- Or change PORT in `.env` to 5001

#### Module not found errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Admin seeding fails
**Solution:**
```bash
# Run seed manually after server starts
npm run seed
```

### Frontend Issues

#### Port 3000 Already in Use
**Solution:**
```bash
# Change port when starting
PORT=3001 npm start
```

#### "Can't reach backend" at login
**Solution:**
- Ensure backend is running on port 5000
- Check CORS is enabled (it is by default)
- Check browser console (F12) for errors

#### Module import errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

#### React Development Server Won't Start
**Solution:**
```bash
# Clear cache and try again
npm start -- --reset-cache
```

---

## File Structure Overview

### Backend Structure
```
p2pbackend/
├── config/db.js                    # MongoDB connection
├── controllers/authController.js   # Login/Register logic
├── middleware/auth.js              # JWT verification
├── models/User.js                  # User database schema
├── routes/auth.js                  # API routes
├── server.js                       # Main server file
├── seed.js                         # Create admin user
├── .env.example                    # Environment template
├── .env                            # Your actual env (create this)
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
└── README.md                       # Backend documentation
```

### Frontend Structure
```
p2pfrontend/
├── src/
│   ├── Components/
│   │   └── Admin/
│   │       └── AdminLogin/
│   │           ├── AdminLogin.jsx      # Login component
│   │           └── AdminLogin.css      # Login styling
│   ├── App.js                         # Main app with routes
│   ├── App.css
│   ├── index.js
│   └── index.css
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── package.json
└── README.md
```

---

## Running Services

### Keep Services Running

You need **3 terminals** running simultaneously:

#### Terminal 1: MongoDB
```bash
brew services start mongodb-community
# Or on other OS: mongod
```

#### Terminal 2: Backend Server
```bash
cd p2pbackend
npm run dev
```

#### Terminal 3: Frontend Server
```bash
cd p2pfrontend
npm start
```

---

## API Reference

All API calls must include the JWT token for protected routes:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Login Endpoint
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

### Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Admin",
    "email": "admin@gmail.com",
    "role": "admin"
  }
}
```

---

## Default Admin Account

| Field | Value |
|-------|-------|
| Name | Admin |
| Email | admin@gmail.com |
| Password | admin123 |
| Role | admin |

This account is automatically created on first backend startup.

---

## Development Workflow

### Making Changes

1. **Backend Changes**: Edit files in `p2pbackend/`, server auto-restarts with nodemon
2. **Frontend Changes**: Edit files in `p2pfrontend/`, browser auto-refreshes

### Testing

1. Login to admin panel
2. Token is stored in `localStorage`
3. Access admin dashboard at `/admin/dashboard`

### Building for Production

```bash
# Frontend build
cd p2pfrontend
npm run build

# Output: build/ folder with optimized files

# Backend: already production-ready
# npm start (instead of npm run dev)
```

---

## Common Commands

```bash
# Backend
cd p2pbackend && npm install       # Install dependencies
npm run dev                         # Start with hot-reload
npm start                          # Start production
npm run seed                       # Seed admin manually

# Frontend
cd p2pfrontend && npm install      # Install dependencies
npm start                          # Start dev server
npm run build                      # Build for production
npm test                           # Run tests

# MongoDB
brew services start mongodb-community    # Start MongoDB (macOS)
brew services stop mongodb-community     # Stop MongoDB (macOS)
mongo                                    # Connect to MongoDB shell
```

---

## Next Steps

After successful setup:

1. **Explore Admin Dashboard** - Navigate admin features
2. **Test More Endpoints** - Create regular user accounts, test permissions
3. **Customize Styling** - Update AdminLogin colors and branding
4. **Add Features** - Extend with more admin functionality
5. **Database** - Create additional collections for MLM features
6. **Production** - Deploy backend and frontend to servers

---

## Important Notes

⚠️ **Security**
- Change `JWT_SECRET` in `.env` before production
- Use environment variables for sensitive data
- Don't commit `.env` file to git

⚠️ **Database**
- MongoDB data persists locally
- Back up regularly
- Don't expose MongoDB connection string publicly

⚠️ **CORS**
- Currently allows all origins (development)
- Restrict in production: `cors({ origin: 'https://yourdomain.com' })`

---

## Support

If you encounter issues:

1. Check terminal output for error messages
2. Verify all services are running
3. Review troubleshooting section above
4. Check individual README files in p2pbackend/ and p2pfrontend/
5. Ensure ports 3000, 5000, and 27017 are available

---

**Version**: 1.0.0  
**Last Updated**: May 14, 2026  
**System**: MLM P2P Investment Platform
