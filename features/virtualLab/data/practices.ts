import { Practice } from './types';

export const practices: Practice[] = [
  {
    id: 'reaksi-eksoterm',
    name: 'Reaksi Eksoterm',
    description: 'Amati reaksi yang melepaskan panas ke lingkungan',
    difficulty: 'easy',
    estimatedTime: '10-15 menit',
    initialVessels: [
      {
        id: 'beaker-vessel',
        type: 'beaker',
        name: 'Gelas Kimia',
        contents: [{ itemId: 'hcl', volumeMl: 50, color: '#FDE68A' }],
        temperature: 25,
        maxVolume: 250,
      },
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Persiapan',
        instruction: 'Gelas kimia berisi larutan HCl 1M (warna kuning pucat). Siapkan termometer untuk mengukur suhu.',
        availableItems: ['thermometer'],
        requiredActions: [],
        autoComplete: true,
        hint: 'Tekan "Lanjut" untuk melanjutkan',
      },
      {
        id: 'step-2',
        title: 'Ukur Suhu Awal',
        instruction: 'Gunakan termometer untuk mengukur suhu awal larutan HCl.',
        availableItems: ['thermometer'],
        requiredActions: [
          { type: 'measureTemp', vesselId: 'beaker-vessel', description: 'Ukur suhu awal' },
        ],
        input: { key: 'suhu_awal', label: 'Suhu awal', type: 'number', unit: '°C' },
        hint: 'Pilih termometer, ketuk gelas kimia',
      },
      {
        id: 'step-3',
        title: 'Tambahkan Serbuk Zn',
        instruction: 'Tambahkan serbuk seng (Zn) ke dalam larutan HCl. HATI-HATI: Reaksi akan menghasilkan gas H₂!',
        availableItems: ['zn'],
        requiredActions: [
          { type: 'pour', itemId: 'zn', vesselId: 'beaker-vessel', description: 'Tambahkan serbuk Zn' },
        ],
        hint: 'Pilih Zn (serbuk abu-abu) lalu ketuk gelas kimia',
      },
      {
        id: 'step-4',
        title: 'Amati Reaksi',
        instruction: 'Perhatikan gelembung gas yang terbentuk dan perubahan warna larutan. Gas yang keluar adalah hidrogen (H₂).',
        availableItems: [],
        requiredActions: [],
        autoComplete: true,
      },
      {
        id: 'step-5',
        title: 'Ukur Suhu Akhir',
        instruction: 'Ukur suhu akhir larutan. Bandingkan dengan suhu awal!',
        availableItems: ['thermometer'],
        requiredActions: [
          { type: 'measureTemp', vesselId: 'beaker-vessel', description: 'Ukur suhu akhir' },
        ],
        input: { key: 'suhu_akhir', label: 'Suhu akhir', type: 'number', unit: '°C' },
      },
      {
        id: 'step-6',
        title: 'Kesimpulan',
        instruction: 'Reaksi Zn + 2HCl → ZnCl₂ + H₂↑ adalah reaksi EKSOTERM karena melepaskan panas ke lingkungan, sehingga suhu larutan naik.',
        availableItems: [],
        requiredActions: [],
        autoComplete: true,
      },
    ],
    reactions: [
      {
        id: 'zn-hcl-reaction',
        reactants: ['zn', 'hcl'],
        result: {
          color: '#D1D5DB',
          tempChange: 15,
          observation: 'Gelembung gas H₂ terbentuk dengan cepat! Larutan berubah menjadi jernih keabu-abuan. Suhu naik karena reaksi melepaskan panas.',
          bubbles: true,
        },
      },
    ],
  },
  {
    id: 'uji-kation',
    name: 'Uji Kation Cu²⁺',
    description: 'Identifikasi ion tembaga (Cu²⁺) menggunakan NaOH',
    difficulty: 'easy',
    estimatedTime: '10-15 menit',
    initialVessels: [
      {
        id: 'tube-1',
        type: 'testTube',
        name: 'Tabung Sampel',
        contents: [{ itemId: 'cuSO4', volumeMl: 5, color: '#60A5FA' }],
        temperature: 25,
        maxVolume: 20,
      },
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Pengamatan Awal',
        instruction: 'Perhatikan warna larutan sampel di tabung reaksi. Warna BIRU menandakan kemungkinan adanya ion Cu²⁺ (tembaga).',
        availableItems: [],
        requiredActions: [],
        autoComplete: true,
        hint: 'Perhatikan warna biru larutan CuSO₄',
      },
      {
        id: 'step-2',
        title: 'Tambahkan NaOH',
        instruction: 'Teteskan larutan NaOH (natrium hidroksida) ke dalam tabung sampel. Amati perubahan yang terjadi!',
        availableItems: ['naoh', 'pipet'],
        requiredActions: [
          { type: 'addDrops', itemId: 'naoh', vesselId: 'tube-1', description: 'Teteskan NaOH' },
        ],
        hint: 'Pilih NaOH lalu ketuk tabung sampel',
      },
      {
        id: 'step-3',
        title: 'Catat Pengamatan',
        instruction: 'Apa yang kamu amati setelah penambahan NaOH? Catat perubahan warna dan bentuk yang terjadi.',
        availableItems: [],
        requiredActions: [],
        input: { key: 'pengamatan', label: 'Hasil pengamatan', type: 'text' },
        hint: 'Contoh: "Terbentuk endapan biru"',
      },
      {
        id: 'step-4',
        title: 'Kesimpulan',
        instruction: 'Endapan biru muda yang terbentuk adalah Cu(OH)₂ (tembaga hidroksida). Ini membuktikan adanya ion Cu²⁺ dalam sampel.\n\nReaksi: Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (endapan biru)',
        availableItems: [],
        requiredActions: [],
        autoComplete: true,
      },
    ],
    reactions: [
      {
        id: 'cu-naoh-precipitate',
        reactants: ['cuSO4', 'naoh'],
        result: {
          color: '#2563EB',
          observation: 'Terbentuk ENDAPAN BIRU MUDA Cu(OH)₂! Larutan menjadi keruh dengan endapan yang mengendap di dasar. Ion Cu²⁺ positif teridentifikasi.',
          precipitate: true,
        },
      },
    ],
  },
];

export function getPracticeById(id: string): Practice | undefined {
  return practices.find(p => p.id === id);
}

export function getAllPractices(): Practice[] {
  return practices;
}
