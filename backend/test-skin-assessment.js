const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_HOST = '127.0.0.1';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      const data = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(data));
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   BELLEZZA — SKIN ASSESSMENT & PROFILE TEST SUITE     ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      if (details) console.error(`    ↳ ${details}`);
      failed++;
    }
  }

  const testUser = {
    name: 'Ananya Sharma',
    email: `ananya_${Date.now()}@bellezza.test`,
    password: 'Password123!',
  };

  let token = null;

  try {
    // Test 1: Unauthenticated skin-profile request
    const unauthRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/users/skin-profile',
      method: 'GET',
    });
    assert(
      unauthRes.status === 401,
      'GET /api/users/skin-profile requires authentication (401)',
      `Got status ${unauthRes.status}`
    );

    // Test 2: Register user to get JWT
    const regRes = await request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
      },
      testUser
    );
    assert(
      regRes.status === 201 && regRes.body?.data?.token,
      'User registration succeeds and returns JWT',
      `Got status ${regRes.status}: ${JSON.stringify(regRes.body)}`
    );
    token = regRes.body?.data?.token;

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // Test 3: GET initial skin profile
    const initialRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/users/skin-profile',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      initialRes.status === 200 && initialRes.body?.data?.disclaimer,
      'GET /api/users/skin-profile returns profile and non-diagnostic disclaimer',
      `Got: ${JSON.stringify(initialRes.body)}`
    );
    assert(
      initialRes.body?.data?.skinProfile?.assessmentCompleted === false,
      'Initial profile has assessmentCompleted: false'
    );

    // Test 4: Complete 7-step skin assessment PUT
    const fullAssessmentPayload = {
      skinType: 'Combination',
      skinConcerns: ['Acne and breakouts', 'Dark spots', 'Hyperpigmentation'],
      sensitivityLevel: 'Moderate',
      experiencesIrritation: 'Sometimes',
      knownIngredientAllergies: ['Essential oils', 'Salicylic acid'],
      irritationTriggers: ['Alcohol denat', 'Synthetic fragrance'],
      fragranceSensitivity: true,
      productReactions: ['Stinging from pure tea tree oil'],
      skincareGoals: ['Clearer-looking skin', 'More even-looking skin tone', 'Improve skin barrier care'],
      currentRoutine: ['Cleanser', 'Moisturizer', 'Sunscreen'],
      currentProducts: ['Minimalist Gentle Cleanser', 'Dot & Key Barrier Repair Cream'],
      monthlyBudgetINR: 2500,
      productPreferences: ['Science-backed actives', 'Dermatologically tested'],
      fragranceFreePreference: true,
      routinePreference: 'Simple',
      indiaFirstPreference: true,
      assessmentCompleted: true,
      disclaimerAcknowledged: true,
    };

    const putRes = await request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/users/skin-profile',
        method: 'PUT',
        headers: authHeaders,
      },
      fullAssessmentPayload
    );

    assert(
      putRes.status === 200,
      'PUT /api/users/skin-profile saves complete 7-step assessment (200)',
      `Got status ${putRes.status}: ${JSON.stringify(putRes.body)}`
    );

    const updatedProfile = putRes.body?.data?.skinProfile;
    assert(
      updatedProfile?.skinType === 'Combination',
      'Skin type correctly saved as "Combination"'
    );
    assert(
      Array.isArray(updatedProfile?.skinConcerns) && updatedProfile.skinConcerns.length === 3,
      'Skin concerns correctly stored (3 items)'
    );
    assert(
      updatedProfile?.sensitivityLevel === 'Moderate' && updatedProfile?.experiencesIrritation === 'Sometimes',
      'Sensitivity level and irritation frequency stored correctly'
    );
    assert(
      updatedProfile?.fragranceSensitivity === true && updatedProfile?.fragranceFreePreference === true,
      'Fragrance preferences stored correctly'
    );
    assert(
      updatedProfile?.monthlyBudgetINR === 2500,
      'Monthly budget in INR stored correctly (₹2,500)'
    );
    assert(
      updatedProfile?.assessmentCompleted === true,
      'assessmentCompleted flag is true'
    );
    assert(
      Boolean(updatedProfile?.lastAssessedAt),
      'lastAssessedAt timestamp is populated'
    );

    // Test 5: GET /api/users/skin-profile verifies persistence
    const verifyGetRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/users/skin-profile',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      verifyGetRes.status === 200 &&
        verifyGetRes.body?.data?.skinProfile?.monthlyBudgetINR === 2500 &&
        verifyGetRes.body?.data?.skinProfile?.routinePreference === 'Simple',
      'GET /api/users/skin-profile accurately reflects persisted multi-step profile'
    );

    // Test 6: Partial update preserves existing fields
    const partialUpdatePayload = {
      monthlyBudgetINR: 3500,
      routinePreference: 'Advanced',
    };
    const partialRes = await request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/users/skin-profile',
        method: 'PUT',
        headers: authHeaders,
      },
      partialUpdatePayload
    );
    const partialData = partialRes.body?.data?.skinProfile;
    assert(
      partialData?.monthlyBudgetINR === 3500 &&
        partialData?.routinePreference === 'Advanced' &&
        partialData?.skinType === 'Combination' &&
        partialData?.skinConcerns?.length === 3,
      'Partial skin profile update preserves existing fields without wiping data'
    );

    // Test 7: Validation rejection on invalid skinType
    const invalidTypeRes = await request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/users/skin-profile',
        method: 'PUT',
        headers: authHeaders,
      },
      { skinType: 'SuperOily' }
    );
    assert(
      invalidTypeRes.status === 400 && invalidTypeRes.body?.errors?.skinType,
      'Rejects invalid skin type with 400 validation error',
      `Got status ${invalidTypeRes.status}: ${JSON.stringify(invalidTypeRes.body)}`
    );

    // Test 8: Validation rejection on invalid sensitivityLevel
    const invalidSensRes = await request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/users/skin-profile',
        method: 'PUT',
        headers: authHeaders,
      },
      { sensitivityLevel: 'UltraExtreme' }
    );
    assert(
      invalidSensRes.status === 400 && invalidSensRes.body?.errors?.sensitivityLevel,
      'Rejects invalid sensitivity level with 400 validation error'
    );

    // Test 9: Validation rejection on negative budget
    const invalidBudgetRes = await request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/users/skin-profile',
        method: 'PUT',
        headers: authHeaders,
      },
      { monthlyBudgetINR: -100 }
    );
    assert(
      invalidBudgetRes.status === 400 && invalidBudgetRes.body?.errors?.monthlyBudgetINR,
      'Rejects negative monthly budget in INR with 400 validation error'
    );

    // Test 10: Validation rejection on non-array skinConcerns
    const invalidArrayRes = await request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/users/skin-profile',
        method: 'PUT',
        headers: authHeaders,
      },
      { skinConcerns: 'JustAcne' }
    );
    assert(
      invalidArrayRes.status === 400 && invalidArrayRes.body?.errors?.skinConcerns,
      'Rejects non-array skin concerns with 400 validation error'
    );

    // Test 11: GET /api/users/profile returns virtuals and full user data
    const userProfileRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/users/profile',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      userProfileRes.status === 200 &&
        userProfileRes.body?.data?.skinType === 'Combination' &&
        userProfileRes.body?.data?.skinProfile?.assessmentCompleted === true,
      'GET /api/users/profile returns updated skin virtuals and nested profile'
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n------------------------------------------------------');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
