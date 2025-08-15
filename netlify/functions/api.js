const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '');

  try {
    switch (path) {
      case '/algorithms':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            algorithms: [
              { name: 'AES-256-GCM', value: 'aes-256-gcm', type: 'symmetric' },
              { name: 'ChaCha20-Poly1305', value: 'chacha20-poly1305', type: 'symmetric' },
              { name: 'RSA-4096', value: 'rsa-4096', type: 'asymmetric' },
              { name: 'Ed25519', value: 'ed25519', type: 'asymmetric' }
            ]
          })
        };

      case '/encrypt':
        if (event.httpMethod !== 'POST') {
          return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
        
        const { data, algorithm } = JSON.parse(event.body);
        if (!data || !algorithm) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing data or algorithm' }) };
        }

        // Simple encryption simulation for demo
        const encrypted = crypto.createHash('sha256').update(data + algorithm).digest('hex');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            encrypted_data: encrypted,
            algorithm,
            timestamp: new Date().toISOString(),
            status: 'success'
          })
        };

      case '/decrypt':
        if (event.httpMethod !== 'POST') {
          return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
        
        const { encrypted_data } = JSON.parse(event.body);
        if (!encrypted_data) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing encrypted data' }) };
        }

        // Simple decryption simulation for demo
        const decrypted = `Decrypted: ${encrypted_data}`;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            decrypted_data: decrypted,
            timestamp: new Date().toISOString(),
            status: 'success'
          })
        };

      case '/health':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            status: 'healthy',
            service: 'CipherCanary API',
            timestamp: new Date().toISOString()
          })
        };

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
