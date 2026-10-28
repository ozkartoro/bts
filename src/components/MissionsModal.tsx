import React, { useState } from 'react';
import { WorldId } from '../types/game';
import { WORLD_MISSIONS, STAR_LIST } from '../game/constants';
import { sound } from '../audio/soundEngine';
import { X, CheckCircle, Circle, Sparkles, BookOpen } from 'lucide-react';

interface MissionsModalProps {
  completedMissions: Record<string, boolean>;
  onClose: () => void;
  onFastTravel?: (worldId: WorldId) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  completedMissions,
  onClose,
  onFastTravel
}) => {
  const [selectedWorld, setSelectedWorld] = useState<WorldId>('rm');

  const worlds: { id: WorldId; name: string; member: string; icon: string }[] = [
    { id: 'rm', name: 'La Biblioteca Encantada', member: 'RM', icon: '📖' },
    { id: 'jin', name: 'El Reino de los Sabores', member: 'Jin', icon: '🍓' },
    { id: 'suga', name: 'El Estudio de las Melodías', member: 'SUGA', icon: '🎹' },
    { id: 'jhope', name: 'La Ciudad del Baile', member: 'j-hope', icon: '✨' },
    { id: 'jimin', name: 'El Jardín de las Estrellas', member: 'Jimin', icon: '🌸' },
    { id: 'v', name: 'La Galería de los Sueños', member: 'V', icon: '🎨' },
    { id: 'jungkook', name: 'La Arena de los Campeones', member: 'Jung Kook', icon: '⚡' },
    { id: 'concert', name: 'El Concierto Final', member: 'BTS & ARMY', icon: '💜' }
  ];

  const currentWorldMissions = WORLD_MISSIONS[selectedWorld] || [];
  const totalCompleted = Object.values(completedMissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75">
      <div className="w-full max-w-2xl bg-[#190c33] border-2 border-purple-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
          <div>
            <h3 className="font-bold text-lg text-purple-100">Diario de Misiones de Mari</h3>
            <p className="text-xs text-purple-300/80">
              Progreso global: {totalCompleted} de 21 desafíos completados
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-purple-300 hover:text-white rounded-full hover:bg-purple-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worlds Selector */}
        <div className="flex items-center gap-2 py-3 border-b border-purple-800/40 overflow-x-auto">
          {worlds.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                sound.playClick();
                setSelectedWorld(w.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedWorld === w.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/50 text-purple-300 hover:bg-purple-900/50'
              }`}
            >
              <span>{w.icon}</span>
              <span>{w.member}</span>
            </button>
          ))}
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {currentWorldMissions.map((mission, idx) => {
            const isDone = completedMissions[mission.id];
            return (
              <div
                key={mission.id}
                className={`p-4 rounded-2xl border transition ${
                  isDone
                    ? 'bg-purple-950/30 border-emerald-500/40'
                    : 'bg-purple-950/60 border-purple-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-yellow-300">
                          {idx + 1}. {mission.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-600/40">
                          {mission.mechanic}
                        </span>
                      </div>
                      <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                        {mission.objective}
                      </p>
                      <div className="mt-2 text-[11px] text-sky-300 bg-purple-900/30 p-2 rounded-xl border border-purple-800/40">
                        💡 <span className="font-semibold">Pista:</span> {mission.hint}
                      </div>
                    </div>
                  </div>
                  {isDone && (
                    <span className="text-xs font-bold text-emerald-400 shrink-0">
                      ¡Completada!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-purple-800/60 flex items-center justify-between">
          {onFastTravel ? (
            <button
              onClick={() => {
                sound.playClick();
                onFastTravel(selectedWorld);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-xs text-white shadow-md transition flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>Ir a {worlds.find((w) => w.id === selectedWorld)?.name}</span>
            </button>
          ) : <div />}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-purple-800/80 hover:bg-purple-700 font-bold text-xs text-white transition"
          >
            Cerrar Diario
          </button>
        </div>
      </div>
    </div>
  );
};
