import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { apiClient } from '@/services/api';
import { useAuth } from '@/store';
import { Sparkles, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('demo@agentnotebook.ai');
  const [password, setPassword] = useState('demo_password_123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.login(formData);
      
      if (response && response.access_token) {
        await login(response.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError('');
    setIsDemoLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo access failed. Please try manual login.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="rf-auth-form animate-fade-in-up">
      <h2 className="rf-auth-form__title">Welcome back</h2>
      <p className="rf-auth-form__subtitle">
        Sign in to continue to AgentNotebook AI
      </p>

      {/* ── 1-Click Demo Access ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Button 
          type="button"
          variant="accent" 
          fullWidth 
          size="lg"
          onClick={handleDemoAccess}
          disabled={isDemoLoading || isLoading}
          isLoading={isDemoLoading}
          leftIcon={<Sparkles size={18} />}
          id="demo-login-btn"
        >
          {isDemoLoading ? 'Launching Demo…' : '⚡ 1-Click Demo Login'}
        </Button>
      </div>

      <div className="rf-auth-divider">Or sign in with email</div>

      {error && (
        <div style={{
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '1rem',
          fontSize: 'var(--font-size-sm)'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form className="rf-auth-form__body" onSubmit={handleSubmit}>
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
            <input type="checkbox" defaultChecked />
            <span>Remember me</span>
          </label>
          <Link to="#" className="rf-auth-form__forgot">
            Forgot password?
          </Link>
        </div>
        <Button fullWidth size="lg" type="submit" disabled={isLoading || isDemoLoading} isLoading={isLoading}>
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
