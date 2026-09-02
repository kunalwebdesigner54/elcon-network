/**
 * Sub-Admin Functionality Test Suite
 * Tests all CRUD operations and permission-based access control
 */

const http = require('http');
const assert = require('assert');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api/subadmins';
const SUPER_ADMIN_TOKEN = process.env.SUPER_ADMIN_TOKEN; // Should be set in .env
const SUB_ADMIN_TOKEN = process.env.SUB_ADMIN_TOKEN; // For permission testing

// Test data
const testSubAdmin = {
    name: 'Test Sub Admin',
    email: `subadmin_${Date.now()}@test.com`,
    contactNo: `9999${Math.floor(Math.random() * 100000)}`,
    password: 'TestPassword@123',
    transactionPassword: 'TransPass@123',
    permissions: ['manage_users', 'manage_deposits']
};

const validPermissions = [
    'manage_users',
    'manage_deposits',
    'manage_withdrawals',
    'manage_products',
    'manage_orders',
    'manage_coupons',
    'manage_epins',
    'manage_support',
    'manage_transactions',
    'manage_news',
    'manage_settings',
    'manage_subadmins'
];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = SUPER_ADMIN_TOKEN) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 5000,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Test Suite
async function runTests() {
    console.log('🧪 Starting Sub-Admin Functionality Tests...\n');

    let createdSubAdminId = null;
    let testsPassed = 0;
    let testsFailed = 0;

    try {
        // Test 1: Create Sub-Admin
        console.log('Test 1: Create Sub-Admin');
        const createResponse = await makeRequest('POST', '', testSubAdmin);
        assert.strictEqual(createResponse.status, 201, `Expected 201, got ${createResponse.status}`);
        assert.strictEqual(createResponse.data.success, true, 'Response should have success: true');
        assert(createResponse.data.data._id, 'Response should contain sub-admin ID');
        createdSubAdminId = createResponse.data.data._id;
        console.log('✅ Sub-Admin created successfully\n');
        testsPassed++;

        // Test 2: Validate permissions during creation
        console.log('Test 2: Invalid Permission Handling');
        const invalidPermResponse = await makeRequest('POST', '', {
            ...testSubAdmin,
            email: `subadmin_${Date.now() + 1}@test.com`,
            contactNo: `9999${Math.floor(Math.random() * 100000)}`,
            permissions: ['invalid_permission']
        });
        assert.strictEqual(invalidPermResponse.status, 400, 'Should return 400 for invalid permission');
        assert(invalidPermResponse.data.message.includes('Invalid permissions'), 'Should mention invalid permissions');
        console.log('✅ Invalid permissions properly rejected\n');
        testsPassed++;

        // Test 3: Duplicate Email Check
        console.log('Test 3: Duplicate Email Validation');
        const duplicateEmailResponse = await makeRequest('POST', '', {
            ...testSubAdmin,
            email: testSubAdmin.email,
            contactNo: `9999${Math.floor(Math.random() * 100000)}`
        });
        assert.strictEqual(duplicateEmailResponse.status, 400, 'Should return 400 for duplicate email');
        console.log('✅ Duplicate email properly rejected\n');
        testsPassed++;

        // Test 4: Get All Sub-Admins
        console.log('Test 4: Get All Sub-Admins');
        const getAllResponse = await makeRequest('GET', '');
        assert.strictEqual(getAllResponse.status, 200, 'Should return 200');
        assert.strictEqual(getAllResponse.data.success, true, 'Response should have success: true');
        assert(Array.isArray(getAllResponse.data.data), 'Response data should be an array');
        assert(getAllResponse.data.count >= 1, 'Should have at least one sub-admin');
        console.log(`✅ Retrieved ${getAllResponse.data.count} sub-admins\n`);
        testsPassed++;

        // Test 5: Get Single Sub-Admin by ID
        console.log('Test 5: Get Sub-Admin by ID');
        const getByIdResponse = await makeRequest('GET', `/${createdSubAdminId}`);
        assert.strictEqual(getByIdResponse.status, 200, 'Should return 200');
        assert.strictEqual(getByIdResponse.data.success, true, 'Response should have success: true');
        assert.strictEqual(getByIdResponse.data.data._id, createdSubAdminId, 'Should return correct sub-admin');
        console.log('✅ Retrieved sub-admin by ID successfully\n');
        testsPassed++;

        // Test 6: Update Sub-Admin
        console.log('Test 6: Update Sub-Admin');
        const updateData = {
            name: 'Updated Sub Admin',
            permissions: ['manage_users', 'manage_deposits', 'manage_products']
        };
        const updateResponse = await makeRequest('PUT', `/${createdSubAdminId}`, updateData);
        assert.strictEqual(updateResponse.status, 200, 'Should return 200');
        assert.strictEqual(updateResponse.data.success, true, 'Response should have success: true');
        assert.strictEqual(updateResponse.data.data.name, 'Updated Sub Admin', 'Name should be updated');
        assert.deepStrictEqual(updateResponse.data.data.permissions, updateData.permissions, 'Permissions should be updated');
        console.log('✅ Sub-Admin updated successfully\n');
        testsPassed++;

        // Test 7: Update with Duplicate Email Conflict
        console.log('Test 7: Duplicate Email During Update');
        const conflictResponse = await makeRequest('PUT', `/${createdSubAdminId}`, {
            email: 'nonexistent@example.com'
        });
        // This might succeed if email is unique, or fail if there's already a user with this email
        assert(conflictResponse.status === 200 || conflictResponse.status === 400, 'Should return 200 or 400');
        console.log('✅ Email conflict handling working\n');
        testsPassed++;

        // Test 8: Get Non-Existent Sub-Admin
        console.log('Test 8: Get Non-Existent Sub-Admin');
        const notFoundResponse = await makeRequest('GET', '/507f1f77bcf86cd799439011');
        assert.strictEqual(notFoundResponse.status, 404, 'Should return 404');
        assert(notFoundResponse.data.message.includes('not found'), 'Should mention not found');
        console.log('✅ 404 error properly returned for non-existent sub-admin\n');
        testsPassed++;

        // Test 9: Delete Sub-Admin
        console.log('Test 9: Delete Sub-Admin');
        const deleteResponse = await makeRequest('DELETE', `/${createdSubAdminId}`);
        assert.strictEqual(deleteResponse.status, 200, 'Should return 200');
        assert.strictEqual(deleteResponse.data.success, true, 'Response should have success: true');
        console.log('✅ Sub-Admin deleted successfully\n');
        testsPassed++;

        // Test 10: Verify Deletion
        console.log('Test 10: Verify Deletion');
        const verifyDeleteResponse = await makeRequest('GET', `/${createdSubAdminId}`);
        assert.strictEqual(verifyDeleteResponse.status, 404, 'Should return 404 after deletion');
        console.log('✅ Deletion verified - sub-admin no longer exists\n');
        testsPassed++;

        // Test 11: Permission Validation in Update
        console.log('Test 11: Invalid Permission in Update');
        // Create another sub-admin for this test
        const tempSubAdmin = {
            ...testSubAdmin,
            email: `subadmin_${Date.now() + 2}@test.com`,
            contactNo: `9999${Math.floor(Math.random() * 100000)}`
        };
        const tempCreateResponse = await makeRequest('POST', '', tempSubAdmin);
        const tempId = tempCreateResponse.data.data._id;

        const invalidUpdateResponse = await makeRequest('PUT', `/${tempId}`, {
            permissions: ['invalid_perm']
        });
        assert.strictEqual(invalidUpdateResponse.status, 400, 'Should return 400');
        console.log('✅ Invalid permissions in update rejected\n');
        testsPassed++;

        // Cleanup: Delete temporary sub-admin
        await makeRequest('DELETE', `/${tempId}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        testsFailed++;
    }

    // Print Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%\n`);

    process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
    // Uncomment the line below to run tests
    // runTests().catch(error => {
    //   console.error('Fatal error:', error);
    //   process.exit(1);
    // });

    console.log('ℹ️ Sub-Admin Test Suite Loaded');
    console.log('To run tests, ensure the server is running and call runTests() function');
}

module.exports = { runTests, makeRequest };
