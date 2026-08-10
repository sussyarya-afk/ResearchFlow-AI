import { Search, Bell, Moon, User } from 'lucide-react';
import './DashboardHeader.css';

export function DashboardHeader() {
  return (
    <header className="rf-dashboard-header">
      <div className="rf-dashboard-header__search">
        <Search className="rf-dashboard-header__search-icon" size={18} />
        <input
          type="text"
          placeholder="Search projects, documents, or chats..."
          className="rf-dashboard-header__search-input"
        />
      </div>

      <div className="rf-dashboard-header__actions">
        <button className="rf-dashboard-header__action-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="rf-dashboard-header__notification-badge" />
        </button>
        <button className="rf-dashboard-header__action-btn" aria-label="Toggle theme">
          <Moon size={20} />
        </button>
        
        <div className="rf-dashboard-header__profile">
          <div className="rf-dashboard-header__avatar">
            <User size={18} />
          </div>
          <span className="rf-dashboard-header__user-name">Jane Doe</span>
        </div>
      </div>
    </header>
  );
}
