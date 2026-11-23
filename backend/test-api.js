const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const opts = { ...options };
    let payload = null;
    if (postData) {
      payload = typeof postData === 'string' ? postData : JSON.stringify(postData);
      opts.headers = {
        ...opts.headers,
        'Content-Length': Buffer.byteLength(payload),
      };
    }
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          });
        } catch {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting Bellezza Backend API Verification...\n');
  let token = '';
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123';
  let passed = 0;
  let failed = 0;

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} -> ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert('Health Check (GET /api/health)', health.statusCode === 200 && health.body.success === true);

    // 2. Missing fields registration
    const missingFields = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'A' }
    );
    assert(
      'Registration Missing Fields (400)',
      missingFields.statusCode === 400 && missingFields.body.errors?.email,
      JSON.stringify(missingFields.body)
    );

    // 3. Invalid email registration
    const invalidEmail = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Test User', email: 'notanemail', password: testPassword }
    );
    assert(
      'Registration Invalid Email (400)',
      invalidEmail.statusCode === 400 && invalidEmail.body.errors?.email,
      JSON.stringify(invalidEmail.body)
    );

    // 4. Weak password registration
    const weakPass = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Test User', email: testEmail, password: '123' }
    );
    assert(
      'Registration Weak Password (400)',
      weakPass.statusCode === 400 && weakPass.body.errors?.password,
      JSON.stringify(weakPass.body)
    );

    // 5. Successful registration (201)
    const registerSuccess = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Clinical Test User', email: testEmail, password: testPassword }
    );
    assert(
      'Successful Registration (201)',
      registerSuccess.statusCode === 201 && registerSuccess.body.data?.token,
      JSON.stringify(registerSuccess.body)
    );
    token = registerSuccess.body?.data?.token;

    // 6. Duplicate email registration (409)
    const duplicateRegister = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Clinical Test User 2', email: testEmail, password: testPassword }
    );
    assert(
      'Duplicate Email Registration (409)',
      duplicateRegister.statusCode === 409,
      JSON.stringify(duplicateRegister.body)
    );

    // 7. Successful login (200)
    const loginSuccess = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: testPassword }
    );
    assert(
      'Successful Login (200)',
      loginSuccess.statusCode === 200 && loginSuccess.body.data?.token,
      JSON.stringify(loginSuccess.body)
    );

    // 8. Incorrect password login (401)
    const wrongPass = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: 'WrongPassword' }
    );
    assert('Incorrect Password Login (401)', wrongPass.statusCode === 401, JSON.stringify(wrongPass.body));

    // 9. Unknown email login (401)
    const unknownEmail = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'nonexistent_user_999@example.com', password: testPassword }
    );
    assert('Unknown Email Login (401)', unknownEmail.statusCode === 401, JSON.stringify(unknownEmail.body));

    // 10. Missing JWT on protected route (401)
    const missingJwt = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
    });
    assert('Missing JWT (401)', missingJwt.statusCode === 401, JSON.stringify(missingJwt.body));

    // 11. Invalid JWT (401)
    const invalidJwt = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: 'Bearer thisisnotavalidtoken12345' },
    });
    assert('Invalid JWT (401)', invalidJwt.statusCode === 401, JSON.stringify(invalidJwt.body));

    // 12. Authenticated GET /api/auth/me (200)
    const getMe = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(
      'Fetch Authenticated Profile (GET /api/auth/me)',
      getMe.statusCode === 200 && getMe.body.data?.email === testEmail.toLowerCase(),
      JSON.stringify(getMe.body)
    );

    // 13. Authenticated GET /api/users/profile (200)
    const getProfile = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(
      'Fetch User Profile (GET /api/users/profile)',
      getProfile.statusCode === 200 && getProfile.body.data?.name === 'Clinical Test User',
      JSON.stringify(getProfile.body)
    );

    // 14. Update basic profile (PUT /api/users/profile)
    const updateProfile = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { name: 'Dr. Bella Dermatologist', profileImage: 'https://example.com/avatar.jpg' }
    );
    assert(
      'Update User Profile (PUT /api/users/profile)',
      updateProfile.statusCode === 200 && updateProfile.body.data?.name === 'Dr. Bella Dermatologist',
      JSON.stringify(updateProfile.body)
    );

    // 15. Update clinical skin profile (PUT /api/users/skin-profile)
    const updateSkin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/skin-profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        skinType: 'combination', // will normalize to 'Combination'
        skinConcerns: ['pores', 'hydration'],
        sensitivityLevel: 'medium', // will normalize to 'Medium'
        knownIngredientAllergies: ['Fragrance'],
        skincareGoals: ['Barrier Repair', 'Even Tone'],
      }
    );
    assert(
      'Update Skin Profile (PUT /api/users/skin-profile)',
      updateSkin.statusCode === 200 &&
        updateSkin.body.data?.skinProfile?.skinType === 'Combination' &&
        updateSkin.body.data?.skinProfile?.sensitivityLevel === 'Medium',
      JSON.stringify(updateSkin.body)
    );

    // 16. Unauthorized account deletion (wrong password) (401)
    const badDelete = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/account',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { password: 'IncorrectPassword' }
    );
    assert(
      'Unauthorized Account Deletion Wrong Password (401)',
      badDelete.statusCode === 401,
      JSON.stringify(badDelete.body)
    );

    // 17. Successful account deletion (200)
    const goodDelete = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/account',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { password: testPassword }
    );
    assert(
      'Successful Account Deletion (DELETE /api/users/account)',
      goodDelete.statusCode === 200 && goodDelete.body.success === true,
      JSON.stringify(goodDelete.body)
    );

    // 18. Verified user is deleted (subsequent me call fails)
    const afterDelete = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert('Deleted User Token Invalidation (401)', afterDelete.statusCode === 401);

    // 19. Logout endpoint
    const logoutRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/logout',
      method: 'POST',
    });
    assert('Logout Endpoint (POST /api/auth/logout)', logoutRes.statusCode === 200);

    console.log(`\n========================================`);
    console.log(`🏁 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Fatal test error:', err);
  }
};

runTests();
