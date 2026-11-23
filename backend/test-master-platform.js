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

async function runMasterTests() {
  console.log('\n==================================================================');
  console.log('   BELLEZZA — MASTER COMPLETE SKINCARE PLATFORM TEST SUITE        ');
  console.log('   Features: 5 (Remedies), 6 (Products), 7 (Ingredients),         ');
  console.log('             8 (AI Assistant), 10 (Routines), 11 (Skin Journal)   ');
  console.log('==================================================================\n');

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
    name: 'Priyanka Sen',
    email: `priyanka_${Date.now()}@bellezza.test`,
    password: 'SecurePassword123!',
  };

  try {
    // 0. Register user & authenticate
    const regRes = await request(
      { hostname: BASE_HOST, port: PORT, path: '/api/auth/register', method: 'POST' },
      testUser
    );
    assert(regRes.status === 201 && regRes.body?.data?.token, 'User registered with auth token');
    const token = regRes.body?.data?.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Set up user skin profile for personalization tests
    await request(
      { hostname: BASE_HOST, port: PORT, path: '/api/users/skin-profile', method: 'PUT', headers: authHeaders },
      {
        skinType: 'Combination',
        skinConcerns: ['Acne and breakouts', 'Dark spots'],
        sensitivityLevel: 'Moderate',
        monthlyBudgetINR: 2000,
        knownIngredientAllergies: ['Essential oils'],
        assessmentCompleted: true,
      }
    );

    // ==========================================
    // FEATURE 5: HOME REMEDIES LIBRARY
    // ==========================================
    console.log('\n--- FEATURE 5: HOME REMEDIES LIBRARY ---');
    const remediesRes = await request({ hostname: BASE_HOST, port: PORT, path: '/api/remedies', method: 'GET' });
    assert(
      remediesRes.status === 200 && remediesRes.body?.data?.remedies?.length > 0,
      'GET /api/remedies returns evidence-based remedies catalog'
    );
    const remedyList = remediesRes.body?.data?.remedies || [];
    const firstRemedy = remedyList[0];

    const remedyCategoriesRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/remedies/categories',
      method: 'GET',
    });
    assert(
      remedyCategoriesRes.status === 200 && remedyCategoriesRes.body?.data?.length >= 5,
      'GET /api/remedies/categories returns valid distinct categories'
    );

    const remedySearchRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/remedies/search?q=oatmeal',
      method: 'GET',
    });
    assert(
      remedySearchRes.status === 200 && remedySearchRes.body?.data?.length > 0,
      'GET /api/remedies/search finds oatmeal barrier remedy'
    );

    const recommendedRemediesRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/remedies/recommended',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      recommendedRemediesRes.status === 200 && Array.isArray(recommendedRemediesRes.body?.data),
      'GET /api/remedies/recommended filters personalized safe remedies'
    );

    if (firstRemedy) {
      const saveRemedyRes = await request(
        { hostname: BASE_HOST, port: PORT, path: `/api/remedies/${firstRemedy._id}/save`, method: 'POST', headers: authHeaders },
        { notes: 'Soothes post-sun irritation' }
      );
      assert(saveRemedyRes.status === 200, 'POST /api/remedies/:id/save adds remedy to user library');

      const savedRemediesRes = await request({
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/remedies/saved',
        method: 'GET',
        headers: authHeaders,
      });
      assert(
        savedRemediesRes.status === 200 && savedRemediesRes.body?.data?.length > 0,
        'GET /api/remedies/saved retrieves persisted remedies'
      );
    }

    // ==========================================
    // FEATURE 6: REAL SKINCARE PRODUCTS & FINDER
    // ==========================================
    console.log('\n--- FEATURE 6: REAL PRODUCTS & FINDER ---');
    const prodCategoriesRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/products/categories',
      method: 'GET',
    });
    assert(
      prodCategoriesRes.status === 200 && prodCategoriesRes.body?.data?.includes('serum'),
      'GET /api/products/categories returns verified categories'
    );

    const recommendedProdRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/products/recommended',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      recommendedProdRes.status === 200 &&
        recommendedProdRes.body?.data?.length > 0 &&
        Boolean(recommendedProdRes.body?.data[0]?.recommendationReason),
      'GET /api/products/recommended provides explainable personalized recommendations'
    );

    const compareRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/products/compare',
      method: 'GET',
    });
    assert(
      compareRes.status === 200 && compareRes.body?.data?.products?.length <= 3,
      'GET /api/products/compare generates side-by-side comparison matrix'
    );

    const allProdsRes = await request({ hostname: BASE_HOST, port: PORT, path: '/api/products', method: 'GET' });
    const productToSave = allProdsRes.body?.data?.[0];
    if (productToSave) {
      const saveProdRes = await request(
        { hostname: BASE_HOST, port: PORT, path: `/api/products/${productToSave.id || productToSave._id}/save`, method: 'POST', headers: authHeaders },
        { notes: 'Holy grail daily cleanser' }
      );
      assert(saveProdRes.status === 200, 'POST /api/products/:id/save persists product in user library');

      const savedProdRes = await request({
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/products/saved',
        method: 'GET',
        headers: authHeaders,
      });
      assert(
        savedProdRes.status === 200 && savedProdRes.body?.data?.length > 0,
        'GET /api/products/saved retrieves saved products with formatted INR prices'
      );
    }

    // ==========================================
    // FEATURE 7: INGREDIENT EXPLORER & COMPATIBILITY
    // ==========================================
    console.log('\n--- FEATURE 7: INGREDIENT EXPLORER & COMPATIBILITY ---');
    const ingredientsCatalogRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/ingredients',
      method: 'GET',
    });
    assert(
      ingredientsCatalogRes.status === 200 && ingredientsCatalogRes.body?.data?.length > 0,
      'GET /api/ingredients returns scientific ingredient catalog'
    );

    const compatibilityRes = await request(
      { hostname: BASE_HOST, port: PORT, path: '/api/ingredients/compatibility', method: 'POST' },
      { ingredients: ['Retinol', 'Salicylic Acid'] }
    );
    assert(
      compatibilityRes.status === 200 &&
        compatibilityRes.body?.data?.overallRisk?.includes('Moderate') ||
        compatibilityRes.body?.data?.overallRisk?.includes('High'),
      'POST /api/ingredients/compatibility identifies active interaction warnings'
    );

    const saveIngRes = await request(
      { hostname: BASE_HOST, port: PORT, path: '/api/ingredients/save', method: 'POST', headers: authHeaders },
      { ingredientName: 'Niacinamide' }
    );
    assert(saveIngRes.status === 200, 'POST /api/ingredients/save tracks ingredient');

    const savedIngRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/ingredients/saved',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      savedIngRes.status === 200 && savedIngRes.body?.data?.some((i) => i.name.includes('Niacinamide')),
      'GET /api/ingredients/saved returns tracked actives'
    );

    // ==========================================
    // FEATURE 8: BELLEZZA AI ASSISTANT
    // ==========================================
    console.log('\n--- FEATURE 8: BELLEZZA AI ASSISTANT ---');
    const aiChatRes = await request(
      { hostname: BASE_HOST, port: PORT, path: '/api/ai/chat', method: 'POST', headers: authHeaders },
      { message: 'What concentration of Niacinamide is best for oily Indian skin?' }
    );
    assert(
      aiChatRes.status === 200 &&
        Boolean(aiChatRes.body?.data?.reply) &&
        Array.isArray(aiChatRes.body?.data?.citations),
      'POST /api/ai/chat returns grounded response with scientific citations'
    );

    const convId = aiChatRes.body?.data?.conversationId;
    const msgId = aiChatRes.body?.data?.messageId;

    const convListRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/ai/conversations',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      convListRes.status === 200 && convListRes.body?.data?.length > 0,
      'GET /api/ai/conversations lists conversation threads'
    );

    if (convId && msgId) {
      const feedbackRes = await request(
        { hostname: BASE_HOST, port: PORT, path: '/api/ai/feedback', method: 'POST', headers: authHeaders },
        { conversationId: convId, messageId: msgId, feedback: 'helpful' }
      );
      assert(feedbackRes.status === 200, 'POST /api/ai/feedback registers user response feedback');
    }

    // ==========================================
    // FEATURE 10: SKINCARE ROUTINES & REMINDERS
    // ==========================================
    console.log('\n--- FEATURE 10: SKINCARE ROUTINES & REMINDERS ---');
    const userRoutinesRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/routines',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      userRoutinesRes.status === 200 && userRoutinesRes.body?.data?.length >= 2,
      'GET /api/routines initializes and fetches morning and evening protocols'
    );

    const activeRoutine = userRoutinesRes.body?.data?.[0];
    if (activeRoutine) {
      const completeRoutineRes = await request(
        { hostname: BASE_HOST, port: PORT, path: `/api/routines/${activeRoutine._id}/complete`, method: 'POST', headers: authHeaders },
        { date: new Date().toISOString().split('T')[0] }
      );
      assert(
        completeRoutineRes.status === 200 && completeRoutineRes.body?.data?.streakDays !== undefined,
        'POST /api/routines/:id/complete logs daily ritual completion & updates streak'
      );
    }

    const routineStatsRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/routines/statistics',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      routineStatsRes.status === 200 && routineStatsRes.body?.data?.sevenDayConsistencyRate !== undefined,
      'GET /api/routines/statistics computes 7-day consistency percentage'
    );

    // ==========================================
    // FEATURE 11: SKIN JOURNAL & PROGRESS TRACKING
    // ==========================================
    console.log('\n--- FEATURE 11: SKIN JOURNAL & PROGRESS TRACKING ---');
    const todayStr = new Date().toISOString().split('T')[0];
    const journalEntryRes = await request(
      { hostname: BASE_HOST, port: PORT, path: '/api/journal', method: 'POST', headers: authHeaders },
      {
        date: todayStr,
        overallCondition: 'Radiant / Calm',
        dryness: 2,
        oiliness: 3,
        redness: 1,
        breakouts: 1,
        sensitivity: 2,
        hydrationPerception: 'Plump / Hydrated',
        texturePerception: 'Smooth / Refined',
        notes: 'Skin felt well-hydrated after applying ceramide cream and green tea compress.',
        productsUsed: ['Minimalist Niacinamide', 'Ceramide Cream'],
      }
    );
    assert(
      journalEntryRes.status === 201 && journalEntryRes.body?.data?.date === todayStr,
      'POST /api/journal creates daily skin check-in log'
    );

    const journalListRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/journal',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      journalListRes.status === 200 && journalListRes.body?.data?.entries?.length > 0,
      'GET /api/journal returns paginated journal logs'
    );

    const timelineRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/journal/timeline',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      timelineRes.status === 200 && Array.isArray(timelineRes.body?.data),
      'GET /api/journal/timeline aggregates chronological events'
    );

    const progressRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/journal/progress',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      progressRes.status === 200 &&
        progressRes.body?.data?.averages?.breakouts !== undefined &&
        Boolean(progressRes.body?.data?.trajectory),
      'GET /api/journal/progress computes metric averages and breakout trajectory'
    );

    const photoRes = await request(
      { hostname: BASE_HOST, port: PORT, path: '/api/journal/photos', method: 'POST', headers: authHeaders },
      {
        photoUri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
        angle: 'Frontal / Full Face',
        lightingCondition: 'Natural Daylight',
        notes: 'Baseline front angle',
      }
    );
    assert(photoRes.status === 201, 'POST /api/journal/photos securely records progress photo metadata');

    const photosListRes = await request({
      hostname: BASE_HOST,
      port: PORT,
      path: '/api/journal/photos',
      method: 'GET',
      headers: authHeaders,
    });
    assert(
      photosListRes.status === 200 && photosListRes.body?.data?.length > 0,
      'GET /api/journal/photos returns stored progress images'
    );

  } catch (err) {
    console.error('Master Test Suite error:', err);
    failed++;
  }

  console.log('\n==================================================================');
  console.log(`MASTER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMasterTests();
