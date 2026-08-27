import { useState, useEffect } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { useAuth } from '@/store';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [organization, setOrganization] = useState(user?.organization || 'Research Labs AI');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || (user.email?.includes('demo') ? 'Alex Rivera' : ''));
      setEmail(user.email);
      setOrganization(user.organization || 'AgentNotebook Research Labs');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        email: email.trim(),
        fullName: fullName.trim(),
        organization: organization.trim(),
        password: newPassword.trim() || undefined,
      });
      setSuccess(true);
      setNewPassword('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = fullName || (email ? email.split('@')[0] : 'User');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="rf-profile-page animate-fade-in">
      <h1 className="rf-profile-page__title">Profile & Identity</h1>
      <p className="rf-profile-page__subtitle">
        Manage your researcher information and account credentials
      </p>

      {success && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-success)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '1rem',
          fontSize: 'var(--font-size-sm)'
        }}>
          <CheckCircle2 size={18} />
          <span>Profile successfully updated!</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '1rem',
          fontSize: 'var(--font-size-sm)'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <Card variant="glass" padding="lg">
        <div className="rf-profile-page__avatar-section">
          <div className="rf-profile-page__avatar">{userInitial}</div>
          <div>
            <h3 className="rf-profile-page__name">{displayName}</h3>
            <p className="rf-profile-page__email">{email || 'user@example.com'}</p>
            <span style={{ fontSize: '11px', color: 'var(--color-primary-400)', background: 'rgba(59, 123, 244, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              {organization}
            </span>
          </div>
        </div>

        <form className="rf-profile-page__form" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Alex Rivera"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            required
            id="profile-fullname"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            id="profile-email"
          />

          <Input
            label="Institution / Organization"
            placeholder="e.g. Cognitive Computing Institute"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            fullWidth
            id="profile-org"
          />

          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            id="profile-password"
          />

          <div className="rf-profile-page__actions">
            <Button
              variant="primary"
              type="submit"
              disabled={saving}
              isLoading={saving}
              leftIcon={<Sparkles size={16} />}
              id="save-profile-btn"
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
