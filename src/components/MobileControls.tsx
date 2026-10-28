import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface MobileControlsProps {
  onJoystickMove: (vec: { x: number; y: number } | null) => void;
  onJump: () => void;
  onInteract: () => void;
  hasNearInteract: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onJoystickMove,
  onJump,
  onInteract,
  hasNearInteract
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  // Auto-detect touch capability or mobile viewport
  const [isTouchActive, setIsTouchActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
  });

  // Track landscape / compact vertical heights
  const [isLandscapeShort, setIsLandscapeShort] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight < 520 && window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const onFirstTouch = () => {
      setIsTouchActive(true);
      window.removeEventListener('touchstart', onFirstTouch);
    };
    window.addEventListener('touchstart', onFirstTouch, { passive: true });

    const handleResize = () => {
      setIsLandscapeShort(window.innerHeight < 520 && window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('touchstart', onFirstTouch);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const maxRadius = isLandscapeShort ? 36 : 44;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        onJoystickMove(null);
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      onJoystickMove({ x: dx / maxRadius, y: dy / maxRadius });
    } else {
      const angle = Math.atan2(dy, dx);
      const clampedX = Math.cos(angle) * maxRadius;
      const clampedY = Math.sin(angle) * maxRadius;
      setKnobPos({ x: clampedX, y: clampedY });
      onJoystickMove({ x: clampedX / maxRadius, y: clampedY / maxRadius });
    }
  };

  if (!isTouchActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden touch-none flex justify-between items-end"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 12px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 12px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 12px))',
      }}
    >
      {/* Virtual Joystick (Bottom Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`pointer-events-auto rounded-full bg-purple-950/70 border-2 border-purple-500/60 flex items-center justify-center relative shadow-2xl backdrop-blur-sm ${
          isLandscapeShort ? 'w-24 h-24' : 'w-28 h-28 sm:w-32 sm:h-32'
        }`}
      >
        <div
          className={`rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-white/90 shadow-lg absolute transition-transform ${
            isLandscapeShort ? 'w-11 h-11' : 'w-13 h-13 sm:w-14 sm:h-14'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        />
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className={`pointer-events-auto flex flex-col items-end ${isLandscapeShort ? 'gap-2.5' : 'gap-3.5'}`}>
        {hasNearInteract && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onInteract();
            }}
            onClick={onInteract}
            className={`rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 border-2 border-white flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform ${
              isLandscapeShort ? 'w-13 h-13' : 'w-15 h-15 sm:w-16 sm:h-16'
            }`}
            title="Interactuar"
          >
            <Sparkles className={`${isLandscapeShort ? 'w-6 h-6' : 'w-7 h-7'} text-white animate-pulse`} />
          </button>
        )}

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onJump();
          }}
          onClick={onJump}
          className={`rounded-full bg-purple-600/90 border-2 border-purple-300 flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform ${
            isLandscapeShort ? 'w-13 h-13' : 'w-15 h-15 sm:w-16 sm:h-16'
          }`}
          title="Saltar"
        >
          <ArrowUp className={isLandscapeShort ? 'w-7 h-7' : 'w-8 h-8'} />
        </button>
      </div>
    </div>
  );
};
