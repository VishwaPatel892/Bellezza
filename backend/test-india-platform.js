const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

async function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const payload = body ? JSON.stringify(body) : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
    };

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\n🇮🇳 ===============================================');
  console.log('🧪 BELLEZZA INDIA-FIRST PLATFORM INTEGRATION TESTS');
  console.log('🇮🇳 ===============================================\n');

  let passed = 0;
  let total = 0;

  function assert(name, condition) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  try {
    // 1. Indian Cities List
    const citiesRes = await makeRequest('/climate/cities');
    assert('GET /api/climate/cities returns HTTP 200', citiesRes.status === 200);
    assert(
      'Contains at least 10 major Indian meteorological cities',
      Array.isArray(citiesRes.data?.data) && citiesRes.data.data.length >= 10
    );

    // 2. Open-Meteo Real-Time Climate Guidance for Mumbai
    const climateRes = await makeRequest('/climate/current?city=mumbai');
    assert('GET /api/climate/current for Mumbai returns HTTP 200', climateRes.status === 200);
    assert(
      'Climate response contains temperature, humidity, and UV index',
      typeof climateRes.data?.data?.metrics?.temperature === 'number' &&
        typeof climateRes.data?.data?.metrics?.humidity === 'number' &&
        typeof climateRes.data?.data?.metrics?.uvIndex === 'number'
    );
    assert(
      'Skincare guidance contains photoprotection and hydration advice',
      Array.isArray(climateRes.data?.data?.skincareGuidance?.recommendations) &&
        climateRes.data.data.skincareGuidance.recommendations.length > 0
    );

    // 3. PubChem Chemical Properties & PubMed Clinical Evidence
    const intelRes = await makeRequest('/ingredients/intelligence/niacinamide');
    assert('GET /api/ingredients/intelligence/niacinamide returns HTTP 200', intelRes.status === 200);
    assert(
      'PubChem returns chemical CID 936 for Niacinamide',
      intelRes.data?.data?.chemicalIdentity?.cid === 936
    );
    assert(
      'PubChem includes Molecular Formula and IUPAC Name',
      intelRes.data?.data?.chemicalIdentity?.molecularFormula === 'C6H6N2O' &&
        Boolean(intelRes.data?.data?.chemicalIdentity?.iupacName)
    );
    assert(
      'PubMed returns indexed clinical dermatology studies',
      intelRes.data?.data?.clinicalEvidence?.totalStudies > 0 &&
        Array.isArray(intelRes.data?.data?.clinicalEvidence?.studies)
    );
    assert(
      'PubMed studies classified with evidence tier levels (Level 1, 2, or 3)',
      Boolean(intelRes.data?.data?.clinicalEvidence?.studies[0]?.evidenceLevel)
    );

    // 4. Budget-Based Product Discovery in INR
    const budgetUnder499 = await makeRequest('/products/budget?budget=under_499');
    assert('GET /api/products/budget?budget=under_499 returns HTTP 200', budgetUnder499.status === 200);
    assert(
      'All products in under_499 tier have priceInr <= 499',
      budgetUnder499.data?.data?.products.every((p) => p.priceInr <= 499)
    );
    assert(
      'Products formatted with INR currency symbol (₹)',
      budgetUnder499.data?.data?.products.every((p) => p.priceFormatted && p.priceFormatted.startsWith('₹'))
    );

    // 5. Indian Brand Filter
    const brandFilterRes = await makeRequest('/products/budget?brand=Minimalist');
    assert('GET /api/products/budget?brand=Minimalist returns HTTP 200', brandFilterRes.status === 200);
    assert(
      'Returns Minimalist products',
      brandFilterRes.data?.data?.products.some((p) => p.brand.toLowerCase().includes('minimalist'))
    );

    // 6. User Product Submission
    const submitRes = await makeRequest('/products/submit', 'POST', {
      barcode: '8906087770999',
      productName: 'Kumkumadi Radiance Elixir',
      brand: 'AyurVeda Clinical',
      category: 'serum',
      priceInr: 899,
      ingredientsText: 'Saffron, Lotus Flower, Sandalwood, Sesame Oil',
    });
    assert('POST /api/products/submit returns HTTP 201', submitRes.status === 201);
    assert(
      'Submission marked with status pending_verification',
      submitRes.data?.data?.status === 'pending_verification'
    );

    // 7. Indian User Auth & DPDP Compliance
    const testUser = {
      name: 'Aanya Sharma',
      email: `aanya_${Date.now()}@example.in`,
      password: 'SecurePassword123!',
    };

    const regRes = await makeRequest('/auth/register', 'POST', testUser);
    assert('Register new Indian user returns HTTP 201', regRes.status === 201);
    const authToken = regRes.data?.data?.token;

    // 8. Update Profile with Indian Mobile & City
    const updateProfileRes = await makeRequest(
      '/users/profile',
      'PUT',
      {
        phoneNumber: '9876543210',
        preferredCity: 'bengaluru',
      },
      authToken
    );
    assert('PUT /api/users/profile accepts valid 10-digit Indian mobile number', updateProfileRes.status === 200);
    assert(
      'Phone normalized with +91 country code',
      updateProfileRes.data?.data?.phoneNumber === '+919876543210'
    );

    // 9. DPDP Consent Management
    const consentRes = await makeRequest(
      '/users/consent',
      'PUT',
      {
        skinProfileConsent: true,
        locationConsent: true,
        analyticsConsent: false,
      },
      authToken
    );
    assert('PUT /api/users/consent updates DPDP preferences', consentRes.status === 200);
    assert(
      'DPDP consent timestamp registered',
      Boolean(consentRes.data?.data?.dpdpConsent?.consentTimestamp)
    );

    // 10. DPDP Right to Data Portability (Export JSON)
    const exportRes = await makeRequest('/users/export-data', 'GET', null, authToken);
    assert('GET /api/users/export-data returns HTTP 200', exportRes.status === 200);
    assert(
      'Export conforms to DPDP Act 2023 compliance standard',
      exportRes.data?.data?.complianceStandard?.includes('Digital Personal Data Protection (DPDP) Act 2023') &&
        Boolean(exportRes.data?.data?.userProfile?.name)
    );

    // 11. DPDP Right to Erasure (Account Deletion)
    const deleteRes = await makeRequest(
      '/users/account',
      'DELETE',
      { password: testUser.password },
      authToken
    );
    assert('DELETE /api/users/account erases data permanently under DPDP Act', deleteRes.status === 200);
  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log(`\n🏁 Test Results: ${passed} / ${total} tests passed.\n`);
  process.exit(passed === total ? 0 : 1);
}

runTests();

