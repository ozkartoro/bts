import React, { useState, useEffect } from 'react';
import { GameProgress, WorldId, CharacterCustomization, InventoryItem } from './types/game';
import { INITIAL_PROGRESS, STAR_LIST, WORLD_MISSIONS } from './game/constants';
import { GameCanvas, BloomTweakProps } from './game/three/GameCanvas';
import { WorldInteractivePoint } from './game/three/worldBuilder';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { CustomizerModal } from './components/CustomizerModal';
import { InventoryModal } from './components/InventoryModal';
import { MissionsModal } from './components/MissionsModal';
import { DialogueModal } from './components/DialogueModal';
import { MinigameOverlay } from './components/MinigameOverlay';
import { PauseModal } from './components/PauseModal';
import { FinalConcertModal } from './components/FinalConcertModal';
import { MobileControls } from './components/MobileControls';
import { sound } from './audio/soundEngine';

const STORAGE_KEY = 'bts_mystery_progress_v1';

export default function App() {
  // Game progress state
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_PROGRESS;
  });

  // App screen state
  const [screen, setScreen] = useState<'title' | 'playing'>('title');

  // Modals state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  // Active interaction / puzzle / dialogue
  const [nearInteractive, setNearInteractive] = useState<WorldInteractivePoint | null>(null);
  const [activeMinigame, setActiveMinigame] = useState<WorldInteractivePoint | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<{
    title: string;
    speaker: string;
    avatarIcon?: string;
    text: string;
    options?: { label: string; action: () => void }[];
  } | null>(null);

  // Animation states
  const [isDancing, setIsDancing] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Mobile virtual inputs
  const [virtualJoystick, setVirtualJoystick] = useState<{ x: number; y: number } | null>(null);
  const [virtualJump, setVirtualJump] = useState(false);
  const [virtualInteract, setVirtualInteract] = useState(false);

  // Tweakable Bloom configuration
  const [bloomConfig, setBloomConfig] = useState<BloomTweakProps>({
    baseIntensity: 1.4,
    maxIntensity: 3.5,
    baseThreshold: 0.22,
    minThreshold: 0.08,
    proximityDistance: 9.5
  });

  // Save progress on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Keyboard shortcut listener for HUD actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return;
      if (e.code === 'KeyI' && !activeMinigame && !activeDialogue) {
        setShowInventory((prev) => !prev);
      } else if (e.code === 'KeyM' && !activeMinigame && !activeDialogue) {
        setShowMissions((prev) => !prev);
      } else if (e.code === 'KeyC' && !activeMinigame && !activeDialogue) {
        setShowCustomizer((prev) => !prev);
      } else if (e.code === 'KeyB' && !activeMinigame && !activeDialogue) {
        setIsDancing((prev) => !prev);
      } else if (e.code === 'Escape') {
        if (activeMinigame) setActiveMinigame(null);
        else if (activeDialogue) setActiveDialogue(null);
        else if (showInventory) setShowInventory(false);
        else if (showMissions) setShowMissions(false);
        else if (showCustomizer) setShowCustomizer(false);
        else setShowPause((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, activeMinigame, activeDialogue, showInventory, showMissions, showCustomizer]);

  // Handle interacting with items / portals / puzzles
  const handleTriggerInteraction = (point: WorldInteractivePoint) => {
    // 1. PORTAL INTERACTIONS
    if (point.type === 'portal') {
      const targetWorldId = (point.data?.worldId as WorldId) || 'hub';

      if (targetWorldId === 'concert') {
        const hasAllStars = STAR_LIST.every((s) => progress.stars[s.id]);
        if (!hasAllStars) {
          const starCount = Object.values(progress.stars).filter(Boolean).length;
          setActiveDialogue({
            title: 'Puerta Cósmica Sellada',
            speaker: 'Voz del Universo Púrpura',
            avatarIcon: '✨',
            text: `Mari, la Gran Puerta del Concierto requiere las 7 estrellas de los integrantes. Actualmente has recuperado ${starCount} de 7. ¡Continúa explorando los portales!`
          });
          return;
        }
      }

      // Enter world directly
      sound.playPortalTravel();
      setProgress((prev) => ({
        ...prev,
        currentWorld: targetWorldId
      }));
      return;
    }

    // 2. DIALOGUE INTERACTIONS
    if (point.type === 'dialogue') {
      const data = point.data as { title: string; text: string } | undefined;
      setActiveDialogue({
        title: data?.title || point.name,
        speaker: 'Fuente del Universo',
        avatarIcon: '💜',
        text: data?.text || 'Un aura de magia y música rodea este lugar.'
      });
      return;
    }

    // 3. ITEM PICKUP
    if (point.type === 'item') {
      sound.playCollect();
      const newItem: InventoryItem = {
        id: point.id,
        name: point.name,
        category: 'Objetos de misión',
        description: `Un objeto reluciente encontrado por Mari en ${point.name}.`,
        icon: '✨'
      };

      setProgress((prev) => ({
        ...prev,
        inventory: prev.inventory.some((i) => i.id === newItem.id)
          ? prev.inventory
          : [...prev.inventory, newItem],
        stats: {
          ...prev.stats,
          puzzlesSolved: prev.stats.puzzlesSolved + 1
        }
      }));

      setActiveDialogue({
        title: '¡Objeto Recogido!',
        speaker: 'Mari',
        avatarIcon: '🎒',
        text: `¡Mari guardó ${point.name} en su mochila ARMY! Este objeto resuena con la magia de BTS.`
      });
      return;
    }

    // 4. PUZZLE STATIONS
    if (point.type === 'puzzle') {
      setActiveMinigame(point);
      return;
    }

    // 5. CONCERT ALTAR
    if (point.type === 'altar') {
      setShowVictory(true);
      return;
    }
  };

  // Puzzle solved callback
  const handleSolvePuzzle = (
    starId: number,
    missionIds: string[],
    rewardItemName: string,
    rewardItemIcon: string
  ) => {
    setActiveMinigame(null);
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 3000);

    const completedMap = { ...progress.completedMissions };
    missionIds.forEach((mId) => {
      completedMap[mId] = true;
    });

    const rewardItem: InventoryItem = {
      id: `reward_star_${starId}`,
      name: rewardItemName,
      category: 'Coleccionables',
      description: `Recompensa especial otorgada a Mari por superar el desafío con honor y dedicación ARMY.`,
      icon: rewardItemIcon
    };

    setProgress((prev) => {
      const updatedStars = { ...prev.stars, [starId]: true };
      const allStarsCollected = STAR_LIST.every((s) => updatedStars[s.id]);

      return {
        ...prev,
        stars: updatedStars,
        completedMissions: completedMap,
        inventory: prev.inventory.some((i) => i.id === rewardItem.id)
          ? prev.inventory
          : [...prev.inventory, rewardItem],
        stats: {
          ...prev.stats,
          puzzlesSolved: prev.stats.puzzlesSolved + 1
        }
      };
    });

    // Check if that was the 7th star
    const nextStarCount = Object.values({ ...progress.stars, [starId]: true }).filter(Boolean).length;
    if (nextStarCount === 7) {
      setActiveDialogue({
        title: '¡Las Siete Estrellas Reunidas!',
        speaker: 'Voz del Universo Púrpura',
        avatarIcon: '👑',
        text: '¡Extraordinario, Mari! Las siete estrellas han despertado. La Gran Puerta del Concierto Estelar en la plaza se ha abierto. ¡Es hora de encender el escenario!'
      });
    } else {
      setActiveDialogue({
        title: '¡Estrella Recuperada!',
        speaker: 'Mari',
        avatarIcon: '⭐',
        text: `¡Mari recuperó la estrella de ${STAR_LIST.find((s) => s.id === starId)?.member}! Llevas ${nextStarCount} de 7 estrellas.`
      });
    }
  };

  const handleUpdateCustomization = (custom: CharacterCustomization) => {
    setProgress((prev) => ({
      ...prev,
      customization: custom
    }));
  };

  const handleResetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(INITIAL_PROGRESS);
    setShowPause(false);
    setShowVictory(false);
    setScreen('title');
  };

  const starCount = Object.values(progress.stars).filter(Boolean).length;

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas
        currentWorld={progress.currentWorld}
        collectedStars={progress.stars}
        customization={progress.customization}
        isDancing={isDancing}
        isCelebrating={isCelebrating}
        virtualJoystick={virtualJoystick}
        virtualJump={virtualJump}
        virtualInteract={virtualInteract}
        onClearVirtualJump={() => setVirtualJump(false)}
        onClearVirtualInteract={() => setVirtualInteract(false)}
        onNearInteractive={(point) => setNearInteractive(point)}
        onTriggerInteraction={handleTriggerInteraction}
        onStepWalked={() => {
          setProgress((prev) => ({
            ...prev,
            stats: {
              ...prev.stats,
              stepsWalked: prev.stats.stepsWalked + 1
            }
          }));
        }}
        bloomConfig={bloomConfig}
      />

      {/* Title Screen Overlay */}
      {screen === 'title' && (
        <TitleScreen
          onStartGame={() => setScreen('playing')}
          onOpenCustomizer={() => setShowCustomizer(true)}
          hasSavedProgress={starCount > 0}
          starCount={starCount}
        />
      )}

      {/* Main Playing HUD Overlay */}
      {screen === 'playing' && (
        <>
          <HUD
            currentWorld={progress.currentWorld}
            collectedStars={progress.stars}
            customization={progress.customization}
            nearInteractiveName={nearInteractive?.name || null}
            onOpenInventory={() => setShowInventory(true)}
            onOpenCustomizer={() => setShowCustomizer(true)}
            onOpenMissions={() => setShowMissions(true)}
            onOpenPause={() => setShowPause(true)}
            onToggleDance={() => setIsDancing(!isDancing)}
            isDancing={isDancing}
            onTriggerInteraction={() => {
              if (nearInteractive) handleTriggerInteraction(nearInteractive);
            }}
          />

          {/* Virtual Mobile Controls */}
          <MobileControls
            onJoystickMove={(vec) => setVirtualJoystick(vec)}
            onJump={() => setVirtualJump(true)}
            onInteract={() => setVirtualInteract(true)}
            hasNearInteract={!!nearInteractive}
          />
        </>
      )}

      {/* Interactive Minigame Overlay */}
      {activeMinigame && (
        <MinigameOverlay
          interactive={activeMinigame}
          onClose={() => setActiveMinigame(null)}
          onSolvePuzzle={handleSolvePuzzle}
        />
      )}

      {/* Branching Dialogue Modal */}
      {activeDialogue && (
        <DialogueModal
          title={activeDialogue.title}
          speaker={activeDialogue.speaker}
          avatarIcon={activeDialogue.avatarIcon}
          text={activeDialogue.text}
          options={activeDialogue.options}
          onClose={() => setActiveDialogue(null)}
        />
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <InventoryModal
          items={progress.inventory}
          collectedStars={progress.stars}
          onClose={() => setShowInventory(false)}
          onUseItem={(item) => {
            setActiveDialogue({
              title: 'Objeto Examinado',
              speaker: 'Mari',
              avatarIcon: item.icon,
              text: `«${item.name}» resuena con una cálida energía musical y emite destellos púrpuras.`
            });
          }}
        />
      )}

      {/* Missions Journal Modal with Fast Travel */}
      {showMissions && (
        <MissionsModal
          completedMissions={progress.completedMissions}
          onClose={() => setShowMissions(false)}
          onFastTravel={(worldId) => {
            sound.playPortalTravel();
            setProgress((prev) => ({ ...prev, currentWorld: worldId }));
          }}
        />
      )}

      {/* Character Customizer Modal */}
      {showCustomizer && (
        <CustomizerModal
          customization={progress.customization}
          onUpdateCustomization={handleUpdateCustomization}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {/* Pause & Settings Modal with Bloom Fine-Tuning */}
      {showPause && (
        <PauseModal
          onResume={() => setShowPause(false)}
          onReturnToHub={() => {
            setShowPause(false);
            setProgress((prev) => ({ ...prev, currentWorld: 'hub' }));
          }}
          onResetProgress={handleResetProgress}
          bloomConfig={bloomConfig}
          onUpdateBloomConfig={(cfg) => setBloomConfig((prev) => ({ ...prev, ...cfg }))}
        />
      )}

      {/* Final Concert Victory Screen */}
      {showVictory && (
        <FinalConcertModal
          stats={progress.stats}
          onClose={() => setShowVictory(false)}
          onRestart={handleResetProgress}
        />
      )}
    </div>
  );
}
