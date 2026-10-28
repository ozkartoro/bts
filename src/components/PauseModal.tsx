import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';
import { BloomTweakProps } from '../game/three/GameCanvas';
import { X, Play, RotateCcw, Volume2, Home, Sparkles } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onReturnToHub: () => void;
  onResetProgress: () => void;
  bloomConfig?: BloomTweakProps;
  onUpdateBloomConfig?: (cfg: BloomTweakProps) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onReturnToHub,
  onResetProgress,
  bloomConfig,
  onUpdateBloomConfig
}) => {
  const [musicVol, setMusicVol] = useState<number>(0.4);
  const [sfxVol, setSfxVol] = useState<number>(0.6);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [showBloomTweaks, setShowBloomTweaks] = useState<boolean>(false);

  const baseIntensity = bloomConfig?.baseIntensity ?? 1.4;
  const maxIntensity = bloomConfig?.maxIntensity ?? 3.5;
  const baseThreshold = bloomConfig?.baseThreshold ?? 0.22;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-md bg-[#190c33] border-2 border-purple-500/60 rounded-3xl p-6 text-white shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
          <div>
            <h3 className="font-bold text-lg text-purple-100">Menú de Pausa</h3>
            <p className="text-xs text-purple-300/80">Ajustes y controles del juego</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="p-2 text-purple-300 hover:text-white rounded-full hover:bg-purple-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Sliders */}
        <div className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between text-xs text-purple-200 mb-1 font-semibold">
              <span>Música de Fondo</span>
              <span className="font-mono">{Math.round(musicVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMusicVol(val);
                sound.setMusicVolume(val);
              }}
              className="w-full accent-purple-500 bg-purple-950 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-purple-200 mb-1 font-semibold">
              <span>Efectos de Sonido</span>
              <span className="font-mono">{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSfxVol(val);
                sound.setSfxVolume(val);
                sound.playClick();
              }}
              className="w-full accent-pink-500 bg-purple-950 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Bloom / Glow Tweak Controls */}
        <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resplandor Mágico (Bloom de Portales)</span>
            </div>
            <button
              onClick={() => setShowBloomTweaks(!showBloomTweaks)}
              className="text-[11px] text-purple-300 hover:text-white underline font-semibold"
            >
              {showBloomTweaks ? 'Ocultar' : 'Ajustar'}
            </button>
          </div>

          {showBloomTweaks && onUpdateBloomConfig && (
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-purple-200 mb-1">
                  <span>Intensidad Base:</span>
                  <span className="font-mono">{baseIntensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={baseIntensity}
                  onChange={(e) => {
                    onUpdateBloomConfig({
                      ...bloomConfig,
                      baseIntensity: parseFloat(e.target.value)
                    });
                  }}
                  className="w-full accent-yellow-400 bg-purple-950 h-1.5 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-purple-200 mb-1">
                  <span>Brillo al acercarse al portal:</span>
                  <span className="font-mono">{maxIntensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  value={maxIntensity}
                  onChange={(e) => {
                    onUpdateBloomConfig({
                      ...bloomConfig,
                      maxIntensity: parseFloat(e.target.value)
                    });
                  }}
                  className="w-full accent-pink-400 bg-purple-950 h-1.5 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-purple-200 mb-1">
                  <span>Umbral de Luminiscencia:</span>
                  <span className="font-mono">{baseThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.01"
                  value={baseThreshold}
                  onChange={(e) => {
                    onUpdateBloomConfig({
                      ...bloomConfig,
                      baseThreshold: parseFloat(e.target.value)
                    });
                  }}
                  className="w-full accent-sky-400 bg-purple-950 h-1.5 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls Cheatsheet */}
        <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/50 space-y-1.5 text-xs text-purple-200">
          <div className="font-bold text-yellow-300 text-[11px] uppercase tracking-wider mb-1">
            Guía de Controles
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">WASD / Flechas:</span>
            <span>Mover a Mari</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">Shift Izquierdo:</span>
            <span>Correr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">Espacio:</span>
            <span>Saltar</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">E / Clic:</span>
            <span>Interactuar / Abrir puerta</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-white shadow-lg transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Reanudar Partida</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReturnToHub();
            }}
            className="w-full py-2.5 rounded-2xl bg-purple-900/60 hover:bg-purple-800/70 border border-purple-600/40 text-purple-100 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-purple-300" />
            <span>Volver a la Plaza de las Siete Puertas</span>
          </button>

          {!confirmReset ? (
            <button
              onClick={() => {
                sound.playClick();
                setConfirmReset(true);
              }}
              className="w-full py-2 rounded-xl text-red-400 hover:text-red-300 text-xs font-medium transition"
            >
              Reiniciar Progreso de Partida
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition"
              >
                Confirmar Reinicio
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-purple-900 text-xs font-bold text-purple-200 transition"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
