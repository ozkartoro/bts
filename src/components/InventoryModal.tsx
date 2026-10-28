import React, { useState } from 'react';
import { InventoryItem, StarInfo } from '../types/game';
import { STAR_LIST } from '../game/constants';
import { sound } from '../audio/soundEngine';
import { X, Sparkles, Eye, CheckCircle2 } from 'lucide-react';

interface InventoryModalProps {
  items: InventoryItem[];
  collectedStars: Record<number, boolean>;
  onClose: () => void;
  onUseItem?: (item: InventoryItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  items,
  collectedStars,
  onClose,
  onUseItem
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(items[0] || null);

  const categories = ['Todos', 'Objetos de misión', 'Estrellas', 'Coleccionables'];

  // Add collected stars as virtual inventory items
  const starItems: InventoryItem[] = STAR_LIST.filter((s) => collectedStars[s.id]).map((s) => ({
    id: `star_${s.id}`,
    name: `${s.name} (${s.member})`,
    category: 'Estrellas',
    description: s.description,
    icon: s.symbol
  }));

  const allDisplayItems = [...items, ...starItems];

  const filteredItems = activeCategory === 'Todos'
    ? allDisplayItems
    : allDisplayItems.filter((i) => i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="w-full max-w-2xl bg-[#190c33] border-2 border-purple-500/50 rounded-3xl p-6 text-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
          <div>
            <h3 className="font-bold text-lg text-purple-100">Mochila ARMY de Mari</h3>
            <p className="text-xs text-purple-300/80">
              Reliquias, estrellas e instrumentos recuperados ({allDisplayItems.length} objetos)
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

        {/* Category Tabs */}
        <div className="flex items-center gap-2 py-3 border-b border-purple-800/40 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/50 text-purple-300 hover:bg-purple-900/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Grid and Detail Pane */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 overflow-y-auto">
          {/* Items Grid */}
          <div className="grid grid-cols-3 gap-2.5 content-start">
            {filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedItem(item);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition ${
                    isSelected
                      ? 'border-yellow-300 bg-purple-700/60 text-white shadow-md scale-95'
                      : 'border-purple-800/40 bg-purple-950/40 text-purple-200 hover:bg-purple-900/40'
                  }`}
                >
                  <span className="text-3xl mb-1.5">{item.icon}</span>
                  <span className="text-[11px] font-medium leading-tight line-clamp-2">
                    {item.name}
                  </span>
                </button>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="col-span-3 text-center py-8 text-purple-400 text-xs">
                No hay objetos en esta categoría.
              </div>
            )}
          </div>

          {/* Selected Item Detail */}
          <div className="bg-purple-950/60 border border-purple-700/40 rounded-2xl p-4 flex flex-col justify-between">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-900/80 border border-purple-500/50 flex items-center justify-center text-3xl shadow-inner">
                    {selectedItem.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-yellow-300">{selectedItem.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                      {selectedItem.category}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-800/40">
                  <p className="text-xs text-purple-200 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-purple-400 text-xs">
                Selecciona un objeto para examinarlo.
              </div>
            )}

            {selectedItem && (
              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => {
                    sound.playCollect();
                    if (onUseItem) onUseItem(selectedItem);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Examinar Esencia</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-purple-800/60 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-purple-800/80 hover:bg-purple-700 font-bold text-xs text-white transition"
          >
            Cerrar Mochila
          </button>
        </div>
      </div>
    </div>
  );
};
