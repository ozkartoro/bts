import React, { useState, useEffect } from 'react';
import { WorldInteractivePoint } from '../game/three/worldBuilder';
import { sound } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  ChefHat,
  Award,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface MinigameOverlayProps {
  interactive: WorldInteractivePoint;
  onClose: () => void;
  onSolvePuzzle: (starId: number, missionIds: string[], rewardItemName: string, rewardItemIcon: string) => void;
}

export const MinigameOverlay: React.FC<MinigameOverlayProps> = ({
  interactive,
  onClose,
  onSolvePuzzle
}) => {
  const puzzleType = (interactive.data?.puzzleType as string) || '';

  // RM Puzzle: Symbol Sequence
  const [rmSequence, setRmSequence] = useState<number[]>([]);
  const rmTarget = [0, 1, 2, 3]; // Libro -> Brújula -> Pluma -> Corazón

  // Jin Puzzle: Cooking
  const [cookingStep, setCookingStep] = useState<number>(0);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [potStirs, setPotStirs] = useState<number>(0);

  // SUGA Puzzle: Simon Melodic Memory
  const sugaSimonSequence = [0, 2, 1, 3]; // Do, Sol, Mi, La
  const [sugaPlayerSequence, setSugaPlayerSequence] = useState<number[]>([]);
  const [sugaFeedback, setSugaFeedback] = useState<string>('Toca las notas iluminadas en orden (Do ➔ Sol ➔ Mi ➔ La)');
  const [sugaActiveHighlight, setSugaActiveHighlight] = useState<number | null>(null);

  // j-hope Puzzle: Rhythm Dance
  const [danceHits, setDanceHits] = useState<number>(0);
  const [currentArrow, setCurrentArrow] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');

  // Jimin Puzzle: Constellation Prisms
  const [prismAngles, setPrismAngles] = useState<number[]>([90, 135, 90]);

  // V Puzzle: Art Tile Assembly (0: 🌙, 1: 💜, 2: 🌌, 3: ⭐)
  const [artTiles, setArtTiles] = useState<number[]>([2, 0, 3, 1]);

  // Jung Kook Puzzle: Target Shooting
  const [jkHits, setJkHits] = useState<number>(0);

  // BTS Plaza Minigame: Fanchant & Trivia
  const [armyMode, setArmyMode] = useState<'fanchant' | 'trivia'>('fanchant');
  const [fanchantStep, setFanchantStep] = useState<number>(0);
  const fanchantMembers = [
    { name: 'Kim Namjoon', role: 'RM', color: 'from-blue-500 to-indigo-600' },
    { name: 'Kim Seokjin', role: 'Jin', color: 'from-pink-500 to-rose-600' },
    { name: 'Min Yoongi', role: 'SUGA', color: 'from-amber-500 to-orange-600' },
    { name: 'Jung Hoseok', role: 'j-hope', color: 'from-emerald-500 to-teal-600' },
    { name: 'Park Jimin', role: 'Jimin', color: 'from-yellow-400 to-amber-500' },
    { name: 'Kim Taehyung', role: 'V', color: 'from-purple-500 to-violet-600' },
    { name: 'Jeon Jungkook', role: 'Jung Kook', color: 'from-red-500 to-rose-700' },
    { name: '¡BTS!', role: 'Bangtan Sonyeondan', color: 'from-purple-600 to-pink-600' }
  ];

  const [triviaIndex, setTriviaIndex] = useState<number>(0);
  const [triviaScore, setTriviaScore] = useState<number>(0);
  const [triviaFeedback, setTriviaFeedback] = useState<string | null>(null);

  const btsTriviaQuestions = [
    {
      q: '¿Qué significa la célebre frase "Borahae" (I Purple You) acuñada por V?',
      options: [
        'Confiaré en ti y te amaré por mucho tiempo',
        'La música de BTS iluminará el mundo',
        'El cielo nocturno siempre es púrpura'
      ],
      correct: 0,
      lore: 'V lo explicó durante un Muster: "El morado es el último color del arcoíris, significa confiar y amar hasta el final".'
    },
    {
      q: '¿En qué histórica fecha debutó BTS con "No More Dream"?',
      options: ['13 de junio de 2013', '9 de julio de 2013', '1 de septiembre de 2014'],
      correct: 0,
      lore: '¡El 13 de junio de 2013 comenzó la leyenda de Bangtan!'
    },
    {
      q: '¿Cuál es el significado original de las siglas ARMY?',
      options: [
        'Adorable Representative M.C. for Youth',
        'All Real Music for You',
        'Amazing Radiant Musical Youth'
      ],
      correct: 0,
      lore: 'ARMY significa "Adorable Representative M.C. for Youth" y simboliza la fuerza que protege a la juventud.'
    },
    {
      q: '¿Cuál fue la canción de BTS que alcanzó el #1 en el Billboard Hot 100 por primera vez?',
      options: ['Dynamite', 'DNA', 'Blood Sweat & Tears'],
      correct: 0,
      lore: '¡Dynamite hizo historia en 2020 debutando directamente en la cima del Hot 100!'
    }
  ];

  // Keyboard navigation for j-hope dance minigame
  useEffect(() => {
    if (puzzleType !== 'jhope_dance') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let pressedDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') pressedDir = 'UP';
      if (e.code === 'ArrowDown' || e.code === 'KeyS') pressedDir = 'DOWN';
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') pressedDir = 'LEFT';
      if (e.code === 'ArrowRight' || e.code === 'KeyD') pressedDir = 'RIGHT';

      if (pressedDir === currentArrow) {
        handleDanceHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [puzzleType, currentArrow, danceHits]);

  const handleDanceHit = () => {
    sound.playClick();
    const nextHits = danceHits + 1;
    setDanceHits(nextHits);

    if (nextHits >= 5) {
      handleSuccess(
        4,
        ['jhope_1', 'jhope_2', 'jhope_3'],
        'Pulsera de la Esperanza de Hobi',
        '✨'
      );
    } else {
      const dirs: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
      setCurrentArrow(nextDir);
    }
  };

  const handleSuccess = (starId: number, missions: string[], itemName: string, itemIcon: string) => {
    sound.playStarFanfare();
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 }
    });
    onSolvePuzzle(starId, missions, itemName, itemIcon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-[#180f2d] border-2 border-purple-500/70 rounded-3xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 flex items-center justify-center border border-purple-400/40 text-purple-300">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-purple-100">{interactive.name}</h3>
              <p className="text-xs text-purple-300/80">Jugabilidad accesible · Aventura ARMY</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-purple-300 hover:text-white rounded-full hover:bg-purple-800/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on puzzle */}
        <div className="py-5">
          {/* 1. RM: Puerta del Conocimiento */}
          {puzzleType === 'rm_symbols' && (
            <div className="space-y-4 text-center">
              {/* Visual sequence guide bar */}
              <div className="p-3 bg-purple-950/70 border border-purple-700/60 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold mb-2 block">
                  Orden de Sabiduría:
                </span>
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  {[
                    { id: 0, label: '1. Libro 📖' },
                    { id: 1, label: '2. Brújula 🧭' },
                    { id: 2, label: '3. Pluma ✒️' },
                    { id: 3, label: '4. Corazón 💜' }
                  ].map((step, idx) => {
                    const isPassed = rmSequence.length > idx;
                    const isCurrent = rmSequence.length === idx;
                    return (
                      <span
                        key={step.id}
                        className={`px-2 py-1 rounded-lg border transition ${
                          isPassed
                            ? 'bg-emerald-600/50 border-emerald-400 text-white'
                            : isCurrent
                            ? 'bg-purple-600 border-yellow-300 text-yellow-200 animate-pulse'
                            : 'bg-purple-900/30 border-purple-800/50 text-purple-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Runic Choice Buttons */}
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { id: 0, label: 'Libro', icon: '📖' },
                  { id: 1, label: 'Brújula', icon: '🧭' },
                  { id: 2, label: 'Pluma', icon: '✒️' },
                  { id: 3, label: 'Corazón', icon: '💜' }
                ].map((sym) => {
                  const isSelected = rmSequence.includes(sym.id);
                  const orderIdx = rmSequence.indexOf(sym.id);
                  const isNextExpected = rmTarget[rmSequence.length] === sym.id;

                  return (
                    <button
                      key={sym.id}
                      onClick={() => {
                        sound.playClick();
                        if (isSelected) return;
                        const next = [...rmSequence, sym.id];
                        setRmSequence(next);
                        if (next.length === 4) {
                          if (next.every((v, i) => v === rmTarget[i])) {
                            handleSuccess(1, ['rm_1', 'rm_2', 'rm_3'], 'Tomo Arcano de RM', '📖');
                          } else {
                            setTimeout(() => setRmSequence([]), 800);
                          }
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center h-24 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-blue-600/40 border-blue-400 text-white scale-95'
                          : isNextExpected
                          ? 'bg-purple-800/80 border-yellow-400/90 shadow-md shadow-yellow-500/20'
                          : 'bg-purple-900/30 border-purple-500/40 hover:bg-purple-800/50'
                      }`}
                    >
                      <span className="text-3xl mb-1">{sym.icon}</span>
                      <span className="text-xs font-medium">{sym.label}</span>
                      {isSelected && (
                        <span className="absolute top-1 right-2 text-xs font-bold text-sky-300">
                          #{orderIdx + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Helper Bar */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    // Auto-hint: fill next correct rune
                    const nextRune = rmTarget[rmSequence.length];
                    if (nextRune !== undefined) {
                      const next = [...rmSequence, nextRune];
                      setRmSequence(next);
                      if (next.length === 4) {
                        handleSuccess(1, ['rm_1', 'rm_2', 'rm_3'], 'Tomo Arcano de RM', '📖');
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-sky-200 bg-sky-950/40 px-3 py-1.5 rounded-xl border border-sky-800/40"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Pista mágica de RM</span>
                </button>

                {rmSequence.length > 0 && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setRmSequence(rmSequence.slice(0, -1));
                    }}
                    className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Deshacer último</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Jin: Cocina */}
          {puzzleType === 'jin_cooking' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center gap-2 mb-1">
                {['1. Ingredientes', '2. Cocinar', '3. Servir'].map((s, idx) => (
                  <span
                    key={s}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cookingStep === idx
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-purple-900/40 text-purple-400'
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {cookingStep === 0 && (
                <div className="space-y-3">
                  <p className="text-xs md:text-sm text-pink-200">
                    Toca los 3 ingredientes para agregarlos al caldero mágico de Jin:
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'fresas', name: 'Fresas Mágicas', icon: '🍓' },
                      { id: 'especias', name: 'Especias Dulces', icon: '✨' },
                      { id: 'arroz', name: 'Arroz Dorado', icon: '🍚' }
                    ].map((item) => {
                      const picked = selectedIngredients.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            sound.playClick();
                            const next = picked
                              ? selectedIngredients.filter((i) => i !== item.id)
                              : [...selectedIngredients, item.id];
                            setSelectedIngredients(next);
                            if (next.length === 3) {
                              setTimeout(() => setCookingStep(1), 400);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border flex flex-col items-center transition ${
                            picked
                              ? 'bg-pink-600/50 border-pink-400 text-white shadow-md'
                              : 'bg-purple-900/40 border-purple-700/50 hover:bg-purple-800/40'
                          }`}
                        >
                          <span className="text-3xl mb-1">{item.icon}</span>
                          <span className="text-xs font-medium">{item.name}</span>
                          {picked && <span className="text-[10px] text-pink-300 font-bold mt-1">✔ Agregado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {cookingStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs md:text-sm text-pink-200">
                    ¡Revuelve el caldero para integrar los sabores con la receta Worldwide Handsome!
                  </p>
                  <div className="w-full bg-purple-950 rounded-full h-3 border border-purple-700/50 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${(potStirs / 3) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        sound.playClick();
                        const next = potStirs + 1;
                        setPotStirs(next);
                        if (next >= 3) {
                          setCookingStep(2);
                        }
                      }}
                      className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 active:scale-95 border-4 border-yellow-300 shadow-xl flex flex-col items-center justify-center transition"
                    >
                      <ChefHat className="w-7 h-7 text-white mb-0.5" />
                      <span className="text-xs font-extrabold text-white">Revolver ({potStirs}/3)</span>
                    </button>
                  </div>
                </div>
              )}

              {cookingStep === 2 && (
                <div className="space-y-3">
                  <p className="text-xs md:text-sm text-pink-200">
                    ¡Plato gourmet listo! Presenta el banquete ante los pedestales:
                  </p>
                  <button
                    onClick={() => {
                      handleSuccess(2, ['jin_1', 'jin_2', 'jin_3'], 'Banquete Estelar de Jin', '🍲');
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-extrabold text-white shadow-xl transition active:scale-95 text-sm"
                  >
                    💖 Servir Banquete Mágico de Jin
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. SUGA: Sintetizador */}
          {puzzleType === 'suga_synth' && (
            <div className="space-y-4 text-center">
              <p className="text-xs md:text-sm text-amber-200">{sugaFeedback}</p>

              {/* Progress Tracker */}
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-7 h-2 rounded-full transition-all ${
                      sugaPlayerSequence.length > step
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : 'bg-purple-950 border border-purple-800'
                    }`}
                  />
                ))}
              </div>

              {/* 4 Synth Pads with clear note names */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 0, freq: 523.25, col: 'bg-red-500', name: '1. Do (C)' },
                  { id: 1, freq: 659.25, col: 'bg-blue-500', name: '3. Mi (E)' },
                  { id: 2, freq: 783.99, col: 'bg-emerald-500', name: '2. Sol (G)' },
                  { id: 3, freq: 880.0, col: 'bg-amber-500', name: '4. La (A)' }
                ].map((pad) => {
                  const isHighlighted = sugaActiveHighlight === pad.id;
                  return (
                    <button
                      key={pad.id}
                      onClick={() => {
                        sound.playMusicalNote(pad.freq, 0.4);
                        const next = [...sugaPlayerSequence, pad.id];
                        setSugaPlayerSequence(next);

                        if (next[next.length - 1] !== sugaSimonSequence[next.length - 1]) {
                          setSugaFeedback('¡Casi! Escucha la melodía de nuevo');
                          setSugaPlayerSequence([]);
                          return;
                        }

                        if (next.length === sugaSimonSequence.length) {
                          setSugaFeedback('¡Acorde perfecto grabado por Min PD!');
                          setTimeout(() => {
                            handleSuccess(3, ['suga_1', 'suga_2', 'suga_3'], 'Partitura de Agust D', '🎹');
                          }, 500);
                        } else {
                          setSugaFeedback(`¡Excelente! Nota ${next.length} de 4`);
                        }
                      }}
                      className={`h-20 rounded-2xl ${pad.col} text-white font-bold flex flex-col items-center justify-center hover:opacity-90 active:scale-95 shadow-lg border-2 transition ${
                        isHighlighted ? 'border-white scale-105 shadow-2xl animate-pulse' : 'border-white/20'
                      }`}
                    >
                      <span className="text-sm">{pad.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Guide Playback Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  // Play sequence and highlight pads in real-time
                  const seq = [
                    { id: 0, f: 523.25 },
                    { id: 2, f: 783.99 },
                    { id: 1, f: 659.25 },
                    { id: 3, f: 880.0 }
                  ];
                  seq.forEach((item, idx) => {
                    setTimeout(() => {
                      sound.playMusicalNote(item.f, 0.35);
                      setSugaActiveHighlight(item.id);
                    }, idx * 450);
                    setTimeout(() => {
                      setSugaActiveHighlight(null);
                    }, idx * 450 + 350);
                  });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-semibold hover:bg-amber-500/50 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Escuchar y Ver Guía de Melodía</span>
              </button>
            </div>
          )}

          {/* 4. j-hope: Baile Rítmico */}
          {puzzleType === 'jhope_dance' && (
            <div className="space-y-4 text-center">
              <p className="text-xs md:text-sm text-emerald-200 font-semibold">
                ¡Sigue la flecha! Usa las teclas o pulsa el botón correspondiente ({danceHits}/5):
              </p>

              {/* Current Active Arrow */}
              <div className="py-2 flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 border-2 border-white/80 animate-bounce">
                  {currentArrow === 'UP' && <ArrowUp className="w-10 h-10" />}
                  {currentArrow === 'DOWN' && <ArrowDown className="w-10 h-10" />}
                  {currentArrow === 'LEFT' && <ArrowLeft className="w-10 h-10" />}
                  {currentArrow === 'RIGHT' && <ArrowRight className="w-10 h-10" />}
                </div>
              </div>

              {/* Big Tap Targets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { dir: 'LEFT' as const, label: '←', icon: <ArrowLeft className="w-6 h-6" /> },
                  { dir: 'UP' as const, label: '↑', icon: <ArrowUp className="w-6 h-6" /> },
                  { dir: 'DOWN' as const, label: '↓', icon: <ArrowDown className="w-6 h-6" /> },
                  { dir: 'RIGHT' as const, label: '→', icon: <ArrowRight className="w-6 h-6" /> }
                ].map((item) => (
                  <button
                    key={item.dir}
                    onClick={() => {
                      if (item.dir === currentArrow) {
                        handleDanceHit();
                      } else {
                        sound.playClick();
                      }
                    }}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center text-white active:scale-95 transition ${
                      item.dir === currentArrow
                        ? 'bg-emerald-600/80 border-yellow-300 shadow-md shadow-emerald-500/40'
                        : 'bg-purple-900/60 border-purple-500/50 hover:bg-purple-800/60'
                    }`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-purple-300">
                Tip: También puedes presionar las flechas de tu teclado ⌨️
              </p>
            </div>
          )}

          {/* 5. Jimin: Prismas de Luz */}
          {puzzleType === 'jimin_garden' && (
            <div className="space-y-4 text-center">
              <p className="text-xs md:text-sm text-rose-200">
                Toca cada prisma para orientarlo hacia el centro (180°):
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {prismAngles.map((angle, idx) => {
                  const isAligned = angle === 180;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playClick();
                        const nextAngles = [...prismAngles];
                        nextAngles[idx] = (nextAngles[idx] + 45) % 360;
                        setPrismAngles(nextAngles);

                        if (nextAngles.every((a) => a === 180)) {
                          handleSuccess(5, ['jimin_1', 'jimin_2', 'jimin_3'], 'Prisma de Cristal de Jimin', '🌸');
                        }
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center transition ${
                        isAligned
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-md'
                          : 'bg-purple-900/40 border-rose-400/50 hover:bg-rose-900/40'
                      }`}
                    >
                      <span className="text-xs text-rose-300 mb-1">Prisma #{idx + 1}</span>
                      <div
                        className="w-12 h-12 rounded-full border-2 border-rose-400 flex items-center justify-center text-rose-200 text-xs font-bold transition-transform"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        ▲
                      </div>
                      <span className="text-xs mt-1 font-mono font-bold">
                        {isAligned ? '✔ 180°' : `${angle}°`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Auto align assist */}
              <button
                onClick={() => {
                  sound.playClick();
                  setPrismAngles([180, 180, 180]);
                  handleSuccess(5, ['jimin_1', 'jimin_2', 'jimin_3'], 'Prisma de Cristal de Jimin', '🌸');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Armonizar automáticamente con Serendipity</span>
              </button>
            </div>
          )}

          {/* 6. V: Rompecabezas Artístico */}
          {puzzleType === 'v_art' && (
            <div className="space-y-4 text-center">
              <p className="text-xs md:text-sm text-purple-200">
                Ordena los 4 fragmentos del cuadro tocándolos para intercambiarlos:
              </p>

              {/* Reference Preview for Easy Playability */}
              <div className="p-2 bg-purple-950/60 border border-purple-700/50 rounded-2xl inline-flex items-center gap-2 text-xs text-purple-300">
                <span className="font-semibold text-yellow-300">Obra Guía:</span>
                <span>1. 🌙 Luna</span>
                <span>➔ 2. 💜 Amor</span>
                <span>➔ 3. 🌌 Galaxia</span>
                <span>➔ 4. ⭐ Estrella</span>
              </div>

              {/* Puzzle Tiles */}
              <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
                {artTiles.map((tileVal, idx) => {
                  const isCorrectSpot = tileVal === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playClick();
                        const next = [...artTiles];
                        const swapIdx = (idx + 1) % 4;
                        const temp = next[idx];
                        next[idx] = next[swapIdx];
                        next[swapIdx] = temp;
                        setArtTiles(next);

                        if (next.every((v, i) => v === i)) {
                          handleSuccess(6, ['v_1', 'v_2', 'v_3'], 'Lienzo de Ensueño de V', '🎨');
                        }
                      }}
                      className={`h-20 rounded-2xl border flex flex-col items-center justify-center font-bold text-white transition active:scale-95 ${
                        isCorrectSpot
                          ? 'bg-purple-600/70 border-emerald-400 shadow-md'
                          : 'bg-purple-900/40 border-purple-700/50 hover:bg-purple-800/40'
                      }`}
                    >
                      <span className="text-2xl mb-0.5">{['🌙', '💜', '🌌', '⭐'][tileVal]}</span>
                      <span className="text-[11px]">
                        {isCorrectSpot ? '✔ Correcto' : `Casilla ${idx + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Auto solve option for accessibility */}
              <button
                onClick={() => {
                  sound.playClick();
                  setArtTiles([0, 1, 2, 3]);
                  handleSuccess(6, ['v_1', 'v_2', 'v_3'], 'Lienzo de Ensueño de V', '🎨');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Restaurar pintura con la visión de V</span>
              </button>
            </div>
          )}

          {/* 7. Jung Kook: Dianas de Precisión */}
          {puzzleType === 'jk_arena' && (
            <div className="space-y-4 text-center">
              <p className="text-xs md:text-sm text-red-200">
                ¡Desafío del Golden Maknae! Toca las dianas para acertar los 3 tiros ({jkHits}/3):
              </p>

              {/* 3 distinct visual target buttons */}
              <div className="grid grid-cols-3 gap-3 py-2">
                {[0, 1, 2].map((idx) => {
                  const isHit = jkHits > idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!isHit) {
                          sound.playClick();
                          const next = jkHits + 1;
                          setJkHits(next);
                          if (next >= 3) {
                            handleSuccess(7, ['jungkook_1', 'jungkook_2', 'jungkook_3'], 'Medalla de Oro de Jung Kook', '⚡');
                          }
                        }
                      }}
                      className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                        isHit
                          ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 scale-95'
                          : 'bg-red-600/80 border-yellow-300 hover:scale-105 active:scale-90 text-white shadow-lg shadow-red-500/30 animate-pulse'
                      }`}
                    >
                      {isHit ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 mb-1" />
                          <span className="text-xs font-bold">¡Diana!</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-8 h-8 mb-1 text-yellow-300" />
                          <span className="text-xs font-bold">Tiro #{idx + 1}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-red-300">
                Toca cada diana para disparar la flecha de luz de precisión.
              </p>
            </div>
          )}

          {/* 8. Rincón ARMY: Fanchant & Trivia BTS Minigame */}
          {puzzleType === 'army_fanchant_trivia' && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-purple-950/70 p-1 rounded-2xl border border-purple-700/50">
                <button
                  onClick={() => {
                    sound.playClick();
                    setArmyMode('fanchant');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    armyMode === 'fanchant'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  💜 Ola de Fanchant
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setArmyMode('trivia');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    armyMode === 'trivia'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  ✨ Trivia ARMY
                </button>
              </div>

              {/* Fanchant Minigame */}
              {armyMode === 'fanchant' && (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-purple-200">
                    ¡Entona el cántico sagrado de ARMY! Toca el ARMY Bomb al compás para iluminar a cada integrante:
                  </p>

                  {/* Step indicators */}
                  <div className="flex justify-center gap-1.5 flex-wrap">
                    {fanchantMembers.map((m, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                          i < fanchantStep
                            ? 'bg-purple-600 border-purple-400 text-white font-bold'
                            : i === fanchantStep
                            ? 'bg-pink-600 border-pink-300 text-white animate-pulse font-bold'
                            : 'bg-purple-950/40 border-purple-800 text-purple-400/60'
                        }`}
                      >
                        {m.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>

                  {/* Big Glowing ARMY Bomb Button */}
                  <div className="py-2 flex flex-col items-center justify-center">
                    <button
                      onClick={() => {
                        sound.playClick();
                        const nextStep = fanchantStep + 1;
                        setFanchantStep(nextStep);

                        if (nextStep >= fanchantMembers.length) {
                          handleSuccess(
                            0,
                            ['rm_1'],
                            'Insignia Borahae de ARMY',
                            '💜'
                          );
                        }
                      }}
                      className="group relative w-32 h-32 rounded-full bg-gradient-to-tr from-purple-800 to-pink-600 border-4 border-white/80 shadow-2xl shadow-purple-500/50 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95"
                    >
                      <Sparkles className="w-10 h-10 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
                      <span className="text-xs font-extrabold text-white mt-1 drop-shadow">
                        {fanchantMembers[Math.min(fanchantStep, fanchantMembers.length - 1)].name}
                      </span>
                      <span className="text-[9px] text-purple-200">
                        {fanchantMembers[Math.min(fanchantStep, fanchantMembers.length - 1)].role}
                      </span>
                    </button>
                    <p className="text-[11px] text-purple-300 mt-2">
                      Paso actual ({fanchantStep}/{fanchantMembers.length}) · ¡Toca para cantar!
                    </p>
                  </div>

                  {fanchantStep > 0 && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setFanchantStep(0);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-200 underline"
                    >
                      Reiniciar cántico
                    </button>
                  )}
                </div>
              )}

              {/* Trivia Minigame */}
              {armyMode === 'trivia' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-purple-300">
                    <span>Pregunta {triviaIndex + 1} de {btsTriviaQuestions.length}</span>
                    <span className="font-bold text-yellow-300">Puntaje: {triviaScore} pts</span>
                  </div>

                  {/* Question Card */}
                  <div className="p-3.5 rounded-2xl bg-purple-900/30 border border-purple-700/50">
                    <p className="text-sm font-semibold text-purple-100 mb-3">
                      {btsTriviaQuestions[triviaIndex].q}
                    </p>

                    <div className="space-y-2">
                      {btsTriviaQuestions[triviaIndex].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            sound.playClick();
                            const isCorrect = oIdx === btsTriviaQuestions[triviaIndex].correct;
                            if (isCorrect) {
                              setTriviaScore((s) => s + 10);
                              setTriviaFeedback(`¡Correcto! 💜 ${btsTriviaQuestions[triviaIndex].lore}`);
                            } else {
                              setTriviaFeedback(`Pista: ${btsTriviaQuestions[triviaIndex].lore}`);
                            }
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-800/50 border border-purple-700/40 text-xs text-purple-200 hover:text-white transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {triviaFeedback && (
                    <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-xs text-purple-200">
                      {triviaFeedback}
                    </div>
                  )}

                  <div className="flex justify-between pt-1">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setTriviaFeedback(null);
                        const nextIdx = (triviaIndex + 1) % btsTriviaQuestions.length;
                        setTriviaIndex(nextIdx);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-700/40 hover:bg-purple-600/50 text-purple-200 text-xs font-medium"
                    >
                      Siguiente pregunta ➔
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        handleSuccess(0, ['rm_1'], 'Corona ARMY de Trivia', '👑');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow"
                    >
                      Reclamar premio ARMY
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
