// Struktur data praktikum dan langkah-langkah simulasi
export const virtualLabPractices = [
  {
    id: 'titrasi',
    name: 'Titrasi Asam-Basa',
    description: 'Simulasi titrasi larutan asam dan basa untuk menentukan konsentrasi.',
    steps: [
      {
        id: 'step1',
        title: 'Menyiapkan Alat',
        instruction: 'Drag & drop buret, erlenmeyer, dan pipet ke meja kerja.',
        tools: ['buret', 'erlenmeyer', 'pipet'],
        required: ['buret', 'erlenmeyer', 'pipet'],
        input: null
      },
      {
        id: 'step2',
        title: 'Mengisi Larutan',
        instruction: 'Isi buret dengan larutan basa dan erlenmeyer dengan larutan asam.',
        tools: ['larutan_basa', 'larutan_asam'],
        required: ['larutan_basa', 'larutan_asam'],
        input: null
      },
      {
        id: 'step3',
        title: 'Menambahkan Indikator',
        instruction: 'Tambahkan beberapa tetes indikator ke erlenmeyer.',
        tools: ['indikator'],
        required: ['indikator'],
        input: null
      },
      {
        id: 'step4',
        title: 'Titrasi',
        instruction: 'Teteskan larutan basa dari buret ke erlenmeyer hingga warna berubah. Catat volume akhir.',
        tools: [],
        required: [],
        input: {
          label: 'Volume akhir (mL)',
          type: 'number',
          key: 'volume_akhir'
        }
      },
      {
        id: 'step5',
        title: 'Hasil',
        instruction: 'Simulasi selesai! Lihat hasil perhitungan.',
        tools: [],
        required: [],
        input: null
      }
    ]
  },
  {
    id: 'pencampuran',
    name: 'Pencampuran Larutan',
    description: 'Simulasi pencampuran dua larutan dan pengamatan hasilnya.',
    steps: [
      { id: 'step1', title: 'Siapkan Alat', instruction: 'Drag & drop gelas ukur dan tabung reaksi ke meja kerja.', tools: ['gelas_ukur', 'tabung_reaksi'], required: ['gelas_ukur', 'tabung_reaksi'], input: null },
      { id: 'step2', title: 'Isi Larutan', instruction: 'Isi gelas ukur dengan larutan A dan tabung reaksi dengan larutan B.', tools: ['larutan_a', 'larutan_b'], required: ['larutan_a', 'larutan_b'], input: null },
      { id: 'step3', title: 'Campurkan', instruction: 'Tuang larutan A ke tabung reaksi dan amati perubahan.', tools: [], required: [], input: { label: 'Catatan perubahan', type: 'text', key: 'catatan_perubahan' } },
      { id: 'step4', title: 'Hasil', instruction: 'Simulasi selesai! Lihat hasil pengamatan.', tools: [], required: [], input: null }
    ]
  },
  {
    id: 'reaksi-endoterm',
    name: 'Reaksi Endoterm',
    description: 'Simulasi reaksi endoterm dan pengukuran suhu.',
    steps: [
      { id: 'step1', title: 'Siapkan Alat', instruction: 'Drag & drop gelas kimia dan termometer ke meja kerja.', tools: ['gelas_kimia', 'termometer'], required: ['gelas_kimia', 'termometer'], input: null },
      { id: 'step2', title: 'Isi Larutan', instruction: 'Isi gelas kimia dengan larutan C.', tools: ['larutan_c'], required: ['larutan_c'], input: null },
      { id: 'step3', title: 'Ukur Suhu Awal', instruction: 'Catat suhu awal larutan.', tools: [], required: [], input: { label: 'Suhu awal (°C)', type: 'number', key: 'suhu_awal' } },
      { id: 'step4', title: 'Tambahkan Zat', instruction: 'Tambahkan zat D ke larutan dan aduk.', tools: ['zat_d'], required: ['zat_d'], input: null },
      { id: 'step5', title: 'Ukur Suhu Akhir', instruction: 'Catat suhu akhir larutan.', tools: [], required: [], input: { label: 'Suhu akhir (°C)', type: 'number', key: 'suhu_akhir' } },
      { id: 'step6', title: 'Hasil', instruction: 'Simulasi selesai! Lihat perubahan suhu.', tools: [], required: [], input: null }
    ]
  },
  {
    id: 'reaksi-eksoterm',
    name: 'Reaksi Eksoterm',
    description: 'Simulasi reaksi eksoterm dan pengukuran suhu.',
    steps: [
      { id: 'step1', title: 'Siapkan Alat', instruction: 'Drag & drop gelas kimia dan termometer ke meja kerja.', tools: ['gelas_kimia', 'termometer'], required: ['gelas_kimia', 'termometer'], input: null },
      { id: 'step2', title: 'Isi Larutan', instruction: 'Isi gelas kimia dengan larutan E.', tools: ['larutan_e'], required: ['larutan_e'], input: null },
      { id: 'step3', title: 'Ukur Suhu Awal', instruction: 'Catat suhu awal larutan.', tools: [], required: [], input: { label: 'Suhu awal (°C)', type: 'number', key: 'suhu_awal' } },
      { id: 'step4', title: 'Tambahkan Zat', instruction: 'Tambahkan zat F ke larutan dan aduk.', tools: ['zat_f'], required: ['zat_f'], input: null },
      { id: 'step5', title: 'Ukur Suhu Akhir', instruction: 'Catat suhu akhir larutan.', tools: [], required: [], input: { label: 'Suhu akhir (°C)', type: 'number', key: 'suhu_akhir' } },
      { id: 'step6', title: 'Hasil', instruction: 'Simulasi selesai! Lihat perubahan suhu.', tools: [], required: [], input: null }
    ]
  },
  // Praktikum lain bisa ditambah di sini
];

// Daftar alat/senyawa untuk drag & drop
export const virtualLabTools = {
  buret: { name: 'Buret', icon: 'flask' },
  erlenmeyer: { name: 'Erlenmeyer', icon: 'beaker' },
  pipet: { name: 'Pipet', icon: 'water' },
  larutan_basa: { name: 'Larutan Basa', icon: 'water-outline' },
  larutan_asam: { name: 'Larutan Asam', icon: 'water-outline' },
  indikator: { name: 'Indikator', icon: 'color-filter' },
  gelas_ukur: { name: 'Gelas Ukur', icon: 'flask-outline' },
  tabung_reaksi: { name: 'Tabung Reaksi', icon: 'cube-outline' },
  larutan_a: { name: 'Larutan A', icon: 'water-outline' },
  larutan_b: { name: 'Larutan B', icon: 'water-outline' },
  gelas_kimia: { name: 'Gelas Kimia', icon: 'flask' },
  termometer: { name: 'Termometer', icon: 'thermometer' },
  larutan_c: { name: 'Larutan C', icon: 'water-outline' },
  zat_d: { name: 'Zat D', icon: 'flask-outline' },
  larutan_e: { name: 'Larutan E', icon: 'water-outline' },
  zat_f: { name: 'Zat F', icon: 'flask-outline' },
};
