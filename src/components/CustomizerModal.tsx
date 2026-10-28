import React from 'react';
import { CharacterCustomization } from '../types/game';
import { sound } from '../audio/soundEngine';
import { X, Check } from 'lucide-react';

interface CustomizerModalProps {
  customization: CharacterCustomization;
  onUpdateCustomization: (custom: CharacterCustomization) => void;
  onClose: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  customization,
  onUpdateCustomization,
  onClose
}) => {
  const shirtColors = [
    { name: 'Púrpura Borahae', value: '#8B5CF6' },
    { name: 'Rosa Pastel', value: '#EC4899' },
    { name: 'Azul Noche', value: '#2563EB' },
    { name: 'Negro Estilo', value: '#18181B' },
    { name: 'Blanco Puro', value: '#F8FAFC' },
    { name: 'Menta Fresca', value: '#10B981' }
  ];

  const logos: ('ARMY' | 'BTS' | '7' | '💜')[] = ['ARMY', 'BTS', '7', '💜'];

  const hairColors = [
    { name: 'Castaño Natural', value: '#4A2810' },
    { name: 'Negro Azabache', value: '#1A1110' },
    { name: 'Púrpura K-Pop', value: '#9333EA' },
    { name: 'Rubio Dorado', value: '#EAB308' },
    { name: 'Rosa Pastel', value: '#F472B6' },
    { name: 'Plata Cenizo', value: '#94A3B8' }
  ];

  const backpackColors = [
    { name: 'Rosa Neón', value: '#EC4899' },
    { name: 'Púrpura Imperial', value: '#8B5CF6' },
    { name: 'Negro Táctico', value: '#18181B' },
    { name: 'Amarillo Sol', value: '#FBBF24' }
  ];

  const pantsColors = [
    { name: 'Jeans Clásicos', value: '#1E293B' },
    { name: 'Denim Claro', value: '#3B82F6' },
    { name: 'Negro Casual', value: '#0F172A' },
    { name: 'Gris Moderno', value: '#475569' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="w-full max-w-lg bg-[#190c33] border-2 border-purple-500/50 rounded-3xl p-6 text-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
          <div>
            <h3 className="font-bold text-lg text-purple-100">Estilo de Mari</h3>
            <p className="text-xs text-purple-300/80">Personaliza el atuendo de la protagonista</p>
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

        {/* Scrollable Customization Options */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Logo de Camiseta */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-2 uppercase tracking-wider">
              Logo de la Camiseta
            </label>
            <div className="grid grid-cols-4 gap-2">
              {logos.map((logo) => (
                <button
                  key={logo}
                  onClick={() => {
                    sound.playClick();
                    onUpdateCustomization({ ...customization, shirtLogo: logo });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    customization.shirtLogo === logo
                      ? 'bg-purple-600 border-yellow-300 text-white shadow-md'
                      : 'bg-purple-950/60 border-purple-700/50 text-purple-300 hover:bg-purple-800/40'
                  }`}
                >
                  {logo}
                </button>
              ))}
            </div>
          </div>

          {/* Color de Camiseta */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-2 uppercase tracking-wider">
              Color de Camiseta
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shirtColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    sound.playClick();
                    onUpdateCustomization({ ...customization, shirtColor: c.value });
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                    customization.shirtColor === c.value
                      ? 'border-yellow-300 bg-purple-800/60 text-white'
                      : 'border-purple-800/50 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/40 shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-[11px] truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color de Cabello */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-2 uppercase tracking-wider">
              Color de Cabello
            </label>
            <div className="grid grid-cols-3 gap-2">
              {hairColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    sound.playClick();
                    onUpdateCustomization({ ...customization, hairColor: c.value });
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                    customization.hairColor === c.value
                      ? 'border-yellow-300 bg-purple-800/60 text-white'
                      : 'border-purple-800/50 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/40 shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-[11px] truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mochila ARMY */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-2 uppercase tracking-wider">
              Mochila ARMY
            </label>
            <div className="grid grid-cols-2 gap-2">
              {backpackColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    sound.playClick();
                    onUpdateCustomization({ ...customization, backpackColor: c.value });
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                    customization.backpackColor === c.value
                      ? 'border-yellow-300 bg-purple-800/60 text-white'
                      : 'border-purple-800/50 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/40 shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-[11px] truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pantalones */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-2 uppercase tracking-wider">
              Pantalones / Jeans
            </label>
            <div className="grid grid-cols-2 gap-2">
              {pantsColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    sound.playClick();
                    onUpdateCustomization({ ...customization, pantsColor: c.value });
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                    customization.pantsColor === c.value
                      ? 'border-yellow-300 bg-purple-800/60 text-white'
                      : 'border-purple-800/50 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/40 shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-[11px] truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-purple-800/60">
          <button
            onClick={() => {
              sound.playSuccess();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-white shadow-lg hover:from-purple-600 hover:to-pink-600 transition"
          >
            Guardar y Regresar
          </button>
        </div>
      </div>
    </div>
  );
};
