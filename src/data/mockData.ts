// Mock Data untuk Dashboard Patroli Jaga Laut - Raja Ampat

const NOW = () => new Date();
const NOW_MINUS_SEC = (seconds: number) => new Date(Date.now() - seconds * 1000);
const NOW_MINUS_MIN = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);
const NOW_MINUS_HOUR = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const NOW_MINUS_DAY = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// Type definitions
export interface Position {
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  timestamp: Date;
}

export interface Vessel {
  id: string;
  name: string;
  callSign: string;
  status: 'aktif' | 'standby' | 'maintenance';
  patrolId: string | null;
  lastPosition: Position;
  captain: string;
  crew: number;
  type: string;
}

export interface TrackPoint {
  vesselId: string;
  lat: number;
  lon: number;
  timestamp: Date;
}

export interface Patrol {
  id: string;
  code: string;
  date: string;
  vesselId: string;
  status: 'active' | 'planned' | 'completed';
  areaName: string;
  startTime: Date;
  endTime: Date | null;
  objective: string;
}

export interface Incident {
  id: string;
  title: string;
  category: 'Illegal Fishing' | 'Cuaca' | 'Kerusakan Kapal' | 'Temuan Konservasi' | 'Pelanggaran Zona' | 'Lainnya';
  status: 'open' | 'closed' | 'investigating';
  time: Date;
  vesselId: string | null;
  patrolId: string | null;
  location: { lat: number; lon: number } | null;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// Base coordinates for Raja Ampat area
const BASE_LAT = -0.23;
const BASE_LON = 130.51;

// Initial Vessels Data
export const createInitialVessels = (): Vessel[] => [
  {
    id: 'v-01',
    name: 'KP. Cendrawasih',
    callSign: 'RA-01',
    status: 'aktif',
    patrolId: 'p-01',
    lastPosition: {
      lat: BASE_LAT + 0.004,
      lon: BASE_LON + 0.002,
      speed: 12,
      heading: 80,
      timestamp: NOW_MINUS_SEC(45),
    },
    captain: 'Kapten Yosef Warikar',
    crew: 8,
    type: 'Kapal Patroli Cepat',
  },
  {
    id: 'v-02',
    name: 'KP. Manta Ray',
    callSign: 'RA-02',
    status: 'aktif',
    patrolId: 'p-02',
    lastPosition: {
      lat: BASE_LAT - 0.012,
      lon: BASE_LON + 0.018,
      speed: 8,
      heading: 125,
      timestamp: NOW_MINUS_SEC(30),
    },
    captain: 'Kapten Dominggus Mambraku',
    crew: 6,
    type: 'Kapal Patroli Sedang',
  },
  {
    id: 'v-03',
    name: 'KP. Arwana',
    callSign: 'RA-03',
    status: 'aktif',
    patrolId: 'p-03',
    lastPosition: {
      lat: BASE_LAT + 0.025,
      lon: BASE_LON - 0.008,
      speed: 15,
      heading: 245,
      timestamp: NOW_MINUS_SEC(20),
    },
    captain: 'Kapten Hendrik Rumbiak',
    crew: 7,
    type: 'Kapal Patroli Cepat',
  },
  {
    id: 'v-04',
    name: 'KP. Dugong',
    callSign: 'RA-04',
    status: 'standby',
    patrolId: null,
    lastPosition: {
      lat: BASE_LAT + 0.001,
      lon: BASE_LON + 0.001,
      speed: 0,
      heading: 0,
      timestamp: NOW_MINUS_MIN(15),
    },
    captain: 'Kapten Petrus Ayomi',
    crew: 5,
    type: 'Kapal Patroli Ringan',
  },
  {
    id: 'v-05',
    name: 'KP. Penyu Hijau',
    callSign: 'RA-05',
    status: 'maintenance',
    patrolId: null,
    lastPosition: {
      lat: BASE_LAT - 0.002,
      lon: BASE_LON - 0.001,
      speed: 0,
      heading: 90,
      timestamp: NOW_MINUS_HOUR(2),
    },
    captain: 'Kapten Melkianus Faidiban',
    crew: 6,
    type: 'Kapal Patroli Sedang',
  },
  {
    id: 'v-06',
    name: 'KP. Hiu Karang',
    callSign: 'RA-06',
    status: 'aktif',
    patrolId: 'p-04',
    lastPosition: {
      lat: BASE_LAT - 0.035,
      lon: BASE_LON + 0.042,
      speed: 10,
      heading: 190,
      timestamp: NOW_MINUS_SEC(55),
    },
    captain: 'Kapten Alfons Korwa',
    crew: 7,
    type: 'Kapal Patroli Cepat',
  },
  {
    id: 'v-07',
    name: 'KP. Lumba-Lumba',
    callSign: 'RA-07',
    status: 'standby',
    patrolId: null,
    lastPosition: {
      lat: BASE_LAT + 0.008,
      lon: BASE_LON + 0.005,
      speed: 0,
      heading: 45,
      timestamp: NOW_MINUS_MIN(8),
    },
    captain: 'Kapten Samuel Wandik',
    crew: 5,
    type: 'Kapal Patroli Ringan',
  },
];

// Initial Track Points
export const createInitialTrackPoints = (): TrackPoint[] => {
  const points: TrackPoint[] = [];
  
  // Track for vessel v-01 (last 2 hours)
  for (let i = 120; i >= 0; i -= 5) {
    points.push({
      vesselId: 'v-01',
      lat: BASE_LAT + 0.004 - (i * 0.0001),
      lon: BASE_LON + 0.002 + (i * 0.00005),
      timestamp: NOW_MINUS_MIN(i),
    });
  }
  
  // Track for vessel v-02 (last 2 hours)
  for (let i = 120; i >= 0; i -= 5) {
    points.push({
      vesselId: 'v-02',
      lat: BASE_LAT - 0.012 + (i * 0.00008),
      lon: BASE_LON + 0.018 - (i * 0.0001),
      timestamp: NOW_MINUS_MIN(i),
    });
  }
  
  // Track for vessel v-03 (last 2 hours)
  for (let i = 120; i >= 0; i -= 5) {
    points.push({
      vesselId: 'v-03',
      lat: BASE_LAT + 0.025 + Math.sin(i * 0.05) * 0.002,
      lon: BASE_LON - 0.008 + (i * 0.00006),
      timestamp: NOW_MINUS_MIN(i),
    });
  }
  
  // Track for vessel v-06 (last 2 hours)
  for (let i = 120; i >= 0; i -= 5) {
    points.push({
      vesselId: 'v-06',
      lat: BASE_LAT - 0.035 + (i * 0.00012),
      lon: BASE_LON + 0.042 - (i * 0.00015),
      timestamp: NOW_MINUS_MIN(i),
    });
  }
  
  return points;
};

// Patrols Data
export const createInitialPatrols = (): Patrol[] => [
  {
    id: 'p-01',
    code: 'PTR-2026-001',
    date: '2026-01-23',
    vesselId: 'v-01',
    status: 'active',
    areaName: 'Misool Selatan',
    startTime: NOW_MINUS_HOUR(4),
    endTime: null,
    objective: 'Pengawasan zona larangan tangkap dan monitoring terumbu karang',
  },
  {
    id: 'p-02',
    code: 'PTR-2026-002',
    date: '2026-01-23',
    vesselId: 'v-02',
    status: 'active',
    areaName: 'Waigeo Barat',
    startTime: NOW_MINUS_HOUR(3),
    endTime: null,
    objective: 'Patroli rutin dan identifikasi aktivitas kapal asing',
  },
  {
    id: 'p-03',
    code: 'PTR-2026-003',
    date: '2026-01-23',
    vesselId: 'v-03',
    status: 'active',
    areaName: 'Selat Dampier',
    startTime: NOW_MINUS_HOUR(2),
    endTime: null,
    objective: 'Pemantauan jalur migrasi ikan dan aktivitas wisata',
  },
  {
    id: 'p-04',
    code: 'PTR-2026-004',
    date: '2026-01-23',
    vesselId: 'v-06',
    status: 'active',
    areaName: 'Kepulauan Fam',
    startTime: NOW_MINUS_HOUR(5),
    endTime: null,
    objective: 'Pengawasan zona konservasi penyu',
  },
  {
    id: 'p-05',
    code: 'PTR-2026-005',
    date: '2026-01-24',
    vesselId: 'v-04',
    status: 'planned',
    areaName: 'Teluk Kabui',
    startTime: NOW_MINUS_HOUR(-20),
    endTime: null,
    objective: 'Patroli monitoring biodiversitas',
  },
  {
    id: 'p-06',
    code: 'PTR-2026-006',
    date: '2026-01-22',
    vesselId: 'v-01',
    status: 'completed',
    areaName: 'Batanta Utara',
    startTime: NOW_MINUS_DAY(1),
    endTime: NOW_MINUS_HOUR(20),
    objective: 'Survei kondisi ekosistem mangrove',
  },
];

// Incidents Data
export const createInitialIncidents = (): Incident[] => [
  {
    id: 'i-01',
    title: 'Dugaan penangkapan ikan ilegal dengan bom',
    category: 'Illegal Fishing',
    status: 'open',
    time: NOW_MINUS_HOUR(2),
    vesselId: 'v-01',
    patrolId: 'p-01',
    location: { lat: BASE_LAT + 0.003, lon: BASE_LON + 0.001 },
    description: 'Terdeteksi ledakan bawah air pada koordinat yang dilaporkan. Tim patroli sedang menuju lokasi untuk investigasi lebih lanjut.',
    severity: 'high',
  },
  {
    id: 'i-02',
    title: 'Cuaca ekstrem - gelombang tinggi',
    category: 'Cuaca',
    status: 'closed',
    time: NOW_MINUS_DAY(1),
    vesselId: null,
    patrolId: 'p-02',
    location: null,
    description: 'Peringatan cuaca ekstrem dengan gelombang 3-4 meter. Semua kapal patroli telah kembali ke pelabuhan.',
    severity: 'medium',
  },
  {
    id: 'i-03',
    title: 'Kapal asing memasuki zona konservasi',
    category: 'Pelanggaran Zona',
    status: 'investigating',
    time: NOW_MINUS_HOUR(5),
    vesselId: 'v-02',
    patrolId: 'p-02',
    location: { lat: BASE_LAT - 0.015, lon: BASE_LON + 0.022 },
    description: 'Kapal berbendera asing terdeteksi memasuki zona inti konservasi. Sedang dilakukan dokumentasi dan peringatan.',
    severity: 'high',
  },
  {
    id: 'i-04',
    title: 'Temuan sarang penyu hijau',
    category: 'Temuan Konservasi',
    status: 'closed',
    time: NOW_MINUS_HOUR(8),
    vesselId: 'v-03',
    patrolId: 'p-03',
    location: { lat: BASE_LAT + 0.028, lon: BASE_LON - 0.005 },
    description: 'Ditemukan sarang penyu hijau dengan sekitar 80 telur. Lokasi telah ditandai dan dijaga.',
    severity: 'low',
  },
  {
    id: 'i-05',
    title: 'Kerusakan mesin kapal patroli',
    category: 'Kerusakan Kapal',
    status: 'closed',
    time: NOW_MINUS_DAY(2),
    vesselId: 'v-05',
    patrolId: null,
    location: { lat: BASE_LAT - 0.001, lon: BASE_LON - 0.002 },
    description: 'KP. Penyu Hijau mengalami kerusakan pada sistem pendingin mesin. Kapal dalam proses perbaikan di dock.',
    severity: 'medium',
  },
  {
    id: 'i-06',
    title: 'Aktivitas penangkapan dengan pukat',
    category: 'Illegal Fishing',
    status: 'open',
    time: NOW_MINUS_HOUR(1),
    vesselId: 'v-06',
    patrolId: 'p-04',
    location: { lat: BASE_LAT - 0.032, lon: BASE_LON + 0.038 },
    description: 'Terlihat kapal nelayan menggunakan pukat di zona terlarang. Tim sedang melakukan pendekatan.',
    severity: 'high',
  },
  {
    id: 'i-07',
    title: 'Sighting lumba-lumba besar',
    category: 'Temuan Konservasi',
    status: 'closed',
    time: NOW_MINUS_HOUR(12),
    vesselId: 'v-01',
    patrolId: 'p-01',
    location: { lat: BASE_LAT + 0.01, lon: BASE_LON + 0.008 },
    description: 'Terlihat kelompok lumba-lumba sekitar 20 ekor. Data telah dicatat untuk monitoring populasi.',
    severity: 'low',
  },
  {
    id: 'i-08',
    title: 'Jangkar merusak terumbu karang',
    category: 'Pelanggaran Zona',
    status: 'investigating',
    time: NOW_MINUS_HOUR(6),
    vesselId: 'v-02',
    patrolId: 'p-02',
    location: { lat: BASE_LAT - 0.008, lon: BASE_LON + 0.015 },
    description: 'Kapal wisata menjatuhkan jangkar di area terumbu karang. Dokumentasi kerusakan sedang dilakukan.',
    severity: 'medium',
  },
  {
    id: 'i-09',
    title: 'Pembuangan sampah di laut',
    category: 'Lainnya',
    status: 'open',
    time: NOW_MINUS_HOUR(3),
    vesselId: 'v-03',
    patrolId: 'p-03',
    location: { lat: BASE_LAT + 0.022, lon: BASE_LON - 0.003 },
    description: 'Terlihat kapal membuang sampah plastik ke laut. Nomor registrasi telah dicatat.',
    severity: 'medium',
  },
  {
    id: 'i-10',
    title: 'Perahu nelayan tanpa izin',
    category: 'Pelanggaran Zona',
    status: 'closed',
    time: NOW_MINUS_DAY(1),
    vesselId: 'v-06',
    patrolId: 'p-04',
    location: { lat: BASE_LAT - 0.04, lon: BASE_LON + 0.045 },
    description: 'Ditemukan 3 perahu nelayan lokal tanpa izin. Telah diberikan sosialisasi dan peringatan.',
    severity: 'low',
  },
  {
    id: 'i-11',
    title: 'Radar mendeteksi kapal mencurigakan',
    category: 'Illegal Fishing',
    status: 'investigating',
    time: NOW_MINUS_MIN(45),
    vesselId: 'v-01',
    patrolId: 'p-01',
    location: { lat: BASE_LAT + 0.005, lon: BASE_LON + 0.003 },
    description: 'Sistem radar mendeteksi kapal tidak teridentifikasi. Tim sedang melakukan investigasi.',
    severity: 'high',
  },
  {
    id: 'i-12',
    title: 'Coral bleaching di area Misool',
    category: 'Temuan Konservasi',
    status: 'open',
    time: NOW_MINUS_HOUR(4),
    vesselId: 'v-01',
    patrolId: 'p-01',
    location: { lat: BASE_LAT + 0.002, lon: BASE_LON + 0.004 },
    description: 'Ditemukan indikasi pemutihan karang di beberapa titik. Perlu monitoring lebih lanjut.',
    severity: 'medium',
  },
];

// Helper function to calculate connection status
export type ConnectionStatus = 'normal' | 'delayed' | 'offline';

export const getConnectionStatus = (lastTimestamp: Date): ConnectionStatus => {
  const ageSec = (Date.now() - lastTimestamp.getTime()) / 1000;
  if (ageSec < 120) return 'normal';
  if (ageSec <= 300) return 'delayed';
  return 'offline';
};

export const getConnectionStatusLabel = (status: ConnectionStatus): string => {
  switch (status) {
    case 'normal': return 'Normal';
    case 'delayed': return 'Terlambat';
    case 'offline': return 'Tidak Update';
  }
};

// Helper to format relative time
export const formatRelativeTime = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} detik lalu`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  return `${Math.floor(seconds / 86400)} hari lalu`;
};

// Simulate random walk for vessel position update
export const updateVesselPosition = (vessel: Vessel): Vessel => {
  if (vessel.status !== 'aktif') return vessel;
  
  const deltaLat = (Math.random() - 0.5) * 0.002;
  const deltaLon = (Math.random() - 0.5) * 0.002;
  const newSpeed = Math.max(5, Math.min(20, vessel.lastPosition.speed + (Math.random() - 0.5) * 4));
  const newHeading = (vessel.lastPosition.heading + (Math.random() - 0.5) * 30 + 360) % 360;
  
  return {
    ...vessel,
    lastPosition: {
      lat: vessel.lastPosition.lat + deltaLat,
      lon: vessel.lastPosition.lon + deltaLon,
      speed: Math.round(newSpeed * 10) / 10,
      heading: Math.round(newHeading),
      timestamp: new Date(),
    },
  };
};

// Generate new track point from vessel
export const generateTrackPoint = (vessel: Vessel): TrackPoint => ({
  vesselId: vessel.id,
  lat: vessel.lastPosition.lat,
  lon: vessel.lastPosition.lon,
  timestamp: new Date(),
});

// Filter track points by time range
export type TimeRange = '1h' | '6h' | 'today';

export const filterTrackPointsByTime = (
  points: TrackPoint[],
  vesselId: string,
  range: TimeRange
): TrackPoint[] => {
  const now = Date.now();
  let cutoff: number;
  
  switch (range) {
    case '1h':
      cutoff = now - 60 * 60 * 1000;
      break;
    case '6h':
      cutoff = now - 6 * 60 * 60 * 1000;
      break;
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      cutoff = today.getTime();
      break;
  }
  
  return points
    .filter(p => p.vesselId === vesselId && p.timestamp.getTime() >= cutoff)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Get area names for select options
export const AREA_NAMES = [
  'Misool Selatan',
  'Misool Utara',
  'Waigeo Barat',
  'Waigeo Timur',
  'Selat Dampier',
  'Kepulauan Fam',
  'Teluk Kabui',
  'Batanta Utara',
  'Batanta Selatan',
  'Salawati',
];

export const INCIDENT_CATEGORIES = [
  'Illegal Fishing',
  'Cuaca',
  'Kerusakan Kapal',
  'Temuan Konservasi',
  'Pelanggaran Zona',
  'Lainnya',
] as const;
