export type WorldId = 'hub' | 'rm' | 'jin' | 'suga' | 'jhope' | 'jimin' | 'v' | 'jungkook' | 'concert';

export interface StarInfo {
  id: number;
  worldId: WorldId;
  member: string;
  name: string;
  color: string;
  symbol: string;
  description: string;
  collected: boolean;
}

export interface Mission {
  id: string;
  name: string;
  objective: string;
  mechanic: string;
  completed: boolean;
  hint: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Objetos de misión' | 'Llaves' | 'Estrellas' | 'Coleccionables' | 'Accesorios';
  description: string;
  icon: string;
  worldId?: WorldId;
  canUse?: boolean;
}

export interface CharacterCustomization {
  hairColor: string;
  hairStyle: 'pigtails' | 'ponytail' | 'bob' | 'long';
  shirtColor: string;
  shirtLogo: 'ARMY' | 'BTS' | '7' | '💜';
  pantsColor: string;
  backpackColor: string;
  skinTone: string;
  shoesColor: string;
}

export interface DialogueChoice {
  text: string;
  nextStep?: string;
  action?: () => void;
}

export interface DialogueNode {
  speaker: string;
  avatarColor: string;
  text: string;
  choices?: DialogueChoice[];
  isMissionTrigger?: boolean;
  rewardStar?: number;
}

export interface GameProgress {
  stars: Record<number, boolean>;
  completedMissions: Record<string, boolean>;
  inventory: InventoryItem[];
  currentWorld: WorldId;
  hasSeenIntro: boolean;
  customization: CharacterCustomization;
  gameCompleted: boolean;
  stats: {
    puzzlesSolved: number;
    stepsWalked: number;
    notesPlayed: number;
    dishesCooked: number;
    danceScore: number;
  };
}
