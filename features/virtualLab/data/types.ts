// Virtual Lab Type Definitions

export type ItemKind = 'tool' | 'chemical';
export type ChemicalPhase = 'solution' | 'solid' | 'liquid' | 'gas';
export type VesselType = 'beaker' | 'erlenmeyer' | 'buret' | 'testTube' | 'measuringCylinder';

// Lab items: tools and chemicals
export interface LabItem {
  id: string;
  name: string;
  icon: string;
  kind: ItemKind;
  phase?: ChemicalPhase;
  color?: string;
  description?: string;
}

// Vessel state in the workspace
export interface VesselState {
  id: string;
  type: VesselType;
  name: string;
  contents: VesselContent[];
  temperature: number;
  maxVolume: number;
  // Reaction effects
  hasPrecipitate?: boolean;
  hasBubbles?: boolean;
  precipitateColor?: string;
}

export interface VesselContent {
  itemId: string;
  volumeMl: number;
  color: string;
}

// Actions that can be performed
export type LabAction =
  | { type: 'pour'; fromItemId: string; toVesselId: string; volumeMl: number }
  | { type: 'addDrops'; itemId: string; toVesselId: string; drops: number }
  | { type: 'stir'; vesselId: string }
  | { type: 'heat'; vesselId: string }
  | { type: 'measureTemp'; vesselId: string }
  | { type: 'titrate'; fromVesselId: string; toVesselId: string };

// Reaction rules
export interface ReactionRule {
  id: string;
  reactants: string[]; // item IDs that must be present
  vesselType?: VesselType;
  result: {
    color?: string;
    tempChange?: number;
    observation: string;
    precipitate?: boolean;
    bubbles?: boolean;
  };
}

// Practice step definition
export interface PracticeStep {
  id: string;
  title: string;
  instruction: string;
  availableItems: string[]; // item IDs available in this step
  requiredActions: RequiredAction[];
  input?: {
    key: string;
    label: string;
    type: 'text' | 'number';
    unit?: string;
  };
  hint?: string;
  autoComplete?: boolean; // step completes automatically after actions
}

export interface RequiredAction {
  type: LabAction['type'];
  itemId?: string;
  vesselId?: string;
  description: string;
}

// Practice definition
export interface Practice {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  initialVessels: VesselState[];
  steps: PracticeStep[];
  reactions: ReactionRule[];
}

// Simulation state
export interface SimulationState {
  practiceId: string;
  currentStepIndex: number;
  vessels: VesselState[];
  completedActions: string[]; // action descriptions that have been done
  observations: string[];
  inputs: Record<string, string>;
  selectedItemId: string | null;
  isComplete: boolean;
}

// Simulation actions for reducer
export type SimulationAction =
  | { type: 'SELECT_ITEM'; itemId: string | null }
  | { type: 'PERFORM_ACTION'; action: LabAction }
  | { type: 'ADD_OBSERVATION'; observation: string }
  | { type: 'SET_INPUT'; key: string; value: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };
