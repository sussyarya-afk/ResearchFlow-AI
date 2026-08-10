import { useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { ChevronLeft, LayoutPanelLeft } from 'lucide-react';
import './WorkspaceLayout.css';

export function WorkspaceLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  return (
    <div className="rf-workspace">
      {/* ── Top bar ── */}
      <header className="rf-workspace__bar" role="banner">
        <div className="rf-workspace__bar-left">
          <Link to="/projects" className="rf-workspace__back" aria-label="Back to projects">
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Projects</span>
          </Link>
          <div className="rf-workspace__divider" aria-hidden="true" />
          <span className="rf-workspace__project-id">
            {projectId ? `Workspace · ${projectId}` : 'Workspace'}
          </span>
        </div>

        <div className="rf-workspace__bar-right">
          <button
            className={`rf-workspace__panel-toggle ${rightPanelVisible ? 'rf-workspace__panel-toggle--active' : ''}`}
            onClick={() => setRightPanelVisible(v => !v)}
            aria-label={rightPanelVisible ? 'Hide document panel' : 'Show document panel'}
            aria-pressed={rightPanelVisible}
            id="toggle-right-panel"
          >
            <LayoutPanelLeft size={15} aria-hidden="true" />
            Viewer
          </button>
        </div>
      </header>

      {/* ── 3-column body ── */}
      <div
        className="rf-workspace__body"
        style={
          rightPanelVisible
            ? undefined
            : { '--ws-right-display': 'none' } as React.CSSProperties
        }
      >
        <Outlet context={{ rightPanelVisible, setRightPanelVisible }} />
      </div>
    </div>
  );
}
