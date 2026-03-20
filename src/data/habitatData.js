// Habitat Monitoring Data
// Dummy data for Monitoring Pemanfaatan Habitat dashboard
import { photoUrls } from '@/assets/image';

import { KKP_OPTIONS, POS_OPTIONS, mapCenter, mapZoom } from './sispandalwasData';

export { KKP_OPTIONS, POS_OPTIONS, mapCenter, mapZoom };

// ─── Habitat Summary statistics ────────────────────────────────────
export const habitatSummary = {
    dataMasuk: 48,
    jumlahPelanggaran: 3,
};

// ─── Monitoring points on map ──────────────────────────────────────
export const habitatPoints = [
    { id: 'H001', lat: -0.44, lng: 130.60, type: 'wisatawan', label: 'Monitoring Wisatawan #1', zone: 'selat-dampier', pos: 'pos-yenbekwan', date: '2025-01-04' },
    { id: 'H002', lat: -0.52, lng: 130.65, type: 'wisatawan', label: 'Monitoring Wisatawan #2', zone: 'selat-dampier', pos: 'pos-yenadwak', date: '2025-01-06' },
    { id: 'H003', lat: -1.86, lng: 130.22, type: 'guide', label: 'Monitoring Guide #1', zone: 'kepulauan-misool', pos: 'pos-ya-lapale', date: '2025-01-08' },
    { id: 'H004', lat: -0.34, lng: 130.80, type: 'manta', label: 'Temuan Manta #1', zone: 'teluk-mayalibit', pos: 'pos-warsowes', date: '2025-01-09' },
    { id: 'H005', lat: 0.03, lng: 131.08, type: 'wisatawan', label: 'Monitoring Wisatawan #3', zone: 'kepulauan-ayau-asia', pos: 'pos-dorehkar', date: '2025-01-11' },
    { id: 'H006', lat: -0.48, lng: 130.62, type: 'manta', label: 'Temuan Manta #2', zone: 'selat-dampier', pos: 'pos-yenbekwan', date: '2025-01-05' },
    { id: 'H007', lat: -1.90, lng: 130.28, type: 'guide', label: 'Monitoring Guide #2', zone: 'kepulauan-misool', pos: 'pos-ya-lapale', date: '2025-01-12' },
    { id: 'H008', lat: -0.30, lng: 130.82, type: 'wisatawan', label: 'Monitoring Wisatawan #4', zone: 'teluk-mayalibit', pos: 'pos-warsowes', date: '2025-01-10' },
    { id: 'H009', lat: -0.58, lng: 130.56, type: 'manta', label: 'Temuan Manta #3', zone: 'selat-dampier', pos: 'pos-yenadwak', date: '2025-01-13' },
    { id: 'H010', lat: -0.72, lng: 130.44, type: 'guide', label: 'Monitoring Guide #3', zone: 'kepulauan-fam', pos: 'pos-mioskor', date: '2025-01-15' },
];

const HABITAT_DUMMY_REPORT_META = {
    H001: { areaLabel: 'Selat Dampier', posLabel: 'Pos Yenbekwan', koordinatorLabel: 'Meldis Ombori', speedboatLabel: 'Mangku Bumi', reportTime: '06:00', hasViolation: false, statusKey: 'incoming' },
    H002: { areaLabel: 'Selat Dampier', posLabel: 'Pos Yenadwak', koordinatorLabel: 'Yulianus Werfete', speedboatLabel: 'Kri Bumi', reportTime: '20:00', hasViolation: false, statusKey: 'pending' },
    H003: { areaLabel: 'Misool Selatan', posLabel: 'Pos Ya Lapale', koordinatorLabel: 'Niko Waran', speedboatLabel: 'Misool Jaya', reportTime: '08:00', hasViolation: true, violationType: 'pelanggaran-zonasi', statusKey: 'approved' },
    H004: { areaLabel: 'Teluk Mayalibit', posLabel: 'Pos Warsowes', koordinatorLabel: 'Paulus Werfete', speedboatLabel: 'Mayalibit Indah', reportTime: '09:00', hasViolation: false, statusKey: 'incoming' },
    H005: { areaLabel: 'Kepulauan Ayau-Asia', posLabel: 'Pos Dorehkar', koordinatorLabel: 'Nikolaus Yarangga', speedboatLabel: 'Ayau Bahari', reportTime: '11:00', hasViolation: false, statusKey: 'approved' },
    H006: { areaLabel: 'Selat Dampier', posLabel: 'Pos Yenbekwan', koordinatorLabel: 'Meldis Ombori', speedboatLabel: 'Mangku Bumi', reportTime: '05:30', hasViolation: true, violationType: 'kerusakan-terumbu-karang', statusKey: 'pending' },
    H007: { areaLabel: 'Misool Selatan', posLabel: 'Pos Ya Lapale', koordinatorLabel: 'Niko Waran', speedboatLabel: 'Misool Jaya', reportTime: '12:00', hasViolation: false, statusKey: 'approved' },
    H008: { areaLabel: 'Teluk Mayalibit', posLabel: 'Pos Warsowes', koordinatorLabel: 'Paulus Werfete', speedboatLabel: 'Mayalibit Indah', reportTime: '10:00', hasViolation: false, statusKey: 'approved' },
    H009: { areaLabel: 'Selat Dampier', posLabel: 'Pos Yenadwak', koordinatorLabel: 'Yulianus Werfete', speedboatLabel: 'Kri Bumi', reportTime: '13:00', hasViolation: true, violationType: 'pelanggaran-zonasi', statusKey: 'incoming' },
    H010: { areaLabel: 'Kepulauan Fam', posLabel: 'Pos Mioskor', koordinatorLabel: 'Dominggus Waran', speedboatLabel: 'Fam Lestari', reportTime: '15:00', hasViolation: false, statusKey: 'approved' },
};

export const habitatEmbedReports = habitatPoints.map((point) => {
    const meta = HABITAT_DUMMY_REPORT_META[point.id] || {};
    return {
        id: point.id,
        zone: point.zone,
        pos: point.pos,
        type: point.type,
        lat: point.lat,
        lng: point.lng,
        label: point.label,
        locationLabel: point.label,
        date: point.date,
        areaLabel: meta.areaLabel || KKP_OPTIONS.find((option) => option.value === point.zone)?.label?.ID || point.zone,
        posLabel: meta.posLabel || POS_OPTIONS.find((option) => option.value === point.pos)?.label?.ID || point.pos,
        koordinatorLabel: meta.koordinatorLabel || '-',
        speedboatLabel: meta.speedboatLabel || '-',
        reportTime: meta.reportTime || '08:00',
        statusKey: meta.statusKey || 'incoming',
        hasMantaFinding: point.type === 'manta',
        hasViolation: Boolean(meta.hasViolation),
        violationType: meta.violationType || '',
    };
});

// ─── Jenis Pelanggaran ─────────────────────────────────────────────
export const jenisPelanggaran = [
    { key: 'pelanggaran-zonasi', label: { ID: 'Pelanggaran Zonasi', EN: 'Zoning Violation' }, count: 2, color: '#ef4444' },
    { key: 'kerusakan-terumbu-karang', label: { ID: 'Kerusakan Terumbu Karang', EN: 'Coral Reef Damage' }, count: 1, color: '#f59e0b' },
];

// ─── Dokumentasi / Validasi Data ───────────────────────────────────
export const dokumentasiItems = [
    {
        id: 'DOK001',
        src: photoUrls.foto01,
        caption: { ID: 'Dokumentasi monitoring wisatawan Dampier', EN: 'Dampier tourist monitoring documentation' },
        date: '04 Jan 2025',
        status: { ID: 'Divalidasi', EN: 'Validated' },
    },
    {
        id: 'DOK002',
        src: photoUrls.foto03,
        caption: { ID: 'Dokumentasi temuan manta Arborek', EN: 'Arborek manta sighting documentation' },
        date: '05 Jan 2025',
        status: { ID: 'Divalidasi', EN: 'Validated' },
    },
    {
        id: 'DOK003',
        src: photoUrls.foto05,
        caption: { ID: 'Dokumentasi monitoring guide Misool', EN: 'Misool guide monitoring documentation' },
        date: '08 Jan 2025',
        status: { ID: 'Divalidasi', EN: 'Validated' },
    },
];

// ─── Chart data: Jumlah Wisatawan ──────────────────────────────────
export const wisatawanChartData = [
    { key: 'dampier', label: { ID: 'Selat Dampier', EN: 'Dampier Strait' }, value: 124, color: '#3b82f6' },
    { key: 'misool', label: { ID: 'Kep. Misool', EN: 'Misool Islands' }, value: 86, color: '#ef4444' },
    { key: 'mayalibit', label: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' }, value: 45, color: '#f59e0b' },
    { key: 'ayau', label: { ID: 'Kep. Ayau-Asia', EN: 'Ayau-Asia Islands' }, value: 32, color: '#84cc16' },
    { key: 'kofiau', label: { ID: 'Kep. Kofiau-Boo', EN: 'Kofiau-Boo Islands' }, value: 18, color: '#06b6d4' },
    { key: 'fam', label: { ID: 'Kep. Fam', EN: 'Fam Islands' }, value: 67, color: '#8b5cf6' },
    { key: 'misool-utara', label: { ID: 'Misool Utara', EN: 'North Misool' }, value: 29, color: '#ec4899' },
];

// ─── Chart data: Jumlah Guide ──────────────────────────────────────
export const guideChartData = [
    { key: 'dampier', label: { ID: 'Selat Dampier', EN: 'Dampier Strait' }, value: 18, color: '#3b82f6' },
    { key: 'misool', label: { ID: 'Kep. Misool', EN: 'Misool Islands' }, value: 12, color: '#ef4444' },
    { key: 'mayalibit', label: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' }, value: 6, color: '#f59e0b' },
    { key: 'ayau', label: { ID: 'Kep. Ayau-Asia', EN: 'Ayau-Asia Islands' }, value: 4, color: '#84cc16' },
    { key: 'kofiau', label: { ID: 'Kep. Kofiau-Boo', EN: 'Kofiau-Boo Islands' }, value: 3, color: '#06b6d4' },
    { key: 'fam', label: { ID: 'Kep. Fam', EN: 'Fam Islands' }, value: 9, color: '#8b5cf6' },
    { key: 'misool-utara', label: { ID: 'Misool Utara', EN: 'North Misool' }, value: 5, color: '#ec4899' },
];

// ─── Chart data: Jumlah Temuan Manta ───────────────────────────────
export const mantaChartData = [
    { key: 'dampier', label: { ID: 'Selat Dampier', EN: 'Dampier Strait' }, value: 8, color: '#3b82f6' },
    { key: 'misool', label: { ID: 'Kep. Misool', EN: 'Misool Islands' }, value: 5, color: '#ef4444' },
    { key: 'mayalibit', label: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' }, value: 2, color: '#f59e0b' },
    { key: 'fam', label: { ID: 'Kep. Fam', EN: 'Fam Islands' }, value: 3, color: '#8b5cf6' },
];

// ─── Chart titles ──────────────────────────────────────────────────
export const chartTitles = {
    wisatawan: { ID: 'Jumlah Wisatawan', EN: 'Number of Tourists' },
    guide: { ID: 'Jumlah Guide', EN: 'Number of Guides' },
    manta: { ID: 'Jumlah Temuan Manta', EN: 'Manta Sightings' },
};

// ─── Latest findings for summary card ──────────────────────────────
export const latestHabitatFindings = [
    { label: { ID: 'Wisatawan - Dampier', EN: 'Tourist - Dampier' }, location: { ID: 'Perairan Selat Dampier', EN: 'Dampier Strait Waters' }, date: '04 Jan 2025' },
    { label: { ID: 'Manta - Arborek', EN: 'Manta - Arborek' }, location: { ID: 'Perairan Arborek', EN: 'Arborek Waters' }, date: '05 Jan 2025' },
    { label: { ID: 'Guide - Misool', EN: 'Guide - Misool' }, location: { ID: 'Perairan Kep. Misool', EN: 'Misool Islands Waters' }, date: '08 Jan 2025' },
    { label: { ID: 'Manta - Dampier', EN: 'Manta - Dampier' }, location: { ID: 'Perairan Selat Dampier', EN: 'Dampier Strait Waters' }, date: '13 Jan 2025' },
    { label: { ID: 'Wisatawan - Fam', EN: 'Tourist - Fam' }, location: { ID: 'Perairan Kep. Fam', EN: 'Fam Islands Waters' }, date: '15 Jan 2025' },
    { label: { ID: 'Wisatawan - Mayalibit', EN: 'Tourist - Mayalibit' }, location: { ID: 'Perairan Teluk Mayalibit', EN: 'Mayalibit Bay Waters' }, date: '10 Jan 2025' },
];

// ─── Megafauna Monitoring Data ─────────────────────────────────────
export const megafaunaMonitoringData = [
    // Pari Manta
    {
        megafaunaCategory: 'mega-pari-manta',
        lokasiMonitoring: 'Manta Sandy',
        petugasManta1: 'Esron Mambrasar',
        petugasManta2: '-',
        petugasManta3: '-',
        lintang: -0.56,
        bujur: 130.52,
        tanggalWaktu: '10/8/25, 12:00 PM',
        hiddenTgl: '08/10/25 14:00',
        monitoringId: '11.15.5.6',
        punyaKartuTLPJL: '-',
        validasiData: 'TTD',
        logo02: '-',
    },
    {
        megafaunaCategory: 'mega-pari-manta',
        lokasiMonitoring: 'Manta Ridge',
        petugasManta1: 'Yohannes Werfete',
        petugasManta2: 'Albertus Dawir',
        petugasManta3: '-',
        lintang: -0.50,
        bujur: 130.63,
        tanggalWaktu: '10/9/25, 09:30 AM',
        hiddenTgl: '09/10/25 11:30',
        monitoringId: '11.15.5.7',
        punyaKartuTLPJL: 'Ya',
        validasiData: 'TTD',
        logo02: '-',
    },
    {
        megafaunaCategory: 'mega-pari-manta',
        lokasiMonitoring: 'Blue Magic',
        petugasManta1: 'Paulus Dimara',
        petugasManta2: '-',
        petugasManta3: '-',
        lintang: -0.48,
        bujur: 130.58,
        tanggalWaktu: '10/10/25, 10:00 AM',
        hiddenTgl: '10/10/25 12:00',
        monitoringId: '11.15.5.8',
        punyaKartuTLPJL: '-',
        validasiData: 'Valid',
        logo02: '-',
    },
    // Penyu
    {
        megafaunaCategory: 'mega-penyu',
        lokasiMonitoring: 'Sawinggrai',
        petugasManta1: 'Matias Dimara',
        petugasManta2: 'Ruben Mambrasar',
        petugasManta3: '-',
        lintang: -0.53,
        bujur: 130.67,
        tanggalWaktu: '10/7/25, 08:00 AM',
        hiddenTgl: '07/10/25 10:00',
        monitoringId: '12.10.3.1',
        punyaKartuTLPJL: 'Ya',
        validasiData: 'Valid',
        logo02: '-',
    },
    {
        megafaunaCategory: 'mega-penyu',
        lokasiMonitoring: 'Yenbuba',
        petugasManta1: 'Nikodemus Waran',
        petugasManta2: '-',
        petugasManta3: '-',
        lintang: -0.57,
        bujur: 130.64,
        tanggalWaktu: '10/8/25, 07:30 AM',
        hiddenTgl: '08/10/25 09:30',
        monitoringId: '12.10.3.2',
        punyaKartuTLPJL: '-',
        validasiData: 'TTD',
        logo02: '-',
    },
    // Lumba-lumba
    {
        megafaunaCategory: 'mega-lumba-lumba',
        lokasiMonitoring: 'Kabui Bay',
        petugasManta1: 'Anton Marani',
        petugasManta2: 'Yulianus Bawer',
        petugasManta3: 'Simon Dawir',
        lintang: -0.41,
        bujur: 130.55,
        tanggalWaktu: '10/11/25, 06:00 AM',
        hiddenTgl: '11/10/25 08:00',
        monitoringId: '13.08.2.1',
        punyaKartuTLPJL: '-',
        validasiData: 'Valid',
        logo02: '-',
    },
    // Hiu Paus
    {
        megafaunaCategory: 'mega-hiu-paus',
        lokasiMonitoring: 'Cenderawasih Bay',
        petugasManta1: 'Hendrik Ronsumbre',
        petugasManta2: '-',
        petugasManta3: '-',
        lintang: -0.72,
        bujur: 130.44,
        tanggalWaktu: '10/12/25, 11:00 AM',
        hiddenTgl: '12/10/25 13:00',
        monitoringId: '14.05.1.1',
        punyaKartuTLPJL: 'Ya',
        validasiData: 'TTD',
        logo02: '-',
    },
    // Dugong
    {
        megafaunaCategory: 'mega-dugong',
        lokasiMonitoring: 'Friwen Wall',
        petugasManta1: 'Salmon Msen',
        petugasManta2: '-',
        petugasManta3: '-',
        lintang: -0.54,
        bujur: 130.71,
        tanggalWaktu: '10/6/25, 02:00 PM',
        hiddenTgl: '06/10/25 16:00',
        monitoringId: '15.03.4.1',
        punyaKartuTLPJL: '-',
        validasiData: 'Valid',
        logo02: '-',
    },
    // Hiu
    {
        megafaunaCategory: 'mega-hiu',
        lokasiMonitoring: 'Cape Kri',
        petugasManta1: 'Dominggus Mambrasar',
        petugasManta2: 'Yafet Dimara',
        petugasManta3: '-',
        lintang: -0.55,
        bujur: 130.69,
        tanggalWaktu: '10/13/25, 09:00 AM',
        hiddenTgl: '13/10/25 11:00',
        monitoringId: '16.02.7.1',
        punyaKartuTLPJL: 'Ya',
        validasiData: 'Valid',
        logo02: '-',
    },
    {
        megafaunaCategory: 'mega-hiu',
        lokasiMonitoring: 'Melissa\'s Garden',
        petugasManta1: 'Isak Marani',
        petugasManta2: '-',
        petugasManta3: '-',
        lintang: -0.60,
        bujur: 130.45,
        tanggalWaktu: '10/14/25, 08:30 AM',
        hiddenTgl: '14/10/25 10:30',
        monitoringId: '16.02.7.2',
        punyaKartuTLPJL: '-',
        validasiData: 'TTD',
        logo02: '-',
    },
    // Paus
    {
        megafaunaCategory: 'mega-paus',
        lokasiMonitoring: 'Wayag',
        petugasManta1: 'Markus Werfete',
        petugasManta2: 'Tomas Bawer',
        petugasManta3: '-',
        lintang: -0.24,
        bujur: 130.05,
        tanggalWaktu: '10/5/25, 03:00 PM',
        hiddenTgl: '05/10/25 17:00',
        monitoringId: '17.01.9.1',
        punyaKartuTLPJL: '-',
        validasiData: 'Valid',
        logo02: '-',
    },
    // Lainnya
    {
        megafaunaCategory: 'mega-lainnya',
        lokasiMonitoring: 'Arborek Jetty',
        petugasManta1: 'Benediktus Mambrasar',
        petugasManta2: '-',
        petugasManta3: '-',
        lintang: -0.49,
        bujur: 130.61,
        tanggalWaktu: '10/15/25, 10:30 AM',
        hiddenTgl: '15/10/25 12:30',
        monitoringId: '18.06.8.1',
        punyaKartuTLPJL: 'Ya',
        validasiData: 'TTD',
        logo02: '-',
    },
];

export const TRANSPARENCY_OPTIONS = [
    { key: 'wisatawan', label: 'Jumlah Wisatawan' },
    { key: 'guide', label: 'Jumlah Guide' },
    { key: 'manta', label: 'Temuan Manta' },
    { key: 'pelanggaran', label: 'Total Pelanggaran' },
];

export const EMBED_MAP_CONTAINER_CLASS =
    'min-h-[22rem] h-[22rem] sm:h-[26rem] md:h-[30rem] lg:h-[34rem] xl:h-full';

const HABITAT_APPROVAL_DELAY_SECONDS = {
    H001: 52240,
    H002: 61810,
    H003: 48755,
    H004: 56620,
};

export function resolveHabitatApprovalDelaySeconds(reportId) {
    return HABITAT_APPROVAL_DELAY_SECONDS[reportId] ?? 0;
}

export function getPercentage(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

export function buildInitialHabitatReportDraft(record) {
    if (!record) return null;

    return {
        attendanceKoordinator: record.koordinatorLabel || '-',
        attendancePencatatPosisi: 'Yustus Yoiwe',
        attendancePencatatPemanfaatan: 'Sergius Enemi',
        fuelLiters: '80',
        fuelNotes: 'BBM monitoring habitat',
        restStop: record.locationLabel || '-',
        routeDescription: record.locationLabel || '-',
        hasFinding: record.hasMantaFinding ? 'Ada' : 'Tidak Ada',
        violationStatus: record.hasViolation ? 'Ada' : 'Tidak Ada',
        coordinateText: Number.isFinite(record.lat) && Number.isFinite(record.lng)
            ? `${record.lat.toFixed(4)}, ${record.lng.toFixed(4)}`
            : '-',
        gpsId: record.id || '-',
        findingLocationName: record.locationLabel || record.label || '-',
    };
}
