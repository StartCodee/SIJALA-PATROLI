// Mock Data untuk Dashboard Patroli Jaga Laut - Raja Ampat
const NOW = () => new Date();
const NOW_MINUS_SEC = (seconds) => new Date(Date.now() - seconds * 1000);
const NOW_MINUS_MIN = (minutes) => new Date(Date.now() - minutes * 60 * 1000);
const NOW_MINUS_HOUR = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);
const NOW_MINUS_DAY = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
// Base coordinates for Raja Ampat area
const BASE_LAT = -0.23;
const BASE_LON = 130.51;
// Initial Vessels Data
export const createInitialVessels = () => [
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
export const createInitialTrackPoints = () => {
    const points = [];
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
export const createInitialPatrols = () => [
    {
        id: 'p-01',
        code: 'PTR-2026-001',
        date: '2026-01-23',
        vesselId: 'v-01',
        status: 'active',
        areaName: 'Misool Selatan',
        startTime: NOW_MINUS_HOUR(4),
        endTime: null,
        objective: 'Pengawasan zona larangan tangkap dan pemantauan terumbu karang',
        conservationAreaId: 'ca-01',
        postId: 'gp-02',
        departureTime: '08:00',
        patrolDays: 1,
        fuelStartLiters: 1200,
        fuelRemainingLiters: 860,
        fuelUsedLiters: 340,
        overnightLocation: 'Pos Jaga Misool Selatan',
        areaDescription: 'Koridor konservasi Misool Selatan dan wilayah tangkap terbatas.',
        hasNonPermanentResources: true,
        hasPermanentResources: false,
        hasMegafaunaObservation: true,
        patrolValidation: 'pending',
        collectedBy: 'Ririn Kamasan',
        collectedAt: NOW_MINUS_HOUR(3),
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
        conservationAreaId: 'ca-02',
        postId: 'gp-03',
        departureTime: '09:00',
        patrolDays: 1,
        fuelStartLiters: 1000,
        fuelRemainingLiters: 740,
        fuelUsedLiters: 260,
        overnightLocation: 'Pos Jaga Waigeo Barat',
        areaDescription: 'Zona perairan Waigeo Barat dengan pengawasan kapal asing.',
        hasNonPermanentResources: false,
        hasPermanentResources: true,
        hasMegafaunaObservation: false,
        patrolValidation: 'pending',
        collectedBy: 'Admin Patroli',
        collectedAt: NOW_MINUS_HOUR(2),
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
        conservationAreaId: 'ca-03',
        postId: 'gp-01',
        departureTime: '10:00',
        patrolDays: 1,
        fuelStartLiters: 900,
        fuelRemainingLiters: 690,
        fuelUsedLiters: 210,
        overnightLocation: 'Pelabuhan Sorong',
        areaDescription: 'Selat Dampier dan koridor wisata bahari.',
        hasNonPermanentResources: false,
        hasPermanentResources: false,
        hasMegafaunaObservation: true,
        patrolValidation: 'pending',
        collectedBy: 'Andi Sorong',
        collectedAt: NOW_MINUS_HOUR(1),
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
        conservationAreaId: 'ca-04',
        postId: 'gp-02',
        departureTime: '07:30',
        patrolDays: 1,
        fuelStartLiters: 1100,
        fuelRemainingLiters: 760,
        fuelUsedLiters: 340,
        overnightLocation: 'Pos Jaga Misool Selatan',
        areaDescription: 'Kepulauan Fam untuk pengawasan penyu dan mangrove.',
        hasNonPermanentResources: true,
        hasPermanentResources: true,
        hasMegafaunaObservation: false,
        patrolValidation: 'pending',
        collectedBy: 'Siti Muliani',
        collectedAt: NOW_MINUS_HOUR(4),
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
        objective: 'Patroli pemantauan biodiversitas',
        conservationAreaId: 'ca-03',
        postId: 'gp-04',
        departureTime: '06:00',
        patrolDays: 2,
        fuelStartLiters: 1300,
        fuelRemainingLiters: 1300,
        fuelUsedLiters: 0,
        overnightLocation: 'Pelabuhan Waisai',
        areaDescription: 'Teluk Kabui dan sekitarnya untuk patroli biodiversitas.',
        hasNonPermanentResources: false,
        hasPermanentResources: false,
        hasMegafaunaObservation: false,
        patrolValidation: 'pending',
        collectedBy: 'Admin Sistem',
        collectedAt: NOW(),
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
        conservationAreaId: 'ca-05',
        postId: 'gp-01',
        departureTime: '08:15',
        patrolDays: 1,
        fuelStartLiters: 1400,
        fuelRemainingLiters: 520,
        fuelUsedLiters: 880,
        overnightLocation: 'Pelabuhan Sorong',
        areaDescription: 'Survey mangrove Batanta Utara dan kawasan konservasi sekitarnya.',
        hasNonPermanentResources: true,
        hasPermanentResources: true,
        hasMegafaunaObservation: true,
        patrolValidation: 'validated',
        collectedBy: 'Koordinator Patroli',
        collectedAt: NOW_MINUS_DAY(1),
    },
];
// Incidents Data
export const createInitialIncidents = () => [
    {
        id: 'i-01',
        title: 'Dugaan penangkapan ikan ilegal dengan bom',
        category: 'Penangkapan Ikan Ilegal',
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
        category: 'Penangkapan Ikan Ilegal',
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
        description: 'Terlihat kelompok lumba-lumba sekitar 20 ekor. Data telah dicatat untuk pemantauan populasi.',
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
        category: 'Penangkapan Ikan Ilegal',
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
        title: 'Pemutihan karang di area Misool',
        category: 'Temuan Konservasi',
        status: 'open',
        time: NOW_MINUS_HOUR(4),
        vesselId: 'v-01',
        patrolId: 'p-01',
        location: { lat: BASE_LAT + 0.002, lon: BASE_LON + 0.004 },
        description: 'Ditemukan indikasi pemutihan karang di beberapa titik. Perlu pemantauan lebih lanjut.',
        severity: 'medium',
    },
];
// Temuan terbaru (foto)
export const createInitialFindings = () => [
    {
        id: 'f-01',
        patrolId: 'p-01',
        findingTime: NOW_MINUS_MIN(45),
        latitude: BASE_LAT + 0.004,
        longitude: BASE_LON + 0.002,
        gpsId: 'GPS-118',
        locationName: 'Misool Selatan',
        vesselTypeId: 'vt-01',
        vesselSubtypeId: 'vst-01',
        vesselTypeOther: '-',
        gearTypes: ['gt-01', 'gt-02'],
        gearOther: '-',
        zone: 'Zona Inti',
        subzone: 'Subzona A',
        zoneOther: '-',
        violationDetails: 'Aktivitas penangkapan ikan di zona inti tanpa izin.',
        actionTaken: 'Peringatan dan pendataan kapal.',
        hasTlpjlCard: true,
        findingPhotoId: 'mf-201',
        imageUrl: '/placeholder.svg',
        uploader: 'Ririn Kamasan',
        createdAt: NOW_MINUS_MIN(45),
    },
    {
        id: 'f-02',
        patrolId: 'p-04',
        findingTime: NOW_MINUS_HOUR(3),
        latitude: BASE_LAT - 0.02,
        longitude: BASE_LON + 0.035,
        gpsId: 'GPS-220',
        locationName: 'Kepulauan Fam',
        vesselTypeId: 'vt-02',
        vesselSubtypeId: 'vst-03',
        vesselTypeOther: '-',
        gearTypes: ['gt-03'],
        gearOther: '-',
        zone: 'Zona Pemanfaatan',
        subzone: 'Subzona B',
        zoneOther: '-',
        violationDetails: 'Pendaratan alat tangkap di area terlarang.',
        actionTaken: 'Koordinasi dengan pos jaga setempat.',
        hasTlpjlCard: false,
        findingPhotoId: 'mf-202',
        imageUrl: '/placeholder.svg',
        uploader: 'Admin Patroli',
        createdAt: NOW_MINUS_HOUR(3),
    },
    {
        id: 'f-03',
        patrolId: 'p-06',
        findingTime: NOW_MINUS_DAY(1),
        latitude: BASE_LAT + 0.015,
        longitude: BASE_LON - 0.01,
        gpsId: 'GPS-087',
        locationName: 'Batanta Utara',
        vesselTypeId: 'vt-03',
        vesselSubtypeId: null,
        vesselTypeOther: 'Perahu tradisional',
        gearTypes: ['gt-04'],
        gearOther: 'Alat tangkap buatan sendiri',
        zone: 'Zona Lainnya',
        subzone: '-',
        zoneOther: 'Kawasan edukasi',
        violationDetails: 'Tidak ditemukan pelanggaran, hanya observasi.',
        actionTaken: 'Pendataan dan pembinaan.',
        hasTlpjlCard: true,
        findingPhotoId: 'mf-203',
        imageUrl: '/placeholder.svg',
        uploader: 'Andi Sorong',
        createdAt: NOW_MINUS_DAY(1),
    },
];
export const createInitialVesselTypes = () => [
    { id: 'vt-01', code: 'VT-01', name: 'Kapal Motor', description: 'Kapal bermesin', isActive: true },
    { id: 'vt-02', code: 'VT-02', name: 'Kapal Kayu', description: 'Kapal kayu tradisional', isActive: true },
    { id: 'vt-03', code: 'VT-03', name: 'Perahu', description: 'Perahu kecil', isActive: true },
];
export const createInitialVesselSubtypes = () => [
    { id: 'vst-01', vesselTypeId: 'vt-01', code: 'VT-01A', name: 'Kapal Motor Kecil', description: 'Mesin kecil', isActive: true },
    { id: 'vst-02', vesselTypeId: 'vt-01', code: 'VT-01B', name: 'Kapal Motor Sedang', description: 'Mesin sedang', isActive: true },
    { id: 'vst-03', vesselTypeId: 'vt-02', code: 'VT-02A', name: 'Kapal Kayu Besar', description: 'Kayu besar', isActive: true },
];
export const createInitialViolationTypes = () => [
    {
        id: 'vio-01',
        code: 'VIO-01',
        name: 'Penangkapan Ikan Ilegal',
        description: 'Penangkapan ikan tanpa izin di kawasan konservasi',
        category: 'Perikanan',
        isActive: true,
    },
    {
        id: 'vio-02',
        code: 'VIO-02',
        name: 'Pelanggaran Zona',
        description: 'Memasuki zona larangan tanpa izin',
        category: 'Zonasi',
        isActive: true,
    },
    {
        id: 'vio-03',
        code: 'VIO-03',
        name: 'Alat Tangkap Terlarang',
        description: 'Menggunakan alat tangkap yang dilarang',
        category: 'Perikanan',
        isActive: true,
    },
];
export const createInitialFindingViolationItems = () => [
    { id: 'fvi-01', findingId: 'f-01', violationTypeId: 'vio-02' },
    { id: 'fvi-02', findingId: 'f-01', violationTypeId: 'vio-03' },
    { id: 'fvi-03', findingId: 'f-02', violationTypeId: 'vio-01' },
];
export const createInitialMediaFiles = () => [
    { id: 'mf-201', name: 'Temuan Misool Selatan', url: '/placeholder.svg' },
    { id: 'mf-202', name: 'Temuan Kepulauan Fam', url: '/placeholder.svg' },
    { id: 'mf-203', name: 'Temuan Batanta Utara', url: '/placeholder.svg' },
    { id: 'MF-001', name: 'Wawancara Nelayan Misool', url: '/placeholder.svg' },
    { id: 'MF-002', name: 'Wawancara Nelayan Sorong', url: '/placeholder.svg' },
    { id: 'MF-003', name: 'Wawancara Kelompok Warga', url: '/placeholder.svg' },
    { id: 'MF-011', name: 'Dokumentasi Rumpon', url: '/placeholder.svg' },
    { id: 'MF-012', name: 'Dokumentasi Rambu Batas', url: '/placeholder.svg' },
    { id: 'MF-101', name: 'Observasi Manta', url: '/placeholder.svg' },
    { id: 'MF-102', name: 'Observasi Dugong', url: '/placeholder.svg' },
    { id: 'MF-301', name: 'Dokumentasi Kunjungan Habitat 1', url: '/placeholder.svg' },
    { id: 'MF-302', name: 'Dokumentasi Kunjungan Habitat 2', url: '/placeholder.svg' },
];
export const createInitialConservationAreas = () => [
    { id: 'ca-01', code: 'CA-01', name: 'Kawasan Misool' },
    { id: 'ca-02', code: 'CA-02', name: 'Kawasan Waigeo' },
    { id: 'ca-03', code: 'CA-03', name: 'Selat Dampier' },
    { id: 'ca-04', code: 'CA-04', name: 'Kepulauan Fam' },
    { id: 'ca-05', code: 'CA-05', name: 'Batanta Utara' },
];
export const createInitialGearTypes = () => [
    { id: 'gt-01', code: 'NET', name: 'Jaring' },
    { id: 'gt-02', code: 'LINE', name: 'Pancing' },
    { id: 'gt-03', code: 'TRAP', name: 'Bubu' },
    { id: 'gt-04', code: 'OTHER', name: 'Lainnya' },
];
export const createInitialPatrolEquipment = () => [
    {
        id: 'pe-01',
        patrolId: 'p-01',
        gearTypeId: 'gt-01',
        quantity: 2,
    },
    {
        id: 'pe-02',
        patrolId: 'p-01',
        gearTypeId: 'gt-02',
        quantity: 4,
    },
    {
        id: 'pe-03',
        patrolId: 'p-02',
        gearTypeId: 'gt-03',
        quantity: 6,
    },
    {
        id: 'pe-04',
        patrolId: 'p-03',
        gearTypeId: 'gt-04',
        otherDescription: 'Drone monitoring',
        quantity: 1,
    },
    {
        id: 'pe-05',
        patrolId: 'p-06',
        gearTypeId: 'gt-02',
        quantity: 3,
    },
];
export const createInitialNonPermanentResources = () => [
    {
        id: 'npr-01',
        patrolId: 'p-01',
        surveyTime: NOW_MINUS_HOUR(2),
        location: { lat: BASE_LAT + 0.006, lon: BASE_LON + 0.004 },
        gpsId: 'GPS-118',
        resourceUser: 'Nelayan lokal',
        activity: 'Penangkapan ikan',
        interviewee: 'Bapak Yusuf',
        interviewPhotoId: 'MF-001',
        notes: 'Aktivitas dilakukan sesuai jalur yang diizinkan.',
        residentOrigin: 'Misool',
    },
    {
        id: 'npr-02',
        patrolId: 'p-04',
        surveyTime: NOW_MINUS_HOUR(3),
        location: { lat: BASE_LAT - 0.028, lon: BASE_LON + 0.032 },
        gpsId: 'GPS-220',
        resourceUser: 'Nelayan lintas pulau',
        activity: 'Perbaikan alat tangkap',
        interviewee: 'Ibu Ratna',
        interviewPhotoId: 'MF-002',
        notes: 'Perlu pendataan ulang alat tangkap.',
        residentOrigin: 'Sorong',
    },
    {
        id: 'npr-03',
        patrolId: 'p-06',
        surveyTime: NOW_MINUS_HOUR(22),
        location: { lat: BASE_LAT + 0.018, lon: BASE_LON - 0.012 },
        gpsId: 'GPS-087',
        resourceUser: 'Kelompok warga',
        activity: 'Pembersihan pantai',
        interviewee: 'Pak Herman',
        interviewPhotoId: 'MF-003',
        residentOrigin: 'Batanta',
    },
];
export const createInitialPermanentResources = () => [
    {
        id: 'pr-01',
        patrolId: 'p-02',
        surveyTime: NOW_MINUS_HOUR(2),
        location: { lat: BASE_LAT + 0.02, lon: BASE_LON - 0.015 },
        resourceType: 'Rumpon',
        function: 'Penanda rumpon',
        status: 'Baik',
        unitCount: 3,
        notes: 'Rumpon aktif dan terawat.',
        resourcePhotoId: 'MF-011',
    },
    {
        id: 'pr-02',
        patrolId: 'p-06',
        surveyTime: NOW_MINUS_HOUR(21),
        location: { lat: BASE_LAT + 0.012, lon: BASE_LON - 0.006 },
        resourceType: 'Rambu batas',
        function: 'Penanda zona',
        status: 'Perlu perbaikan',
        unitCount: 2,
        notes: 'Rambu mengalami kerusakan ringan.',
        resourcePhotoId: 'MF-012',
    },
];
export const createInitialMegafaunaObservations = () => [
    {
        id: 'mo-01',
        patrolId: 'p-01',
        observationTime: NOW_MINUS_HOUR(1),
        location: { lat: BASE_LAT + 0.008, lon: BASE_LON + 0.006 },
        locationName: 'Misool Selatan',
        areaName: 'Kawasan Misool',
        stationName: 'Stasiun 1',
        speciesId: 'SP-001',
        speciesName: 'Manta birostris',
        count: 4,
        behavior: 'Feeding',
        photoId: 'MF-101',
    },
    {
        id: 'mo-02',
        patrolId: 'p-03',
        observationTime: NOW_MINUS_HOUR(2),
        location: { lat: BASE_LAT + 0.03, lon: BASE_LON - 0.01 },
        locationName: 'Selat Dampier',
        areaName: 'Selat Dampier',
        stationName: 'Stasiun 2',
        speciesId: 'SP-004',
        speciesName: 'Dugong dugon',
        count: 1,
        behavior: 'Resting',
        photoId: 'MF-102',
    },
];
export const createInitialMonitoringHabitats = () => [
    {
        id: 'mh-01',
        monitoringCode: 'HAB-2026-001',
        conservationAreaId: 'ca-01',
        siteName: 'Site Misool Selatan',
        monitoringTime: NOW_MINUS_DAY(1),
        location: { lat: BASE_LAT - 0.04, lon: BASE_LON + 0.05 },
        observer1: 'Ririn Kamasan',
        observer2: 'Budi Saputra',
        observer3: 'Sari Ananta',
        signature1Id: 'SIG-001',
        signature2Id: 'SIG-002',
        signature3Id: 'SIG-003',
        cardQuestion: 'Kartu kontrol digunakan dan disimpan.',
        collectedBy: 'Ririn Kamasan',
        collectedAt: NOW_MINUS_DAY(1),
        habitatValidation: 'pending',
    },
    {
        id: 'mh-02',
        monitoringCode: 'HAB-2026-002',
        conservationAreaId: 'ca-03',
        siteName: 'Site Selat Dampier',
        monitoringTime: NOW_MINUS_HOUR(10),
        location: { lat: BASE_LAT + 0.03, lon: BASE_LON - 0.01 },
        observer1: 'Yusuf Pratama',
        observer2: 'Alya Putri',
        signature1Id: 'SIG-004',
        signature2Id: 'SIG-005',
        cardQuestion: 'Kartu kontrol diisi lengkap oleh operator.',
        collectedBy: 'Yusuf Pratama',
        collectedAt: NOW_MINUS_HOUR(8),
        habitatValidation: 'valid',
    },
];
export const createInitialHabitatVisits = () => [
    {
        id: 'hv-01',
        monitoringId: 'mh-01',
        operatorName: 'Koperasi Dive Misool',
        visitorCount: 12,
        guideCount: 2,
        totalPeople: 14,
        mantaSightingsCount: 3,
        mantaLocation: 'Laguna Misool',
        damageDescription: 'Tidak ada kerusakan yang terlihat.',
        actionTaken: 'Briefing ulang SOP kepada pengunjung.',
        solution: 'Tambah signage di titik masuk.',
        documentationId: 'MF-301',
    },
    {
        id: 'hv-02',
        monitoringId: 'mh-02',
        operatorName: 'Operator Dampier',
        visitorCount: 8,
        guideCount: 1,
        totalPeople: 9,
        mantaSightingsCount: 1,
        mantaLocation: 'Tanjung Dampier',
        damageDescription: 'Kerusakan ringan pada karang di sisi barat.',
        actionTaken: 'Peringatan kepada operator.',
        solution: 'Batasi jumlah pengunjung harian.',
        documentationId: 'MF-302',
    },
];
export const createInitialHabitatVisitViolationItems = () => [
    {
        id: 'hvv-01',
        habitatVisitId: 'hv-02',
        violationTypeId: 'vio-02',
        notes: 'Operator memasuki zona larangan.',
    },
];
export const createInitialGuardPosts = () => [
    {
        id: 'gp-01',
        name: 'Pelabuhan Sorong',
        type: 'pelabuhan',
        status: 'aktif',
        address: 'Jl. Pelabuhan No. 12, Sorong',
        contact: '0812-9000-2211',
        location: { lat: BASE_LAT - 0.58, lon: BASE_LON - 0.35 },
        notes: 'Pelabuhan utama logistik patroli.',
    },
    {
        id: 'gp-02',
        name: 'Pos Jaga Misool Selatan',
        type: 'pos_jaga',
        status: 'aktif',
        address: 'Misool Selatan, Raja Ampat',
        contact: '0813-4455-8899',
        location: { lat: BASE_LAT - 0.06, lon: BASE_LON + 0.04 },
        notes: 'Pos jaga untuk pengawasan zona konservasi.',
    },
    {
        id: 'gp-03',
        name: 'Pos Jaga Waigeo Barat',
        type: 'pos_jaga',
        status: 'aktif',
        address: 'Waigeo Barat, Raja Ampat',
        contact: '0821-7733-1122',
        location: { lat: BASE_LAT + 0.08, lon: BASE_LON - 0.03 },
    },
    {
        id: 'gp-04',
        name: 'Pelabuhan Waisai',
        type: 'pelabuhan',
        status: 'nonaktif',
        address: 'Waisai, Raja Ampat',
        contact: '0822-1100-4455',
        location: { lat: BASE_LAT + 0.02, lon: BASE_LON + 0.01 },
        notes: 'Sedang dalam renovasi dermaga.',
    },
];
export const createInitialCrew = () => [
    {
        id: 'c-01',
        name: 'Kapten Yosef Warikar',
        role: 'kapten',
        status: 'aktif',
        phone: '0812-1111-2233',
        email: 'yosef.warikar@patroli.id',
        basePostId: 'gp-01',
        lastActiveAt: NOW_MINUS_MIN(20),
        certifications: ['STCW Basic', 'SAR Laut'],
    },
    {
        id: 'c-02',
        name: 'Dominggus Mambraku',
        role: 'navigator',
        status: 'aktif',
        phone: '0812-3322-4411',
        email: 'dominggus.mambraku@patroli.id',
        basePostId: 'gp-02',
        lastActiveAt: NOW_MINUS_MIN(55),
        certifications: ['Navigasi Elektronik', 'GMDSS'],
    },
    {
        id: 'c-03',
        name: 'Hendrik Rumbiak',
        role: 'operator',
        status: 'aktif',
        phone: '0813-2200-8899',
        email: 'hendrik.rumbiak@patroli.id',
        basePostId: 'gp-02',
        lastActiveAt: NOW_MINUS_HOUR(2),
        certifications: ['Radio Operator', 'AIS Tracking'],
    },
    {
        id: 'c-04',
        name: 'Petrus Ayomi',
        role: 'teknisi',
        status: 'cuti',
        phone: '0815-9000-0022',
        email: 'petrus.ayomi@patroli.id',
        basePostId: 'gp-03',
        lastActiveAt: NOW_MINUS_DAY(1),
        certifications: ['Teknisi Mesin', 'Perawatan Kapal'],
    },
    {
        id: 'c-05',
        name: 'Melkianus Faidiban',
        role: 'medis',
        status: 'aktif',
        phone: '0816-4555-1122',
        email: 'melkianus.faidiban@patroli.id',
        basePostId: 'gp-01',
        lastActiveAt: NOW_MINUS_HOUR(3),
        certifications: ['Pertolongan Pertama', 'Medis Darurat'],
    },
    {
        id: 'c-06',
        name: 'Samuel Wandik',
        role: 'petugas',
        status: 'nonaktif',
        phone: '0817-9900-3344',
        email: 'samuel.wandik@patroli.id',
        basePostId: 'gp-04',
        lastActiveAt: NOW_MINUS_DAY(3),
        certifications: ['Pengawasan Zona'],
    },
];
export const createInitialCrewAssignments = () => [
    {
        id: 'ca-01',
        patrolId: 'p-01',
        crewId: 'c-01',
        role: 'kapten',
        shift: 'pagi',
        status: 'active',
        assignedAt: NOW_MINUS_HOUR(5),
    },
    {
        id: 'ca-02',
        patrolId: 'p-01',
        crewId: 'c-02',
        role: 'navigator',
        shift: 'pagi',
        status: 'active',
        assignedAt: NOW_MINUS_HOUR(5),
    },
    {
        id: 'ca-03',
        patrolId: 'p-02',
        crewId: 'c-03',
        role: 'operator',
        shift: 'siang',
        status: 'active',
        assignedAt: NOW_MINUS_HOUR(3),
    },
    {
        id: 'ca-04',
        patrolId: 'p-03',
        crewId: 'c-05',
        role: 'medis',
        shift: 'siang',
        status: 'planned',
        assignedAt: NOW_MINUS_DAY(1),
    },
    {
        id: 'ca-05',
        patrolId: 'p-04',
        crewId: 'c-02',
        role: 'navigator',
        shift: 'malam',
        status: 'planned',
        assignedAt: NOW_MINUS_DAY(1),
    },
    {
        id: 'ca-06',
        patrolId: 'p-06',
        crewId: 'c-04',
        role: 'teknisi',
        shift: 'pagi',
        status: 'completed',
        assignedAt: NOW_MINUS_DAY(2),
    },
];
export const getConnectionStatus = (lastTimestamp) => {
    const ageSec = (Date.now() - lastTimestamp.getTime()) / 1000;
    if (ageSec < 120)
        return 'normal';
    if (ageSec <= 300)
        return 'delayed';
    return 'offline';
};
export const getConnectionStatusLabel = (status) => {
    switch (status) {
        case 'normal': return 'Normal';
        case 'delayed': return 'Terlambat';
        case 'offline': return 'Tidak Terbarui';
    }
};
// Helper to format relative time
export const formatRelativeTime = (date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)
        return `${seconds} detik lalu`;
    if (seconds < 3600)
        return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400)
        return `${Math.floor(seconds / 3600)} jam lalu`;
    return `${Math.floor(seconds / 86400)} hari lalu`;
};
// Simulate random walk for vessel position update
export const updateVesselPosition = (vessel) => {
    if (vessel.status !== 'aktif')
        return vessel;
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
export const generateTrackPoint = (vessel) => ({
    vesselId: vessel.id,
    lat: vessel.lastPosition.lat,
    lon: vessel.lastPosition.lon,
    timestamp: new Date(),
});
export const filterTrackPointsByTime = (points, vesselId, range) => {
    const now = Date.now();
    let cutoff;
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
    'Penangkapan Ikan Ilegal',
    'Cuaca',
    'Kerusakan Kapal',
    'Temuan Konservasi',
    'Pelanggaran Zona',
    'Lainnya',
];
