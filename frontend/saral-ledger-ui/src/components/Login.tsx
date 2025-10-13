import { useState } from 'react';
import { authService } from '../services/api';
import { LoginRequest } from '../types';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.token);
      onLogin(response.token, response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;