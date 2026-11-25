const http = require('http');
const app = require('./src/app');
const { groqService } = require('./src/services/groqService');
const fs = require('fs');
const path = require('path');

const makeRequest = (port, path, method = 'POST', postData = null) => {
  return new Promise((resolve, reject) => {
    let payload = null;
    const headers = { 'Content-Type': 'application/json' };
    if (postData) {
      payload = JSON.stringify(postData);
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: body ? JSON.parse(body) : null,
            });
          } catch {
            resolve({ statusCode: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runGroqTests() {
  console.log('🧪 Starting Groq AI Face Recognition & Home Remedies Test Suite...\n');

  // Start app on ephemeral port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Groq API Key
    console.log('1. Checking Groq configuration:');
    assert(groqService.hasLiveKey(), 'Groq API Key is active and recognized');

    // 2. Test Remedy Formulation via Groq
    console.log('\n2. Testing POST /api/remedies/ai-formulate:');
    const remedyRes = await makeRequest(port, '/api/remedies/ai-formulate', 'POST', {
      concern: 'Dehydrated skin barrier and mild redness',
      skinType: 'Sensitive',
      allergies: ['Lavender', 'Fragrance'],
    });

    assert(remedyRes.statusCode === 200, `Status is 200 OK (got ${remedyRes.statusCode})`);
    assert(remedyRes.body.success === true, 'Response reports success: true');
    assert(Boolean(remedyRes.body.data?.name), `Remedy name generated: "${remedyRes.body.data?.name}"`);
    assert(Array.isArray(remedyRes.body.data?.ingredients), 'Remedy contains ingredients array');
    assert(Boolean(remedyRes.body.data?.scientificExplanation), 'Contains scientific dermatology explanation');
    assert(Boolean(remedyRes.body.data?.patchTestingGuidance), 'Contains patch testing protocol');

    // 3. Test Remedy Safety Check via Groq
    console.log('\n3. Testing POST /api/remedies/ai-safety-check:');
    const safetyRes = await makeRequest(port, '/api/remedies/ai-safety-check', 'POST', {
      remedyName: 'Lemon & Baking Soda DIY Scrub',
      ingredients: ['Fresh Lemon Juice', 'Baking Soda', 'Toothpaste'],
    });

    assert(safetyRes.statusCode === 200, `Status is 200 OK (got ${safetyRes.statusCode})`);
    assert(safetyRes.body.data?.isSafeForFacialUse === false, 'Correctly flags lemon and baking soda as unsafe for facial use');
    assert(Boolean(safetyRes.body.data?.flaggedHazards?.length > 0), 'Contains specific barrier hazard warnings');

    // 4. Test Face Recognition & Diagnostics via Groq Vision
    console.log('\n4. Testing POST /api/ai/face-analysis:');
    const imgPath = path.join(__dirname, '../frontend/assets/icon.png');
    let b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVR42u3OMQEAAAgDINe/tCX0twEJ6CZdAQICBAgQIECAAAECBAgQIECAwGkBSw0CAaT3iE8AAAAASUVORK5CYII=';
    if (fs.existsSync(imgPath)) {
      b64 = 'data:image/png;base64,' + fs.readFileSync(imgPath).toString('base64');
    }

    const faceRes = await makeRequest(port, '/api/ai/face-analysis', 'POST', { image: b64 });

    assert(faceRes.statusCode === 200, `Status is 200 OK (got ${faceRes.statusCode})`);
    assert(typeof faceRes.body.data?.isHumanFace === 'boolean', `isHumanFace parsed properly (${faceRes.body.data?.isHumanFace})`);
    assert(Boolean(faceRes.body.data?.provider), `Provider identified: "${faceRes.body.data?.provider}"`);

    // 5. Test AI Chat Assistant via Groq
    console.log('\n5. Testing POST /api/ai/chat with Groq Reasoning:');
    const chatRes = await makeRequest(port, '/api/ai/chat', 'POST', {
      message: 'What is the scientifically recommended way to use Niacinamide with Vitamin C in humid weather?',
    });

    assert(chatRes.statusCode === 200, `Status is 200 OK (got ${chatRes.statusCode})`);
    assert(chatRes.body.data?.reply?.length > 50, 'Generated comprehensive clinical reply');
    assert(chatRes.body.data?.provider?.includes('Groq') || chatRes.body.data?.provider?.includes('Clinical'), `Active provider: ${chatRes.body.data?.provider}`);

    console.log('\n===============================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('===============================================');
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runGroqTests();
