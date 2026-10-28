import React, { useEffect } from 'react';
import { sound } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Award, Heart, RotateCcw } from 'lucide-react';

interface FinalConcertModalProps {
  stats: {
    puzzlesSolved: number;
    stepsWalked: number;
    notesPlayed: number;
    dishesCooked: number;
    danceScore: number;
  };
  onClose: () => void;
  onRestart: () => void;
}

export const FinalConcertModal: React.FC<FinalConcertModalProps> = ({
  stats,
  onClose,
  onRestart
}) => {
  useEffect(() => {
    sound.playStarFanfare();
    sound.playFirework();

    // Trigger celebratory confetti cannon
    const end = Date.now() + 3.5 * 1000;
    const interval: number = window.setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      sound.playFirework();
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#8B5CF6', '#EC4899', '#FACC15', '#38BDF8', '#FFFFFF']
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#24104d] via-[#1a0c36] to-[#120626] border-2 border-yellow-400/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl text-center relative max-h-[92dvh] overflow-y-auto">
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Trophy Badge */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-xl shadow-yellow-500/30 border-2 border-white/40 animate-bounce">
            <span className="text-4xl">👑</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/40 text-yellow-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Misterio Resuelto · 7 de 7 Estrellas</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 mb-2">
            ¡El Concierto de las Siete Estrellas!
          </h2>

          <p className="text-sm md:text-base text-purple-200 leading-relaxed max-w-md mx-auto mb-6">
            «Mari, has demostrado que la verdadera magia está en la música, la amistad y los sueños. Las siete puertas brillan en armonía eterna gracias a ti.»
          </p>

          {/* Crown Reward Card */}
          <div className="bg-purple-950/70 border border-purple-500/50 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✨</div>
              <div>
                <h4 className="font-bold text-sm text-yellow-300">
                  Recompensa: Corona del Universo Púrpura
                </h4>
                <p className="text-xs text-purple-200/90">
                  Desbloqueado el modo de exploración libre permanente con confeti y baile ARMY.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-purple-900/40 border border-purple-700/40">
              <span className="text-[10px] uppercase font-bold text-purple-300">Pasos dados</span>
              <p className="text-lg font-extrabold text-white font-mono">{stats.stepsWalked}</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-900/40 border border-purple-700/40">
              <span className="text-[10px] uppercase font-bold text-purple-300">Acertijos resueltos</span>
              <p className="text-lg font-extrabold text-emerald-400 font-mono">{stats.puzzlesSolved}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:to-yellow-600 font-extrabold text-white shadow-xl active:scale-95 transition"
            >
              Explorar Libremente 💜
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="py-3.5 px-5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              title="Volver a jugar desde el inicio"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Aventura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
