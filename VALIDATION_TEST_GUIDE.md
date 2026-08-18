# Strict Registration & Profile Validation Test Guide

## Implementation Summary

The backend now enforces **"ONE PERSON, ONE ID POLICY"** with comprehensive duplicate prevention:

### Database Schema Updates
- **Email**: Unique constraint (existing)
- **Mobile Number (contactNo)**: Unique constraint (new)
- **Aadhaar Number (aadharNo)**: Unique constraint (new)  
- **PAN Card (panNo)**: Unique constraint (new) - added as root-level field
- **Member ID (memberId)**: Auto-generated unique ID with "EL" prefix

### Controller Validation
All duplicate checks implemented at application level before user creation

---

## Test Scenarios

### 1. Registration Duplicate Validation

#### Test Case 1.1: Duplicate Email
```
Endpoint: POST /api/auth/register
Request body:
{
  "name": "Test User",
  "email": "existing@example.com",  // Already registered
  "contactNo": "9876543210",
  "aadharNo": "123456789012",
  "panNo": "ABCDE1234F",
  "password": "Password123",
  ...
}

Expected Response: HTTP 409 Conflict
{
  "success": false,
  "message": "Email already registered",
  "code": "EMAIL_DUPLICATE"
}
```

#### Test Case 1.2: Duplicate Mobile Number
```
Endpoint: POST /api/auth/register
Request body:
{
  "name": "Test User 2",
  "email": "newemail@example.com",
  "contactNo": "9876543210",  // Already registered to another user
  "aadharNo": "999888777666",
  "panNo": "XYZPQ9876K",
  "password": "Password123",
  ...
}

Expected Response: HTTP 409 Conflict
{
  "success": false,
  "message": "Mobile number already registered",
  "code": "MOBILE_DUPLICATE"
}
```

#### Test Case 1.3: Duplicate Aadhaar Number
```
Endpoint: POST /api/auth/register
Request body:
{
  "name": "Test User 3",
  "email": "another@example.com",
  "contactNo": "7654321098",
  "aadharNo": "123456789012",  // Already registered to another user
  "panNo": "GHIJK5678L",
  "password": "Password123",
  ...
}

Expected Response: HTTP 409 Conflict
{
  "success": false,
  "message": "Aadhaar number already used",
  "code": "AADHAAR_DUPLICATE"
}
```

#### Test Case 1.4: Duplicate PAN Card
```
Endpoint: POST /api/auth/register
Request body:
{
  "name": "Test User 4",
  "email": "new4@example.com",
  "contactNo": "6543210987",
  "aadharNo": "111222333444",
  "panNo": "ABCDE1234F",  // Already registered to another user
  "password": "Password123",
  ...
}

Expected Response: HTTP 409 Conflict
{
  "success": false,
  "message": "PAN card already exists",
  "code": "PAN_DUPLICATE"
}
```

#### Test Case 1.5: All Fields Unique - Successful Registration
```
Endpoint: POST /api/auth/register
Request body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "contactNo": "9988776655",
  "aadharNo": "555666777888",
  "panNo": "MNOPQ1234R",
  "password": "Password123",
  ...
}

Expected Response: HTTP 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "memberId": "EL12345678",  // Auto-generated
    "email": "john@example.com",
    "contactNo": "9988776655",
    "aadharNo": "555666777888",
    "panNo": "MNOPQ1234R",
    ...
  }
}
```

---

### 2. Profile Update Duplicate Validation

#### Test Case 2.1: Update Mobile to Existing Number
```
Endpoint: PUT /api/profile/update
Headers: Authorization: Bearer {token}
Request body:
{
  "name": "John Doe",
  "contactNo": "9876543210"  // Another user's mobile
}

Expected Response: HTTP 409 Conflict
{
  "success": false,
  "message": "Mobile number already registered to another user",
  "code": "MOBILE_DUPLICATE"
}
```

#### Test Case 2.2: Update Aadhaar to Existing Number
```
Endpoint: PUT /api/profile/update
Headers: Authorization: Bearer {token}
Request body:
{
  "aadharNo": "123456789012"  // Another user's Aadhaar
}

Expected Response: HTTP 409 Conflict
{
  "success": false,
  "message": "Aadhaar number already used by another user",
  "code": "AADHAAR_DUPLICATE"
}
```

#### Test Case 2.3: Update Mobile to Own Current Number (Should Pass)
```
Endpoint: PUT /api/profile/update
Headers: Authorization: Bearer {token}
Request body:
{
  "contactNo": "9988776655"  // User's own current mobile
}

Expected Response: HTTP 200 OK
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 3. Bank Details Update Validation

#### Test Case 3.1: Update PAN to Existing Number
```
Endpoint: PUT /api/profile/bank-details
Headers: Authorization: Bearer {token}
Request body:
{
  "panNo": "ABCDE1234F",  // Another user's PAN
  "bankName": "HDFC Bank",
  ...
}

Expected Response: HTTP 409 Conflict
{
  "success": false,
  "message": "PAN card already registered to another user",
  "code": "PAN_DUPLICATE"
}
```

#### Test Case 3.2: Update PAN to New Unique Number (Should Pass)
```
Endpoint: PUT /api/profile/bank-details
Headers: Authorization: Bearer {token}
Request body:
{
  "panNo": "NEWPN1234S",  // New unique PAN
  "bankName": "HDFC Bank",
  "holderName": "John Doe",
  ...
}

Expected Response: HTTP 200 OK
{
  "success": true,
  "message": "Bank details updated successfully",
  "data": { ... }
}
```

---

## How to Run Tests

### Option 1: Using Postman
1. Import the API collection
2. For each test case, fill in the request body
3. Send the request
4. Verify the response status and message matches expected

### Option 2: Using Frontend Registration Form
1. Start the frontend: `npm start` (in p2pfrontend directory)
2. Navigate to registration page
3. Attempt to register with existing email/mobile/aadhaar/pan
4. Verify error message appears

### Option 3: Using curl
```bash
# Test duplicate email
curl -X POST http://localhost:5003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "existing@example.com",
    "contactNo": "9999999999",
    "aadharNo": "999999999999",
    "panNo": "TEST1234P",
    "password": "Test123"
  }'

# Expected: 409 Conflict with "Email already registered"
```

---

## Success Criteria

✅ Registration rejects users with duplicate email
✅ Registration rejects users with duplicate mobile
✅ Registration rejects users with duplicate Aadhaar
✅ Registration rejects users with duplicate PAN
✅ Profile updates reject duplicate mobile numbers (for other users)
✅ Profile updates reject duplicate Aadhaar (for other users)
✅ Bank details updates reject duplicate PAN (for other users)
✅ Users can update own fields to same values (no false positives)
✅ Each error includes specific message and error code
✅ HTTP 409 Conflict status code used for all duplicates
✅ Member ID auto-generates in "EL + 8 digits" format

---

## Error Response Format

All duplicate validation errors follow this format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_TYPE"
}
```

Error codes:
- `EMAIL_DUPLICATE` - Email already exists
- `MOBILE_DUPLICATE` - Mobile number already exists
- `AADHAAR_DUPLICATE` - Aadhaar number already exists
- `PAN_DUPLICATE` - PAN card already exists

---

## Backend Status

- **Server Port**: Currently running on port 5003 (auto-fallback from 5000-5002)
- **Database**: MongoDB connected
- **Authentication**: JWT enabled
- **Validation**: 4-field duplicate prevention implemented

## Frontend Status

- **API Base URL**: Updated to `http://localhost:5003/api`
- **Components**: All profile components integrated
- **Error Handling**: Ready to display validation error messages
