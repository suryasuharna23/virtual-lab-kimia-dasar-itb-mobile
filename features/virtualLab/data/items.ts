// Lab items catalog: tools and chemicals
import { LabItem } from './types';

export const labItems: Record<string, LabItem> = {
  // === TOOLS (Alat) ===
  buret: {
    id: 'buret',
    name: 'Buret',
    icon: 'flask',
    kind: 'tool',
    description: 'Alat ukur volume presisi untuk titrasi',
  },
  erlenmeyer: {
    id: 'erlenmeyer',
    name: 'Erlenmeyer',
    icon: 'beaker',
    kind: 'tool',
    description: 'Labu erlenmeyer untuk pencampuran',
  },
  beaker: {
    id: 'beaker',
    name: 'Gelas Kimia',
    icon: 'flask-outline',
    kind: 'tool',
    description: 'Gelas kimia untuk menampung larutan',
  },
  pipet: {
    id: 'pipet',
    name: 'Pipet',
    icon: 'water',
    kind: 'tool',
    description: 'Pipet tetes untuk menambahkan tetesan',
  },
  measuringCylinder: {
    id: 'measuringCylinder',
    name: 'Gelas Ukur',
    icon: 'flask-outline',
    kind: 'tool',
    description: 'Gelas ukur untuk mengukur volume',
  },
  testTube: {
    id: 'testTube',
    name: 'Tabung Reaksi',
    icon: 'cube-outline',
    kind: 'tool',
    description: 'Tabung reaksi untuk percobaan skala kecil',
  },
  thermometer: {
    id: 'thermometer',
    name: 'Termometer',
    icon: 'thermometer',
    kind: 'tool',
    description: 'Alat ukur suhu',
  },
  stirringRod: {
    id: 'stirringRod',
    name: 'Pengaduk',
    icon: 'remove-outline',
    kind: 'tool',
    description: 'Batang pengaduk kaca',
  },
  bunsenBurner: {
    id: 'bunsenBurner',
    name: 'Pembakar Bunsen',
    icon: 'flame',
    kind: 'tool',
    description: 'Pemanas untuk reaksi',
  },

  // === CHEMICALS - Solutions (Larutan) ===
  naoh: {
    id: 'naoh',
    name: 'NaOH 0.1M',
    icon: 'water-outline',
    kind: 'chemical',
    phase: 'solution',
    color: '#93C5FD',
    description: 'Larutan natrium hidroksida (basa kuat)',
  },
  hcl: {
    id: 'hcl',
    name: 'HCl 0.1M',
    icon: 'water-outline',
    kind: 'chemical',
    phase: 'solution',
    color: '#FEF3C7', // Light yellow (asam)
    description: 'Larutan asam klorida (asam kuat)',
  },
  h2so4: {
    id: 'h2so4',
    name: 'H₂SO₄ 0.1M',
    icon: 'water-outline',
    kind: 'chemical',
    phase: 'solution',
    color: '#FEE2E2', // Light red-ish
    description: 'Larutan asam sulfat',
  },
  phenolphthalein: {
    id: 'phenolphthalein',
    name: 'Fenolftalein',
    icon: 'color-filter',
    kind: 'chemical',
    phase: 'liquid',
    color: '#F9A8D4', // Pink (when in base)
    description: 'Indikator asam-basa',
  },
  methylOrange: {
    id: 'methylOrange',
    name: 'Metil Oranye',
    icon: 'color-filter',
    kind: 'chemical',
    phase: 'liquid',
    color: '#FB923C', // Orange
    description: 'Indikator asam-basa',
  },
  baCl2: {
    id: 'baCl2',
    name: 'BaCl₂',
    icon: 'water-outline',
    kind: 'chemical',
    phase: 'solution',
    color: '#E0E7FF',
    description: 'Larutan barium klorida',
  },
  agNO3: {
    id: 'agNO3',
    name: 'AgNO₃',
    icon: 'water-outline',
    kind: 'chemical',
    phase: 'solution',
    color: '#E5E7EB',
    description: 'Larutan perak nitrat',
  },
  cuSO4: {
    id: 'cuSO4',
    name: 'CuSO₄',
    icon: 'water-outline',
    kind: 'chemical',
    phase: 'solution',
    color: '#93C5FD', // Blue
    description: 'Larutan tembaga sulfat (biru)',
  },
  nh4cl: {
    id: 'nh4cl',
    name: 'NH₄Cl',
    icon: 'flask-outline',
    kind: 'chemical',
    phase: 'solid',
    color: '#FFFFFF',
    description: 'Amonium klorida (padatan)',
  },
  baOH2: {
    id: 'baOH2',
    name: 'Ba(OH)₂',
    icon: 'flask-outline',
    kind: 'chemical',
    phase: 'solid',
    color: '#F3F4F6',
    description: 'Barium hidroksida (padatan)',
  },
  water: {
    id: 'water',
    name: 'Aquades',
    icon: 'water',
    kind: 'chemical',
    phase: 'liquid',
    color: '#DBEAFE', // Light blue
    description: 'Air suling',
  },
  zn: {
    id: 'zn',
    name: 'Zn (serbuk)',
    icon: 'ellipse',
    kind: 'chemical',
    phase: 'solid',
    color: '#9CA3AF', // Gray
    description: 'Serbuk seng',
  },
};

// Helper functions
export function getItemsByKind(kind: 'tool' | 'chemical'): LabItem[] {
  return Object.values(labItems).filter(item => item.kind === kind);
}

export function getChemicals(): LabItem[] {
  return getItemsByKind('chemical');
}

export function getTools(): LabItem[] {
  return getItemsByKind('tool');
}

export function getItemById(id: string): LabItem | undefined {
  return labItems[id];
}
