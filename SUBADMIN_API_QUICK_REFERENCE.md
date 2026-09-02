# Sub-Admin API - Quick Reference

## All Endpoints

| Method | Endpoint             | Description          | Auth Required                             |
| ------ | -------------------- | -------------------- | ----------------------------------------- |
| POST   | `/api/subadmins`     | Create new sub-admin | SUPER_ADMIN + manage_subadmins permission |
| GET    | `/api/subadmins`     | List all sub-admins  | SUPER_ADMIN + manage_subadmins permission |
| GET    | `/api/subadmins/:id` | Get single sub-admin | SUPER_ADMIN + manage_subadmins permission |
| PUT    | `/api/subadmins/:id` | Update sub-admin     | SUPER_ADMIN + manage_subadmins permission |
| DELETE | `/api/subadmins/:id` | Delete sub-admin     | SUPER_ADMIN + manage_subadmins permission |

## Valid Permissions

```
manage_users
manage_deposits
manage_withdrawals
manage_products
manage_orders
manage_coupons
manage_epins
manage_support
manage_transactions
manage_news
manage_settings
manage_subadmins
```

## Common Requests

### Create

```bash
curl -X POST http://localhost:5000/api/subadmins \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "contactNo": "9999999999",
    "password": "Secure@123",
    "transactionPassword": "Trans@123",
    "permissions": ["manage_users", "manage_deposits"]
  }'
```

### List All

```bash
curl http://localhost:5000/api/subadmins \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single

```bash
curl http://localhost:5000/api/subadmins/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update

```bash
curl -X PUT http://localhost:5000/api/subadmins/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "permissions": ["manage_users", "manage_deposits", "manage_products"]
  }'
```

### Delete

```bash
curl -X DELETE http://localhost:5000/api/subadmins/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 201  | Created successfully                 |
| 200  | Success                              |
| 400  | Bad request (validation error)       |
| 401  | Unauthorized (no valid token)        |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not found                            |
| 500  | Server error                         |

## Error Messages Cheat Sheet

| Error                                                    | Solution                                 |
| -------------------------------------------------------- | ---------------------------------------- |
| "Name, email, contact number, and password are required" | Provide all required fields              |
| "Invalid permissions provided"                           | Check VALID_PERMISSIONS list             |
| "User with this email or contact number already exists"  | Use unique email/contact                 |
| "Email already in use"                                   | Email exists for different user          |
| "Contact number already in use"                          | Contact number exists for different user |
| "Sub-admin not found"                                    | ID doesn't exist or is not a sub-admin   |
| "Not authorized to access this resource"                 | User lacks manage_subadmins permission   |

## Test the API

```bash
cd elcon-backend
node tests/subadmin.test.js
```

## Key Features

✅ Full CRUD operations
✅ Permission validation
✅ Unique constraint handling
✅ Proper error messages
✅ Consistent response format
✅ Security checks
✅ Input validation
✅ MongoDB duplicate key handling

## Response Format

All responses follow this structure:

**Success:**

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {
    /* actual data */
  }
}
```

**Error:**

```json
{
  "message": "Error description",
  "invalidPermissions": [] // if applicable
}
```

## Notes

- Passwords are never returned in responses
- Only SUPER_ADMIN with manage_subadmins permission can perform these operations
- All endpoints require Bearer token authentication
- Email and contactNo must be unique in the system
- Permissions must be from the valid list
