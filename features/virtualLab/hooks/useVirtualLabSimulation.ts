import { useReducer, useCallback, useMemo } from 'react';
import { SimulationState, SimulationAction, Practice, LabAction, VesselState } from '../data/types';
import { labItems } from '../data/items';

function createInitialState(practice: Practice): SimulationState {
  return {
    practiceId: practice.id,
    currentStepIndex: 0,
    vessels: JSON.parse(JSON.stringify(practice.initialVessels)),
    completedActions: [],
    observations: [],
    inputs: {},
    selectedItemId: null,
    isComplete: false,
  };
}

function applyReaction(
  vessels: VesselState[],
  practice: Practice,
  action: LabAction
): { vessels: VesselState[]; observation: string | null } {
  const newVessels = JSON.parse(JSON.stringify(vessels)) as VesselState[];
  let observation: string | null = null;

  if (action.type === 'pour' || action.type === 'addDrops') {
    const targetVessel = newVessels.find(v => v.id === action.toVesselId);
    if (!targetVessel) return { vessels: newVessels, observation };

    const itemId = action.type === 'pour' ? action.fromItemId : action.itemId;
    const item = labItems[itemId];
    if (!item) return { vessels: newVessels, observation };

    const existingContentIds = targetVessel.contents.map(c => c.itemId);
    const allChemicals = [...existingContentIds, itemId];

    for (const reaction of practice.reactions) {
      const hasAllReactants = reaction.reactants.every(r => allChemicals.includes(r));
      if (hasAllReactants) {
        if (reaction.result.color) {
          targetVessel.contents.forEach(c => {
            c.color = reaction.result.color!;
          });
        }
        if (reaction.result.tempChange) {
          targetVessel.temperature += reaction.result.tempChange;
        }
        if (reaction.result.precipitate) {
          targetVessel.hasPrecipitate = true;
          targetVessel.precipitateColor = reaction.result.color || '#60A5FA';
        }
        if (reaction.result.bubbles) {
          targetVessel.hasBubbles = true;
        }
        observation = reaction.result.observation;
        break;
      }
    }

    const volume = action.type === 'pour' ? action.volumeMl : action.drops * 0.05;
    const existingContent = targetVessel.contents.find(c => c.itemId === itemId);
    if (existingContent) {
      existingContent.volumeMl += volume;
    } else {
      targetVessel.contents.push({
        itemId,
        volumeMl: volume,
        color: item.color || '#E5E7EB',
      });
    }
  }

  if (action.type === 'stir') {
    observation = 'Campuran diaduk hingga homogen.';
  }

  if (action.type === 'measureTemp') {
    const vessel = newVessels.find(v => v.id === action.vesselId);
    if (vessel) {
      observation = `Suhu terukur: ${vessel.temperature}°C`;
    }
  }

  if (action.type === 'heat') {
    const vessel = newVessels.find(v => v.id === action.vesselId);
    if (vessel) {
      vessel.temperature += 20;
      observation = `Larutan dipanaskan. Suhu naik menjadi ${vessel.temperature}°C`;
    }
  }

  if (action.type === 'titrate') {
    const toVessel = newVessels.find(v => v.id === action.toVesselId);
    if (toVessel) {
      const allChemicals = toVessel.contents.map(c => c.itemId);
      for (const reaction of practice.reactions) {
        const hasAllReactants = reaction.reactants.every(r => 
          allChemicals.includes(r) || r === 'naoh'
        );
        if (hasAllReactants && reaction.id.includes('endpoint')) {
          if (reaction.result.color) {
            toVessel.contents.forEach(c => {
              c.color = reaction.result.color!;
            });
          }
          observation = reaction.result.observation;
          break;
        }
      }
    }
  }

  return { vessels: newVessels, observation };
}

function simulationReducer(
  state: SimulationState,
  action: SimulationAction,
  practice: Practice
): SimulationState {
  switch (action.type) {
    case 'SELECT_ITEM':
      return { ...state, selectedItemId: action.itemId };

    case 'PERFORM_ACTION': {
      const { vessels, observation } = applyReaction(state.vessels, practice, action.action);
      const actionDesc = getActionDescription(action.action);
      
      return {
        ...state,
        vessels,
        completedActions: [...state.completedActions, actionDesc],
        observations: observation 
          ? [...state.observations, observation]
          : state.observations,
        selectedItemId: null,
      };
    }

    case 'ADD_OBSERVATION':
      return {
        ...state,
        observations: [...state.observations, action.observation],
      };

    case 'SET_INPUT':
      return {
        ...state,
        inputs: { ...state.inputs, [action.key]: action.value },
      };

    case 'NEXT_STEP': {
      const nextIndex = state.currentStepIndex + 1;
      const isComplete = nextIndex >= practice.steps.length;
      return {
        ...state,
        currentStepIndex: isComplete ? state.currentStepIndex : nextIndex,
        isComplete,
        completedActions: [],
      };
    }

    case 'PREV_STEP':
      return {
        ...state,
        currentStepIndex: Math.max(0, state.currentStepIndex - 1),
        completedActions: [],
      };

    case 'RESET':
      return createInitialState(practice);

    default:
      return state;
  }
}

function getActionDescription(action: LabAction): string {
  switch (action.type) {
    case 'pour':
      return `Menuang ${labItems[action.fromItemId]?.name || action.fromItemId}`;
    case 'addDrops':
      return `Meneteskan ${labItems[action.itemId]?.name || action.itemId}`;
    case 'stir':
      return 'Mengaduk campuran';
    case 'heat':
      return 'Memanaskan larutan';
    case 'measureTemp':
      return 'Mengukur suhu';
    case 'titrate':
      return 'Melakukan titrasi';
    default:
      return 'Melakukan aksi';
  }
}

export function useVirtualLabSimulation(practice: Practice) {
  const [state, baseDispatch] = useReducer(
    (s: SimulationState, a: SimulationAction) => simulationReducer(s, a, practice),
    practice,
    createInitialState
  );

  const dispatch = useCallback((action: SimulationAction) => {
    baseDispatch(action);
  }, []);

  const currentStep = useMemo(() => {
    return practice.steps[state.currentStepIndex];
  }, [practice.steps, state.currentStepIndex]);

  const progress = useMemo(() => {
    return ((state.currentStepIndex + 1) / practice.steps.length) * 100;
  }, [state.currentStepIndex, practice.steps.length]);

  const canProceed = useMemo(() => {
    if (!currentStep) return false;
    if (currentStep.autoComplete) return true;
    if (currentStep.input && !state.inputs[currentStep.input.key]) return false;
    
    const requiredCount = currentStep.requiredActions.length;
    if (requiredCount === 0) return true;
    
    const completedCount = currentStep.requiredActions.filter(req => {
      const reqType = req.type;
      const reqItemId = req.itemId;
      
      return state.completedActions.some(completed => {
        const completedLower = completed.toLowerCase();
        
        if (reqType === 'pour' && completedLower.includes('menuang')) return true;
        if (reqType === 'addDrops' && completedLower.includes('meneteskan')) return true;
        if (reqType === 'stir' && completedLower.includes('aduk')) return true;
        if (reqType === 'measureTemp' && completedLower.includes('suhu')) return true;
        if (reqType === 'heat' && completedLower.includes('panas')) return true;
        if (reqType === 'titrate' && completedLower.includes('titrasi')) return true;
        
        if (reqItemId) {
          const item = labItems[reqItemId];
          if (item && completedLower.includes(item.name.toLowerCase())) return true;
        }
        
        return false;
      });
    }).length;
    
    return completedCount >= requiredCount;
  }, [currentStep, state.completedActions, state.inputs]);

  const selectItem = useCallback((itemId: string | null) => {
    dispatch({ type: 'SELECT_ITEM', itemId });
  }, [dispatch]);

  const performAction = useCallback((action: LabAction) => {
    dispatch({ type: 'PERFORM_ACTION', action });
  }, [dispatch]);

  const setInput = useCallback((key: string, value: string) => {
    dispatch({ type: 'SET_INPUT', key, value });
  }, [dispatch]);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, [dispatch]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    state,
    currentStep,
    progress,
    canProceed,
    selectItem,
    performAction,
    setInput,
    nextStep,
    prevStep,
    reset,
  };
}
