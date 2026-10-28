import React from 'react';
import { sound } from '../audio/soundEngine';
import { Sparkles, MessageCircle } from 'lucide-react';

interface DialogueModalProps {
  title: string;
  speaker: string;
  avatarIcon?: string;
  text: string;
  options?: {
    label: string;
    action: () => void;
  }[];
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  title,
  speaker,
  avatarIcon = '💜',
  text,
  options,
  onClose
}) => {
  return (
    <div
      className="fixed inset-x-3 sm:inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-50 pointer-events-auto max-h-[85dvh] overflow-y-auto"
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom, 12px))' }}
    >
      <div className="bg-[#190c33]/95 border-2 border-purple-500/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl text-white">
        {/* Speaker Name Tag */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">{avatarIcon}</span>
            <span className="font-extrabold text-sm text-yellow-300 tracking-wide">{speaker}</span>
          </div>
          <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">{title}</span>
        </div>

        {/* Dialogue Body */}
        <p className="text-sm text-purple-100 leading-relaxed my-3 font-normal">
          {text}
        </p>

        {/* Options / Advance */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          {options && options.length > 0 ? (
            options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.playClick();
                  opt.action();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition active:scale-95 border border-purple-400/40"
              >
                {opt.label}
              </button>
            ))
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition active:scale-95"
            >
              Continuar ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
