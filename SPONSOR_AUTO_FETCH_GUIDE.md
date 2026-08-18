# Sponsor Auto-Fetch Feature Documentation

## Overview
When a user enters a sponsor member ID or sponsor ID during registration, the system automatically fetches and displays the sponsor's name in the "Sponsor Name" field. This eliminates the need for manual entry and ensures accurate sponsor information.

## How It Works

### Backend Implementation

**Endpoint**: `GET /api/auth/sponsor/:id`

**Controller**: `getSponsorDetails` in [authController.js](p2pbackend/controllers/authController.js)

**Functionality**:
- Accepts sponsor ID or member ID as parameter
- Searches the database for matching user by:
  1. Member ID (e.g., "EL12345678")
  2. Sponsor ID (e.g., "MM101010")
- Returns sponsor details: name, email, contact number
- Returns HTTP 404 if sponsor not found
- Returns HTTP 400 if no sponsor ID provided

**Response Format**:
```json
{
  "success": true,
  "data": {
    "memberId": "EL12345678",
    "sponsorId": "MM101010",
    "name": "John Doe",
    "email": "john@example.com",
    "contactNo": "9876543210"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Sponsor not found"
}
```

### Frontend Implementation

**Component**: [Register.jsx](p2pfrontend/src/Components/Public/Register/Register.jsx)

**Features**:

1. **Auto-Fetch Logic** (useEffect Hook)
   - Triggers whenever `sponsorId` changes
   - Includes 500ms debounce to prevent excessive API calls
   - Clears sponsor name if sponsor ID is empty
   - Handles loading and error states

2. **UI Indicators**
   - **Loading**: Shows "Loading..." text next to label while fetching
   - **Error**: Displays error message below sponsor ID input (red text)
   - **Success**: Sponsor name field becomes read-only with light gray background

3. **User Experience**
   - User types sponsor ID/member ID
   - After 500ms of inactivity, system fetches sponsor details
   - Sponsor name auto-populates in read-only field
   - User can continue with registration without manual entry
   - If sponsor not found, error message guides user to enter correct ID

### API Service

**Function**: `getSponsorDetails` in [authService.js](p2pfrontend/src/api/authService.js)

```javascript
export const getSponsorDetails = async (sponsorId) => {
  const response = await apiClient.get(`/auth/sponsor/${sponsorId}`);
  return response.data;
};
```

---

## Usage Examples

### Example 1: Valid Sponsor ID
1. User opens registration form
2. Enters sponsor ID: "MM101010"
3. After 500ms, system fetches sponsor details
4. Field updates:
   ```
   Sponsor Name: [John Doe] (read-only, gray background)
   ```
5. Registration continues with auto-filled sponsor name

### Example 2: Valid Member ID
1. User enters member ID: "EL12345678"
2. After 500ms, system fetches sponsor details
3. Field updates:
   ```
   Sponsor Name: [Jane Smith] (read-only, gray background)
   ```

### Example 3: Invalid Sponsor ID
1. User enters invalid ID: "INVALID123"
2. After 500ms, system searches database
3. Sponsor not found - error displays:
   ```
   Sponsor ID input field shows: "Sponsor not found" (red text)
   Sponsor Name field: empty and editable
   ```

### Example 4: Empty Sponsor ID
1. User clears sponsor ID field
2. Sponsor Name field automatically clears
3. Both fields ready for new entry

---

## Technical Details

### Database Query
The system uses MongoDB `$or` operator to search simultaneously by both fields:
```javascript
const sponsor = await User.findOne({
  $or: [
    { memberId: id.toUpperCase() },
    { sponsorId: id.toUpperCase() }
  ]
}).select('memberId sponsorId name email contactNo');
```

### Debouncing
500ms debounce prevents:
- Multiple API calls while user is still typing
- Server overload from repeated requests
- Unnecessary network traffic

### Error Handling
- **Network errors**: Displays user-friendly error message
- **Sponsor not found (404)**: Shows "Sponsor not found"
- **Invalid input (400)**: Handled gracefully without request

### State Management
Three states track the auto-fetch process:
1. `sponsorId` - User input
2. `sponsorLoading` - Fetch in progress
3. `sponsorError` - Error message if applicable

---

## Field Behavior

### Sponsor ID Input
- **Editable**: Always
- **Placeholder**: "Enter sponsor ID"
- **Shows error below**: If sponsor not found

### Sponsor Name Input
- **When empty**: Fully editable, placeholder "Sponsor name will auto-populate"
- **When fetched**: Read-only, light gray background (prevents accidental modification)
- **Editable**: Only if user manually clear it or sponsor fetch fails

---

## Validation

### Sponsor ID Validation
- ✅ Accepts both member IDs (EL12345678) and sponsor IDs (MM101010)
- ✅ Case-insensitive matching (converts to uppercase)
- ✅ Spaces trimmed before API call
- ❌ Rejects empty or whitespace-only IDs

### Required Fields
- Sponsor ID is marked as **required** (red asterisk)
- Sponsor Name is **optional** (can be entered manually if auto-fetch fails)

---

## API Route Details

**Route File**: [auth.js](p2pbackend/routes/auth.js)

```javascript
/**
 * GET /api/auth/sponsor/:id
 * Get sponsor details by member ID or sponsor ID
 * Public route (no authentication required)
 */
router.get('/sponsor/:id', getSponsorDetails);
```

- **Authentication**: Not required (public endpoint)
- **Parameters**: Sponsor ID or Member ID in URL path
- **Response**: Sponsor details object or error

---

## Benefits

1. **Accuracy**: Eliminates typos in sponsor names
2. **Convenience**: No need to manually look up sponsor information
3. **Real-time**: Instant feedback if sponsor ID is invalid
4. **User-Friendly**: Clear loading and error states
5. **Performance**: Debounced to minimize server load

---

## Testing Checklist

- [ ] Enter valid sponsor member ID (EL12345678) → Name auto-populates
- [ ] Enter valid sponsor ID (MM101010) → Name auto-populates
- [ ] Enter invalid sponsor ID → Error message displays
- [ ] Clear sponsor ID field → Sponsor name clears automatically
- [ ] Try to edit auto-populated sponsor name → Field is read-only
- [ ] Type slowly in sponsor ID → Only one API call after typing stops
- [ ] Submit registration with auto-fetched sponsor name → Works correctly
- [ ] Network error during fetch → Error message displays gracefully

---

## Troubleshooting

**Issue**: Sponsor name not auto-populating
- **Solution**: Check that sponsor ID exists in database with correct member ID or sponsor ID

**Issue**: "Sponsor not found" error
- **Solution**: Verify the entered sponsor ID matches an existing user's memberId or sponsorId

**Issue**: Too many API calls to server
- **Solution**: Debounce is set to 500ms - if still happening, increase timeout value in useEffect

**Issue**: Sponsor name field editable after auto-fetch
- **Solution**: This should not happen - check browser console for errors, reload page and try again
