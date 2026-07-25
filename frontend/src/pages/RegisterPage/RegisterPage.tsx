import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

import { Button, Input, EmptyState } from '@/components/ui';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';
import { PasswordStrengthIndicator } from '@/features/auth/components/PasswordStrengthIndicator';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched', // Validate on blur and change
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulate successful registration
      console.log('Registration data:', data);
      setIsSuccess(true);
    } catch (err) {
      setApiError('An unexpected error occurred. Please try again.');
    }
  };

  const togglePasswordButton = (isVisible: boolean, toggleFn: () => void) => (
    <button
      type="button"
      onClick={toggleFn}
      aria-label={isVisible ? 'Hide password' : 'Show password'}
      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 4, display: 'flex' }}
    >
      {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  if (isSuccess) {
    return (
      <div className="rf-auth-form animate-fade-in-up">
        <EmptyState
          icon={<CheckCircle2 size={48} color="var(--color-success)" />}
          title="Account Created"
          description="Your ResearchFlow AI account has been successfully created. We've sent a verification email to your inbox."
          action={
            <Link to="/login">
              <Button variant="primary">Proceed to Sign In</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="rf-auth-form animate-fade-in-up">
      <h2 className="rf-auth-form__title">Create your account</h2>
      <p className="rf-auth-form__subtitle">
        Start your free trial — no credit card required
      </p>

      {apiError && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', fontSize: 'var(--font-size-sm)' }}>
          <AlertCircle size={16} />
          {apiError}
        </div>
      )}

      <form className="rf-auth-form__body" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Doe"
          fullWidth
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          fullWidth
          error={errors.email?.message}
          {...register('email')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            fullWidth
            error={errors.password?.message}
            rightIcon={togglePasswordButton(showPassword, () => setShowPassword(!showPassword))}
            {...register('password')}
          />
          <PasswordStrengthIndicator password={passwordValue} />
        </div>

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          fullWidth
          error={errors.confirmPassword?.message}
          rightIcon={togglePasswordButton(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
          {...register('confirmPassword')}
        />

        <Button 
          type="submit" 
          fullWidth 
          size="lg" 
          variant="accent" 
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
        >
          Create Account
        </Button>
      </form>

      <div className="rf-auth-divider">Or</div>

      <SocialLoginButtons />

      <p className="rf-auth-form__switch">
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </p>

      <p className="rf-auth-terms">
        By creating an account, you agree to our <br />
        <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>.
      </p>
    </div>
  );
}
