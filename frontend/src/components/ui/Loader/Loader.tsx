import './Loader.css';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

export function Loader({
  size = 'md',
  label = 'Loading…',
  fullScreen = false,
}: LoaderProps) {
  const content = (
    <div className={`rf-loader rf-loader--${size}`} role="status">
      <div className="rf-loader__ring">
        <div className="rf-loader__arc rf-loader__arc--primary" />
        <div className="rf-loader__arc rf-loader__arc--accent" />
      </div>
      {label && <span className="rf-loader__label">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return <div className="rf-loader__fullscreen">{content}</div>;
  }

  return content;
}
