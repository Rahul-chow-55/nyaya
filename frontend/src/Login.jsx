import React, { useState } from 'react';
import { ShieldCheck, Briefcase, Users, LayoutDashboard } from 'lucide-react';

const Login = ({ setAuth }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Only autofill in login mode
    if (!isSignup) {
        if (role === 'client') {
            setEmail('client@nyayasaathi.in');
            setPassword('demo123');
        } else if (role === 'employee') {
            setEmail('employee@nyayasaathi.in');
            setPassword('demo123');
        } else if (role === 'admin') {
            setEmail('admin@nyayasaathi.in');
            setPassword('demo123');
        }
    } else {
        // Clear for fresh signup
        setEmail('');
        setPassword('');
    }
  }, [role, isSignup]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignup ? { name, email, password, role, phone } : { email, password };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuth(data.user);
      } else {
        setError(data.details || data.error || 'Operation failed.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-visual">
        <div className="sidebar-logo" style={{ marginBottom: '30px', fontSize: '2.5rem', color: 'white' }}>
           <ShieldCheck size={48} />
           <span>NYAYA SAATHI</span>
        </div>
        <h1>{isSignup ? "Join Our Community" : "Empowering Every Citizen"}</h1>
        <p>Access legal aid, government schemes, and daily wage opportunities.</p>
        
        <div style={{ marginTop: '40px', display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', backdropFilter: 'blur(5px)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>10k+</div>
                <div style={{ fontSize: '0.7rem' }}>Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>24/7</div>
                <div style={{ fontSize: '0.7rem' }}>Support</div>
            </div>
        </div>
      </div>

      <div className="login-form-container">
        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
        <p className="subtitle">{isSignup ? "Fill your details to get started" : "Sign in to your account"}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="role-selector" style={{ marginBottom: '10px' }}>
            <div className={`role-option ${role === 'client' ? 'active' : ''}`} onClick={() => setRole('client')}>Client</div>
            <div className={`role-option ${role === 'employee' ? 'active' : ''}`} onClick={() => setRole('employee')}>Employee</div>
            {!isSignup && <div className={`role-option ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>Admin</div>}
          </div>

          {isSignup && (
            <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '5px' }}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignup && (
            <div className="input-group" style={{ marginBottom: '5px' }}>
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter 10 digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={isSignup && role === 'employee'}
              />
            </div>
          )}

          {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '5px 0' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"} 
            <button 
              onClick={() => setIsSignup(!isSignup)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
            >
                {isSignup ? "Login here" : "Sign up here"}
            </button>
        </p>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#718096' }}>
          By continuing, you agree to our <a href="#" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Terms</a> and <a href="#" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
