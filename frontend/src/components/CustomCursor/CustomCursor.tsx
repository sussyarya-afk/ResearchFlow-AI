import { useEffect, useRef, useState } from 'react';
import { sound } from '@/utils/soundEngine';
import './CustomCursor.css';

export function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'active' | 'drag'>('default');
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseDown = () => {
      setCursorState('active');
      sound.playClick();
    };

    const onMouseUp = () => {
      setCursorState('default');
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, [data-cursor], .an-card, .an-tab, input, textarea');
      
      if (interactiveEl) {
        const label = interactiveEl.getAttribute('data-cursor-label') || '';
        setCursorLabel(label);
        setCursorState('hover');
        sound.playHover();
      } else {
        setCursorLabel('');
        setCursorState('default');
      }
    };

    const onMouseLeaveDoc = () => {
      setIsVisible(false);
    };

    const onMouseEnterDoc = () => {
      setIsVisible(true);
    };

    // Smooth inertia render loop for the outer ring
    const render = () => {
      // Spring lerp
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      animFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeaveDoc);
    document.addEventListener('mouseenter', onMouseEnterDoc);

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeaveDoc);
      document.removeEventListener('mouseenter', onMouseEnterDoc);
      cancelAnimationFrame(animFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`an-cursor-wrapper an-cursor--${cursorState}`} aria-hidden="true">
      {/* Central Precision Target Dot */}
      <div ref={cursorDotRef} className="an-cursor-dot" />

      {/* Trailing Fluid Inertial Ring */}
      <div ref={cursorRingRef} className="an-cursor-ring">
        {cursorLabel && <span className="an-cursor-label">{cursorLabel}</span>}
      </div>
    </div>
  );
}
