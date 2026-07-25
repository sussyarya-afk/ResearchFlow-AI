import { Card, Button } from '@/components/ui';
import './SettingsPage.css';

const SETTING_SECTIONS = [
  {
    title: 'Appearance',
    description: 'Customize the look and feel of your workspace',
    items: [
      { label: 'Theme', value: 'Dark', type: 'select' as const },
      { label: 'Compact mode', value: false, type: 'toggle' as const },
    ],
  },
  {
    title: 'Notifications',
    description: 'Choose what you want to be notified about',
    items: [
      { label: 'Email notifications', value: true, type: 'toggle' as const },
      { label: 'Analysis complete alerts', value: true, type: 'toggle' as const },
      { label: 'Weekly digest', value: false, type: 'toggle' as const },
    ],
  },
  {
    title: 'Danger Zone',
    description: 'Irreversible account actions',
    items: [],
    isDanger: true,
  },
];

export function SettingsPage() {
  return (
    <div className="rf-settings-page animate-fade-in">
      <h1 className="rf-settings-page__title">Settings</h1>
      <p className="rf-settings-page__subtitle">
        Manage your application preferences
      </p>

      <div className="rf-settings-page__sections">
        {SETTING_SECTIONS.map((section) => (
          <Card
            key={section.title}
            variant={section.isDanger ? 'outlined' : 'glass'}
            padding="lg"
          >
            <div className="rf-settings-section">
              <div className="rf-settings-section__header">
                <h2 className={`rf-settings-section__title ${section.isDanger ? 'rf-settings-section__title--danger' : ''}`}>
                  {section.title}
                </h2>
                <p className="rf-settings-section__desc">{section.description}</p>
              </div>

              {section.items.map((item) => (
                <div className="rf-settings-item" key={item.label}>
                  <span className="rf-settings-item__label">{item.label}</span>
                  {item.type === 'toggle' && (
                    <button
                      className={`rf-settings-toggle ${item.value ? 'rf-settings-toggle--on' : ''}`}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span className="rf-settings-toggle__thumb" />
                    </button>
                  )}
                  {item.type === 'select' && (
                    <span className="rf-settings-item__value">{String(item.value)}</span>
                  )}
                </div>
              ))}

              {section.isDanger && (
                <div className="rf-settings-section__danger-actions">
                  <Button variant="danger" size="sm">
                    Delete Account
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
