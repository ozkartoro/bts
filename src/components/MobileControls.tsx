import React, { useRef, useState, useEffect } from 'react';
import { sound } from '../audio/soundEngine';
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
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
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

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden touch-none flex justify-between items-end p-6 md:hidden">
      {/* Virtual Joystick (Bottom Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto w-32 h-32 rounded-full bg-purple-950/60 border-2 border-purple-500/50 flex items-center justify-center relative shadow-2xl backdrop-blur-none"
      >
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-white/80 shadow-lg absolute transition-transform"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        />
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="pointer-events-auto flex flex-col gap-3.5 items-end">
        {hasNearInteract && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onInteract();
            }}
            onClick={onInteract}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 border-2 border-white flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform"
            title="Interactuar"
          >
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </button>
        )}

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={onJump}
          className="w-16 h-16 rounded-full bg-purple-600/90 border-2 border-purple-300 flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform"
          title="Saltar"
        >
          <ArrowUp className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
