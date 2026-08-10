import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { apiClient } from '@/services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData);
      
      if (response && response.access_token) {
        localStorage.setItem('token', response.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rf-auth-form">
      <h2 className="rf-auth-form__title">Welcome back</h2>
      <p className="rf-auth-form__subtitle">
        Sign in to continue to ResearchFlow AI
      </p>

      <form className="rf-auth-form__body" onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
        />
        <div className="rf-auth-form__options">
          <label className="rf-auth-form__remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <Link to="#" className="rf-auth-form__forgot">
            Forgot password?
          </Link>
        </div>
        <Button fullWidth size="lg" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="rf-auth-form__switch">
        Don't have an account?{' '}
        <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
