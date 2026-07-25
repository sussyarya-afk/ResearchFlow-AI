import { Card, Input, Button } from '@/components/ui';
import './ProfilePage.css';

export function ProfilePage() {
  return (
    <div className="rf-profile-page animate-fade-in">
      <h1 className="rf-profile-page__title">Profile</h1>
      <p className="rf-profile-page__subtitle">
        Manage your personal information and preferences
      </p>

      <Card variant="glass" padding="lg">
        <div className="rf-profile-page__avatar-section">
          <div className="rf-profile-page__avatar">U</div>
          <div>
            <h3 className="rf-profile-page__name">User</h3>
            <p className="rf-profile-page__email">user@example.com</p>
          </div>
        </div>

        <form className="rf-profile-page__form" onSubmit={(e) => e.preventDefault()}>
          <div className="rf-profile-page__row">
            <Input label="First name" placeholder="Jane" fullWidth />
            <Input label="Last name" placeholder="Doe" fullWidth />
          </div>
          <Input label="Email" type="email" placeholder="user@example.com" fullWidth />
          <Input label="Organization" placeholder="Acme Research Lab" fullWidth />
          <div className="rf-profile-page__actions">
            <Button variant="primary">Save Changes</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
