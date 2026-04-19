const https = require('https');

const API_KEY = 'gaio_prod_3bf9a2e8c1d45f0b8d7c2a1e6f9b4d3c';
const BASE_URL = 'gaioevent.tech';

async function fetchData(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      rejectUnauthorized: false 
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: data.startsWith('{') ? JSON.parse(data) : data 
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, error: 'Parse Error' });
        }
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

async function run() {
  console.log('Testing Authentication and Status...');
  const status = await fetchData('/api/status');
  console.log('Status Response:', JSON.stringify(status, null, 2));

  console.log('\nTesting Sponsors Fetch...');
  const sponsors = await fetchData('/api/sponsors');
  console.log('Sponsors Response:', JSON.stringify(sponsors, null, 2));
  
  console.log('\nTesting Volunteers Fetch...');
  const volunteers = await fetchData('/api/volunteers');
  console.log('Volunteers Response:', JSON.stringify(volunteers, null, 2));
}

run();
