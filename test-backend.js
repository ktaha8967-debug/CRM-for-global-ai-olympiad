const https = require('https');

const API_KEY = 'gaio_prod_3bf9a2e8c1d45f0b8d7c2a1e6f9b4d3c';
const BASE_URL = 'gaioevent.tech';

async function fetchData(endpoint) {
  return new Promise((resolve) => {
    // Structure: /gaio-api.php?endpoint=xxx&api_key=xxx
    const path = `/gaio-api.php?endpoint=${endpoint}&api_key=${API_KEY}`;
    
    const options = {
      hostname: BASE_URL,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      rejectUnauthorized: false 
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (data.trim().startsWith('<')) {
            resolve({ status: res.statusCode, error: 'Received HTML instead of JSON', preview: data.substring(0, 100) });
          } else {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          }
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, error: 'Parse Error' });
        }
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

async function run() {
  console.log('--- GAIO REAL-TIME DATABASE VERIFICATION ---');
  
  const endpoints = ['status', 'statistics', 'sponsors', 'volunteers'];
  
  for (const endpoint of endpoints) {
    console.log(`\nFetching: ${endpoint}...`);
    const result = await fetchData(endpoint);
    console.log(`Status: ${result.status}`);
    
    if (result.data && result.data.status === 'success') {
      console.log('✅ REAL DATA FETCHED SUCCESSFULLY!');
      console.log(JSON.stringify(result.data.data, null, 2));
    } else {
      console.log('❌ FAILED');
      console.log(result.error || result.data || 'Unknown error');
    }
  }
}

run();
