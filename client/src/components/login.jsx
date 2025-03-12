import React from 'react';

function Login() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Se connecter avec Google
      </button>
    </div>
  );
}

export default Login;
