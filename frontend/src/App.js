import React from 'react';

function App() {
  const handleGetStarted = () => {
    alert('🚀 Welcome to CipherCanary! This is your modern cryptography toolkit.\n\nFeatures:\n• AES-256-GCM Encryption\n• RSA-4096 Key Management\n• ChaCha20-Poly1305 Support\n• Audit Logging\n\nClick on any algorithm card to learn more!');
  };

  const handleAlgorithmClick = (algorithm) => {
    const descriptions = {
      'AES-256-GCM': 'Advanced Encryption Standard with 256-bit key and Galois/Counter Mode. Provides both confidentiality and authenticity. Perfect for high-performance encryption.',
      'ChaCha20-Poly1305': 'Modern stream cipher with authenticated encryption. Faster than AES on many platforms and provides excellent security.',
      'RSA-4096': 'Rivest-Shamir-Adleman asymmetric encryption with 4096-bit keys. Used for key exchange and digital signatures.',
      'Ed25519': 'Edwards-curve Digital Signature Algorithm using Curve25519. Provides fast, secure digital signatures with small key sizes.'
    };
    
    alert(`🔐 ${algorithm}\n\n${descriptions[algorithm]}\n\nThis algorithm is ready for use in your CipherCanary toolkit!`);
  };

  const toggleSystemStatus = () => {
    const statusElement = document.getElementById('system-status');
    if (statusElement.textContent.includes('Online')) {
      statusElement.innerHTML = 'System Status: Offline ❌';
    } else {
      statusElement.innerHTML = 'System Status: Online ✅';
    }
  };

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0' }}>🔐 CipherCanary</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Modern Cryptography and Security Toolkit
        </p>
      </header>
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #333',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onClick={handleGetStarted}>
            <h2>🚀 Quick Start</h2>
            <p>Welcome to CipherCanary! This is your modern cryptography toolkit.</p>
            <button style={{
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.3s ease'
            }} onMouseOver={(e) => e.target.style.backgroundColor = '#1976d2'} 
               onMouseOut={(e) => e.target.style.backgroundColor = '#2196f3'}>
              Get Started
            </button>
          </div>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h2>🔒 Security Features</h2>
            <ul style={{ textAlign: 'left' }}>
              <li>AES-256-GCM Encryption</li>
              <li>RSA-4096 Key Management</li>
              <li>ChaCha20-Poly1305 Support</li>
              <li>Audit Logging</li>
            </ul>
          </div>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h2>📊 Dashboard</h2>
            <p>Monitor your encryption operations and system status in real-time.</p>
            <div id="system-status" style={{
              backgroundColor: '#2196f3',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }} onClick={toggleSystemStatus} onMouseOver={(e) => e.target.style.backgroundColor = '#1976d2'} 
               onMouseOut={(e) => e.target.style.backgroundColor = '#2196f3'}>
              System Status: Online ✅
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #333',
          textAlign: 'center'
        }}>
          <h2>🎯 Available Algorithms</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '20px'
          }}>
            {[
              { name: 'AES-256-GCM', type: 'Symmetric', desc: 'High-performance encryption' },
              { name: 'ChaCha20-Poly1305', type: 'Symmetric', desc: 'Modern stream cipher' },
              { name: 'RSA-4096', type: 'Asymmetric', desc: 'Strong key exchange' },
              { name: 'Ed25519', type: 'Asymmetric', desc: 'Fast digital signatures' }
            ].map((algo, index) => (
              <div key={index} style={{
                backgroundColor: '#2a2a2a',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #444',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }} onClick={() => handleAlgorithmClick(algo.name)} 
                 onMouseOver={(e) => {
                   e.target.style.backgroundColor = '#3a3a3a';
                   e.target.style.borderColor = '#2196f3';
                 }} 
                 onMouseOut={(e) => {
                   e.target.style.backgroundColor = '#2a2a2a';
                   e.target.style.borderColor = '#444';
                 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2196f3' }}>{algo.name}</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', opacity: 0.8 }}>{algo.type}</p>
                <p style={{ margin: '0', fontSize: '0.8rem', opacity: 0.6 }}>{algo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer style={{
        textAlign: 'center',
        marginTop: '60px',
        padding: '20px',
        borderTop: '1px solid #333',
        opacity: 0.7
      }}>
        <p>© 2024 CipherCanary. Secure cryptography toolkit.</p>
      </footer>
    </div>
  );
}

export default App;

