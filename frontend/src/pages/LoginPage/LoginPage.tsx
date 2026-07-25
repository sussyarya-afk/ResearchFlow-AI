import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';

export function LoginPage() {
  return (
    <div className="rf-auth-form">
      <h2 className="rf-auth-form__title">Welcome back</h2>
      <p className="rf-auth-form__subtitle">
        Sign in to continue to ResearchFlow AI
      </p>

      <form className="rf-auth-form__body" onSubmit={(e) => e.preventDefault()}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          fullWidth
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          fullWidth
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
        <Button fullWidth size="lg">
          Sign In
        </Button>
      </form>

      <p className="rf-auth-form__switch">
        Don't have an account?{' '}
        <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
