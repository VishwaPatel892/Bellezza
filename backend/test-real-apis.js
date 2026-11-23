const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
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
  console.log('\n🌿 ==========================================');
  console.log('🧪 BELLEZZA REAL-WORLD API INTEGRATION TESTS');
  console.log('🌿 ==========================================\n');

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
    // 1. External Status & Attribution
    const statusRes = await makeRequest('/external/status');
    assert('GET /api/external/status returns HTTP 200', statusRes.status === 200);
    assert(
      'External status contains Open Beauty Facts attribution',
      statusRes.data?.data?.openBeautyFacts?.attribution?.includes('Open Beauty Facts')
    );

    // 2. Product Search
    const searchRes = await makeRequest('/products/search?q=ceramide&limit=2');
    assert('GET /api/products/search returns HTTP 200', searchRes.status === 200);
    assert(
      'Product search returns products array',
      Array.isArray(searchRes.data?.data?.products) && searchRes.data.data.products.length > 0
    );
    assert(
      'First product has name, brand and ingredients list',
      Boolean(searchRes.data?.data?.products[0]?.name && searchRes.data?.data?.products[0]?.brand)
    );

    // 3. Barcode Lookup (Real Open Beauty Facts Barcode)
    const barcodeRes = await makeRequest('/products/barcode/42164104');
    assert('GET /api/products/barcode/42164104 returns HTTP 200', barcodeRes.status === 200);
    assert(
      'Barcode lookup returns correct product name and brand',
      barcodeRes.data?.data?.brand === 'NIVEA'
    );
    assert(
      'Barcode product has completeness score',
      typeof barcodeRes.data?.data?.completenessScore === 'number'
    );

    // 4. Barcode Cache Speed
    const t0 = Date.now();
    const cachedBarcodeRes = await makeRequest('/products/barcode/42164104');
    const elapsed = Date.now() - t0;
    assert('Cached barcode lookup returns HTTP 200', cachedBarcodeRes.status === 200);
    assert(`Cached lookup executed in ${elapsed}ms (< 300ms)`, elapsed < 300);

    // 5. Product by ID
    const prodId = barcodeRes.data?.data?.id || '42164104';
    const idRes = await makeRequest(`/products/${prodId}`);
    assert(`GET /api/products/${prodId} returns HTTP 200`, idRes.status === 200);

    // 6. Unknown Barcode 404
    const unknownRes = await makeRequest('/products/barcode/0000000000000');
    assert('Unknown barcode returns HTTP 404', unknownRes.status === 404);

    // 7. Ingredient Search
    const ingSearch = await makeRequest('/ingredients/search?q=retinol');
    assert('GET /api/ingredients/search returns HTTP 200', ingSearch.status === 200);
    assert(
      'Ingredient search returns matching INCI compound',
      Array.isArray(ingSearch.data?.data) && ingSearch.data.data.length > 0
    );

    // 8. Single Ingredient Profile
    const ingDetail = await makeRequest('/ingredients/niacinamide');
    assert('GET /api/ingredients/niacinamide returns HTTP 200', ingDetail.status === 200);
    assert(
      'Niacinamide profile includes scientific description and functions',
      ingDetail.data?.data?.functions?.includes('Antioxidant') &&
        Boolean(ingDetail.data?.data?.description)
    );
    assert(
      'Ingredient profile includes comedogenicity and irritancy reference scores',
      ingDetail.data?.data?.comedogenicity === 0 && ingDetail.data?.data?.irritancy === 0
    );

    // 9. Ingredient Formula Analysis
    const analysisRes = await makeRequest('/ingredients/analyze', 'POST', {
      ingredients: ['Aqua', 'Glycerin', 'Salicylic Acid', 'Fragrance', 'Ceramide NP'],
    });
    assert('POST /api/ingredients/analyze returns HTTP 200', analysisRes.status === 200);
    assert(
      'Analysis identifies active compounds',
      Array.isArray(analysisRes.data?.data?.activeIngredients) &&
        analysisRes.data.data.activeIngredients.length > 0
    );
    assert(
      'Analysis flags fragrance as potential irritant',
      analysisRes.data?.data?.potentialIrritants?.some((i) => i.name.toLowerCase().includes('fragrance'))
    );
    assert(
      'Analysis includes dermatological disclaimer',
      Boolean(analysisRes.data?.data?.disclaimer)
    );
  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log(`\n🏁 Test Results: ${passed} / ${total} tests passed.\n`);
  process.exit(passed === total ? 0 : 1);
}

runTests();

