import React from 'react';
import { WorldId, StarInfo, Mission, CharacterCustomization } from '../types/game';
import { STAR_LIST, WORLD_MISSIONS } from '../game/constants';
import { sound } from '../audio/soundEngine';
import { Volume2, VolumeX, Menu, Sparkles, Backpack, User, Compass, HelpCircle } from 'lucide-react';

interface HUDProps {
  currentWorld: WorldId;
  collectedStars: Record<number, boolean>;
  customization: CharacterCustomization;
  nearInteractiveName: string | null;
  onOpenInventory: () => void;
  onOpenCustomizer: () => void;
  onOpenMissions: () => void;
  onOpenPause: () => void;
  onToggleDance: () => void;
  isDancing: boolean;
  onTriggerInteraction: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentWorld,
  collectedStars,
  customization,
  nearInteractiveName,
  onOpenInventory,
  onOpenCustomizer,
  onOpenMissions,
  onOpenPause,
  onToggleDance,
  isDancing,
  onTriggerInteraction
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());
  const [showHint, setShowHint] = React.useState(false);

  const starCount = Object.values(collectedStars).filter(Boolean).length;
  const activeMissions = WORLD_MISSIONS[currentWorld] || [];
  const currentMission = activeMissions.find((m) => !m.completed) || activeMissions[0];

  const handleToggleSound = () => {
    sound.playClick();
    const nextMuted = !isMuted;
    sound.setMute(nextMuted);
    setIsMuted(nextMuted);
  };

  const getWorldName = () => {
    switch (currentWorld) {
      case 'hub': return 'Plaza de las Siete Puertas';
      case 'rm': return 'La Biblioteca Encantada (RM)';
      case 'jin': return 'El Reino de los Sabores (Jin)';
      case 'suga': return 'El Estudio de las Melodías (SUGA)';
      case 'jhope': return 'La Ciudad del Baile (j-hope)';
      case 'jimin': return 'El Jardín de las Estrellas (Jimin)';
      case 'v': return 'La Galería de los Sueños (V)';
      case 'jungkook': return 'La Arena de los Campeones (Jung Kook)';
      case 'concert': return 'El Concierto de las Siete Estrellas';
      default: return 'Universo Púrpura';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4">
        {/* Mari Profile & Stars Tracker */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-[#190c33]/90 border border-purple-500/40 rounded-2xl p-2.5 shadow-lg backdrop-blur-none">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-inner text-base border-2 border-purple-300"
              style={{ backgroundColor: customization.shirtColor }}
            >
              {customization.shirtLogo}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-purple-100">Mari</span>
                <span className="text-[10px] font-semibold bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-400/30">
                  ARMY
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-purple-300/90 font-medium">Estrellas:</span>
                <span className="text-xs font-bold font-mono text-yellow-300 tabular-nums">
                  {starCount} / 7
                </span>
              </div>
            </div>
          </div>

          {/* 7 Member Star Icons Cluster */}
          <div className="flex items-center gap-1 bg-[#190c33]/80 border border-purple-600/30 rounded-xl p-1.5 shadow-md">
            {STAR_LIST.map((star) => {
              const collected = collectedStars[star.id];
              return (
                <div
                  key={star.id}
                  title={`${star.name} (${star.member}) - ${collected ? 'Recuperada' : 'Sellada'}`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                    collected
                      ? 'bg-purple-600/60 border border-yellow-300/80 shadow-sm shadow-yellow-400/40 scale-105'
                      : 'bg-purple-950/60 border border-purple-800/40 opacity-40 grayscale'
                  }`}
                >
                  <span>{star.symbol}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Right: World Badge & Controls */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#190c33]/90 border border-purple-500/40 rounded-2xl px-3.5 py-2 shadow-lg">
              <Compass className="w-4 h-4 text-purple-400" />
              <span className="text-xs md:text-sm font-semibold text-purple-100">{getWorldName()}</span>
            </div>

            <button
              onClick={handleToggleSound}
              className="w-10 h-10 rounded-2xl bg-[#190c33]/90 border border-purple-500/40 flex items-center justify-center text-purple-300 hover:text-white hover:bg-purple-800/50 transition shadow-lg"
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenPause();
              }}
              className="w-10 h-10 rounded-2xl bg-[#190c33]/90 border border-purple-500/40 flex items-center justify-center text-purple-300 hover:text-white hover:bg-purple-800/50 transition shadow-lg"
              title="Menú y Pausa"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Current Mission Pill */}
          {currentMission && (
            <div className="bg-[#190c33]/90 border border-purple-500/40 rounded-2xl p-2.5 max-w-xs text-right shadow-lg">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-yellow-300">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{currentMission.name}</span>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-purple-400 hover:text-white ml-1"
                  title="Ver pista"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-purple-200/90 mt-0.5 line-clamp-2">
                {currentMission.objective}
              </p>
              {showHint && (
                <div className="mt-1.5 text-[10px] text-sky-300 bg-purple-950/80 p-1.5 rounded-lg border border-purple-700/50 text-left">
                  💡 <span className="font-semibold">Pista:</span> {currentMission.hint}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Interactive Prompt when near portal/item */}
      {nearInteractiveName && (
        <div className="pointer-events-auto self-center mb-6">
          <button
            onClick={() => {
              sound.playClick();
              onTriggerInteraction();
            }}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border border-yellow-300/80 text-white font-bold shadow-2xl shadow-purple-900/60 active:scale-95 transition-transform"
          >
            <span className="px-2 py-0.5 rounded-lg bg-black/40 text-xs font-mono border border-white/30 hidden sm:inline">
              E
            </span>
            <span className="text-sm md:text-base">Interactuar con {nearInteractiveName}</span>
          </button>
        </div>
      )}

      {/* Bottom Unified Control Dock */}
      <div className="pointer-events-auto self-center flex items-center gap-2 bg-[#190c33]/90 border border-purple-500/50 rounded-2xl p-1.5 shadow-2xl">
        <button
          onClick={() => {
            sound.playClick();
            onOpenInventory();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-800/40 text-xs font-semibold transition"
          title="Inventario (I)"
        >
          <Backpack className="w-4 h-4 text-pink-400" />
          <span className="hidden sm:inline">Inventario</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenMissions();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-800/40 text-xs font-semibold transition"
          title="Diario de Misiones (M)"
        >
          <Compass className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Misiones</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenCustomizer();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-800/40 text-xs font-semibold transition"
          title="Personalizar a Mari (C)"
        >
          <User className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Estilo</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onToggleDance();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            isDancing
              ? 'bg-pink-600 text-white'
              : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
          }`}
          title="Bailar coreografía (B)"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{isDancing ? 'Detener Baile' : 'Bailar'}</span>
        </button>
      </div>
    </div>
  );
};
