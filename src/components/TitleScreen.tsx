import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';
import { Sparkles, Play, BookOpen, User, Volume2, VolumeX } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenCustomizer: () => void;
  hasSavedProgress: boolean;
  starCount: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenCustomizer,
  hasSavedProgress,
  starCount
}) => {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleStart = () => {
    sound.startBGM();
    sound.playClick();
    onStartGame();
  };

  const toggleSound = () => {
    const next = !isMuted;
    sound.setMute(next);
    setIsMuted(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-12 bg-gradient-to-b from-[#090314] via-[#16082c] to-[#250d47] text-white select-none overflow-hidden">
      {/* Background Decorative Cosmic Glow and Floating Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Experiencia 3D Interactiva ARMY</span>
        </div>

        <button
          onClick={toggleSound}
          className="p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-800/40 transition"
          title={isMuted ? 'Activar música' : 'Silenciar música'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Center Lockup: Bespoke inline SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-2xl mx-auto">
        {/* Bespoke SVG Title Lockup */}
        <div className="w-full max-w-lg mb-4">
          <svg viewBox="0 0 600 140" className="w-full h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="40%" stopColor="#C084FC" />
                <stop offset="70%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#FDE047" />
              </linearGradient>
              <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="50%" stopColor="#E879F9" />
                <stop offset="100%" stopColor="#FBCFE8" />
              </linearGradient>
            </defs>

            {/* Glowing Logo Contour */}
            <text
              x="50%"
              y="55"
              textAnchor="middle"
              className="font-black text-4xl uppercase tracking-wider"
              fill="url(#titleGrad)"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.12em',
                fontSize: '44px',
                fontWeight: 900
              }}
            >
              BTS MYSTERY
            </text>

            <text
              x="50%"
              y="95"
              textAnchor="middle"
              fill="url(#subGrad)"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.08em',
                fontSize: '22px',
                fontWeight: 700
              }}
            >
              EL SECRETO DE LAS SIETE PUERTAS
            </text>

            {/* Subtitle badge */}
            <text
              x="50%"
              y="125"
              textAnchor="middle"
              fill="#F9A8D4"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.15em',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              ✦ LA AVENTURA DE MARI ✦
            </text>
          </svg>
        </div>

        <p className="text-purple-200 text-sm md:text-base max-w-md mx-auto mb-8 font-light">
          Acompaña a Mari al universo musical para resolver acertijos, recuperar las 7 estrellas de los integrantes y encender el gran concierto.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-sm">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 text-white font-extrabold text-base shadow-xl shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{hasSavedProgress ? 'Continuar Partida' : 'Comenzar Aventura'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenCustomizer();
            }}
            className="w-full sm:w-auto p-4 rounded-2xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 hover:text-white transition flex items-center justify-center gap-2 text-sm font-semibold"
            title="Personalizar a Mari"
          >
            <User className="w-5 h-5 text-purple-300" />
            <span className="sm:hidden">Estilo</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowStoryModal(true);
            }}
            className="w-full sm:w-auto p-4 rounded-2xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 hover:text-white transition flex items-center justify-center gap-2 text-sm font-semibold"
            title="Historia y Prólogo"
          >
            <BookOpen className="w-5 h-5 text-pink-300" />
            <span className="sm:hidden">Historia</span>
          </button>
        </div>

        {hasSavedProgress && (
          <div className="mt-4 text-xs text-yellow-300/90 font-medium">
            Progreso guardado: <span className="font-bold">{starCount} de 7 estrellas</span> recuperadas
          </div>
        )}
      </div>

      {/* Bottom Control Hint Line */}
      <div className="relative z-10 text-center">
        <p className="text-[11px] md:text-xs text-purple-300/70 tracking-wide font-mono">
          WASD Mover · Shift Correr · Espacio Saltar · E Interactuar · Esc Menú
        </p>
      </div>

      {/* Story / Lore Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg bg-[#180e2d] border border-purple-500/50 rounded-3xl p-6 text-purple-100 shadow-2xl">
            <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
              <span>💜</span>
              <span>El Misterio del Universo Púrpura</span>
            </h3>
            <p className="text-sm leading-relaxed text-purple-200 mb-4">
              Mari es una gran fan de BTS. Una noche, mientras organiza su colección ARMY, encuentra una misteriosa caja púrpura.
            </p>
            <p className="text-sm leading-relaxed text-purple-200 mb-4">
              Al abrirla, una carta resplandeciente con siete símbolos le revela que las siete puertas del universo musical han sido selladas. Una voz suave y cálida le explica que solamente una verdadera ARMY con valor y amor por la música podrá superar los desafíos de cada mundo y recuperar las siete estrellas perdidas.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setShowStoryModal(false);
              }}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 font-bold text-white transition"
            >
              Entendido, ¡estoy lista!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
