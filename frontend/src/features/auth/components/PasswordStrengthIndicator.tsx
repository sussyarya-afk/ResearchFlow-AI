import './PasswordStrengthIndicator.css';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function PasswordStrengthIndicator({ password = '' }: PasswordStrengthIndicatorProps) {
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  const criteriaMet = [hasMinLength, hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  let strengthLabel = 'Weak';
  let strengthClass = 'weak';
  let score = 0;

  if (password.length > 0) {
    if (criteriaMet <= 2) {
      strengthLabel = 'Weak';
      strengthClass = 'weak';
      score = 1;
    } else if (criteriaMet === 3 || criteriaMet === 4) {
      strengthLabel = 'Fair';
      strengthClass = 'fair';
      score = 2;
    } else if (criteriaMet === 5) {
      strengthLabel = 'Strong';
      strengthClass = 'strong';
      score = 3;
    }
  }

  return (
    <div className="rf-pwd-strength">
      <div className="rf-pwd-strength__header">
        <span className="rf-pwd-strength__label">Password strength:</span>
        {password.length > 0 && (
          <span className={`rf-pwd-strength__status rf-pwd-strength__status--${strengthClass}`}>
            {strengthLabel}
          </span>
        )}
      </div>
      <div className="rf-pwd-strength__bars">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`rf-pwd-strength__bar ${
              password.length > 0 && bar <= score ? `rf-pwd-strength__bar--${strengthClass}` : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}
