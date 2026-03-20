// RUM (Resources Use Monitoring) Data
// Dummy data for Pemantauan Pemanfaatan SDA dashboard
// Structure mirrors sispandalwasData.js for consistency
import { photoUrls } from '@/assets/image';
import {
    findOptionValueByLabel,
    getDateValue,
    parseNumericCoordinate,
} from '@/utils/monitoringFilterUtils';
import { KKP_OPTIONS, POS_OPTIONS, mapCenter, mapZoom } from './sispandalwasData';

// ─── Kawasan Konservasi (KKP) options (reuse from sispandalwas) ────
export { KKP_OPTIONS, POS_OPTIONS, mapCenter, mapZoom };

// ─── RUM Summary statistics ────────────────────────────────────────
export const rumSummary = {
    totalPatroli: 96,
    sumberdayaTidakTetap: 214,
    sumberdayaTetap: 37,
    megafauna: 58,
};

// ─── RUM patrol / monitoring points on map ─────────────────────────
export const rumPoints = [
    { id: 'R001', lat: -0.44, lng: 130.60, type: 'fisherman', label: 'Nelayan Tangkap #1', zone: 'selat-dampier', pos: 'pos-yenbekwan', date: '2025-01-04' },
    { id: 'R002', lat: -0.52, lng: 130.65, type: 'fisherman', label: 'Nelayan Tangkap #2', zone: 'selat-dampier', pos: 'pos-yenadwak', date: '2025-01-06' },
    { id: 'R003', lat: -1.86, lng: 130.22, type: 'fisherman', label: 'Nelayan Tangkap #3', zone: 'kepulauan-misool', pos: 'pos-ya-lapale', date: '2025-01-08' },
    { id: 'R004', lat: -0.34, lng: 130.80, type: 'tourist', label: 'Wisatawan Domestik', zone: 'teluk-mayalibit', pos: 'pos-warsowes', date: '2025-01-09' },
    { id: 'R005', lat: 0.03, lng: 131.08, type: 'megafauna', label: 'Pari Manta', zone: 'kepulauan-ayau-asia', pos: 'pos-dorehkar', date: '2025-01-11' },
    { id: 'R006', lat: -0.48, lng: 130.62, type: 'homestay', label: 'Homestay Arborek', zone: 'selat-dampier', pos: 'pos-yenbekwan', date: '2025-01-05' },
    { id: 'R007', lat: -1.90, lng: 130.28, type: 'megafauna', label: 'Penyu Hijau', zone: 'kepulauan-misool', pos: 'pos-ya-lapale', date: '2025-01-12' },
    { id: 'R008', lat: -0.30, lng: 130.82, type: 'fisherman', label: 'Nelayan Tangkap #4', zone: 'teluk-mayalibit', pos: 'pos-warsowes', date: '2025-01-10' },
    { id: 'R009', lat: -0.58, lng: 130.56, type: 'tourist', label: 'Wisatawan Mancanegara', zone: 'selat-dampier', pos: 'pos-yenadwak', date: '2025-01-13' },
    { id: 'R010', lat: -0.72, lng: 130.44, type: 'megafauna', label: 'Lumba-lumba', zone: 'kepulauan-fam', pos: 'pos-mioskor', date: '2025-01-15' },
    { id: 'R011', lat: -0.46, lng: 130.66, type: 'homestay', label: 'Resort Kri Island', zone: 'selat-dampier', pos: 'pos-yenbekwan', date: '2025-01-07' },
    { id: 'R012', lat: -1.82, lng: 130.32, type: 'fisherman', label: 'Nelayan Tangkap #5', zone: 'kepulauan-misool', pos: 'pos-ya-lapale', date: '2025-01-14' },
];

// ─── Pemanfaatan Sumberdaya Tidak Tetap (Non-Fixed Resources) ──────
export const sumberdayaTidakTetapData = [
    { zone: { ID: 'Selat Dampier', EN: 'Dampier Strait' }, nelayan: 42, penduduk: 18, wisatawanDomestik: 35, wisatawanMancanegara: 28, color: '#3b82f6' },
    { zone: { ID: 'Kep. Misool', EN: 'Misool Islands' }, nelayan: 38, penduduk: 12, wisatawanDomestik: 15, wisatawanMancanegara: 22, color: '#ef4444' },
    { zone: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' }, nelayan: 25, penduduk: 20, wisatawanDomestik: 8, wisatawanMancanegara: 5, color: '#f59e0b' },
    { zone: { ID: 'Kep. Ayau-Asia', EN: 'Ayau-Asia Islands' }, nelayan: 15, penduduk: 10, wisatawanDomestik: 3, wisatawanMancanegara: 12, color: '#84cc16' },
    { zone: { ID: 'Kep. Kofiau-Boo', EN: 'Kofiau-Boo Islands' }, nelayan: 20, penduduk: 8, wisatawanDomestik: 5, wisatawanMancanegara: 2, color: '#a3e635' },
    { zone: { ID: 'Kep. Fam', EN: 'Fam Islands' }, nelayan: 12, penduduk: 6, wisatawanDomestik: 10, wisatawanMancanegara: 18, color: '#06b6d4' },
    { zone: { ID: 'Misool Utara', EN: 'North Misool' }, nelayan: 18, penduduk: 9, wisatawanDomestik: 4, wisatawanMancanegara: 3, color: '#8b5cf6' },
];

export const sumberdayaTidakTetapTypes = [
    { key: 'nelayan', label: { ID: 'Nelayan', EN: 'Fishermen' }, color: '#3b82f6' },
    { key: 'penduduk', label: { ID: 'Penduduk', EN: 'Residents' }, color: '#22c55e' },
    { key: 'wisatawanDomestik', label: { ID: 'Wisatawan Domestik', EN: 'Domestic Tourists' }, color: '#f59e0b' },
    { key: 'wisatawanMancanegara', label: { ID: 'Wisatawan Mancanegara', EN: 'International Tourists' }, color: '#ef4444' },
];

// ─── Sumberdaya Tetap (Fixed Resources) ────────────────────────────
export const sumberdayaTetapData = [
    { zone: { ID: 'Selat Dampier', EN: 'Dampier Strait' }, homestay: 12, rumberlab: 5, color: '#3b82f6' },
    { zone: { ID: 'Kep. Misool', EN: 'Misool Islands' }, homestay: 6, rumberlab: 3, color: '#ef4444' },
    { zone: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' }, homestay: 3, rumberlab: 2, color: '#f59e0b' },
    { zone: { ID: 'Kep. Ayau-Asia', EN: 'Ayau-Asia Islands' }, homestay: 2, rumberlab: 1, color: '#84cc16' },
    { zone: { ID: 'Kep. Kofiau-Boo', EN: 'Kofiau-Boo Islands' }, homestay: 1, rumberlab: 0, color: '#a3e635' },
    { zone: { ID: 'Kep. Fam', EN: 'Fam Islands' }, homestay: 4, rumberlab: 1, color: '#06b6d4' },
    { zone: { ID: 'Misool Utara', EN: 'North Misool' }, homestay: 2, rumberlab: 1, color: '#8b5cf6' },
];

export const sumberdayaTetapTypes = [
    { key: 'homestay', label: { ID: 'Homestay / Resort', EN: 'Homestay / Resort' }, color: '#f59e0b' },
    { key: 'rumberlab', label: { ID: 'Rumberlab', EN: 'Rumberlab' }, color: '#8b5cf6' },
];

// ─── Megafauna observations ────────────────────────────────────────
export const megafaunaData = [
    { zone: { ID: 'Selat Dampier', EN: 'Dampier Strait' }, hiuPaus: 3, lainnya: 2, lumbaLumba: 8, pariManta: 12, penyu: 6, color: '#3b82f6' },
    { zone: { ID: 'Kep. Misool', EN: 'Misool Islands' }, hiuPaus: 1, lainnya: 3, lumbaLumba: 5, pariManta: 15, penyu: 9, color: '#ef4444' },
    { zone: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' }, hiuPaus: 0, lainnya: 1, lumbaLumba: 3, pariManta: 4, penyu: 2, color: '#f59e0b' },
    { zone: { ID: 'Kep. Ayau-Asia', EN: 'Ayau-Asia Islands' }, hiuPaus: 2, lainnya: 1, lumbaLumba: 2, pariManta: 6, penyu: 3, color: '#84cc16' },
    { zone: { ID: 'Kep. Kofiau-Boo', EN: 'Kofiau-Boo Islands' }, hiuPaus: 0, lainnya: 0, lumbaLumba: 1, pariManta: 3, penyu: 1, color: '#a3e635' },
    { zone: { ID: 'Kep. Fam', EN: 'Fam Islands' }, hiuPaus: 1, lainnya: 2, lumbaLumba: 4, pariManta: 8, penyu: 4, color: '#06b6d4' },
    { zone: { ID: 'Misool Utara', EN: 'North Misool' }, hiuPaus: 0, lainnya: 1, lumbaLumba: 2, pariManta: 5, penyu: 3, color: '#8b5cf6' },
];

export const megafaunaTypes = [
    { key: 'hiuPaus', label: { ID: 'Hiu Paus', EN: 'Whale Shark' }, color: '#8b5cf6' },
    { key: 'lainnya', label: { ID: 'Lainnya', EN: 'Others' }, color: '#64748b' },
    { key: 'lumbaLumba', label: { ID: 'Lumba-lumba', EN: 'Dolphin' }, color: '#6366f1' },
    { key: 'pariManta', label: { ID: 'Pari Manta', EN: 'Manta Ray' }, color: '#3b82f6' },
    { key: 'penyu', label: { ID: 'Penyu', EN: 'Sea Turtle' }, color: '#22c55e' },
];

// ─── Aggregated chart data (simplified bar charts) ─────────────────
export const sdtChartData = [
    { key: 'nelayan', label: { ID: 'Nelayan', EN: 'Fishermen' }, value: 15, color: '#84cc16' },
    { key: 'penduduk', label: { ID: 'Penduduk', EN: 'Residents' }, value: 107, color: '#f59e0b' },
    { key: 'wisatawanDomestik', label: { ID: 'Wisatawan Domestik', EN: 'Domestic Tourists' }, value: 1, color: '#8b5cf6' },
    { key: 'wisatawanMancanegara', label: { ID: 'Wisatawan Mancanegara', EN: 'International Tourists' }, value: 52, color: '#38bdf8' },
];

export const stChartData = [
    { key: 'homestay', label: { ID: 'Homestay/ Resort', EN: 'Homestay / Resort' }, value: 1, color: '#22d3ee' },
    { key: 'rumberlab', label: { ID: 'Rumberlab', EN: 'Rumberlab' }, value: 1, color: '#f87171' },
];

export const megafaunaChartData = [
    { key: 'hiuPaus', label: { ID: 'Hiu Paus', EN: 'Whale Shark' }, value: 1, color: '#ef4444' },
    { key: 'lainnya', label: { ID: 'Lainnya', EN: 'Others' }, value: 1, color: '#9ca3af' },
    { key: 'lumbaLumba', label: { ID: 'Lumba-lumba', EN: 'Dolphin' }, value: 4, color: '#c084fc' },
    { key: 'pariManta', label: { ID: 'Pari Manta', EN: 'Manta Ray' }, value: 4, color: '#a3e635' },
    { key: 'penyu', label: { ID: 'Penyu', EN: 'Sea Turtle' }, value: 1, color: '#fb7185' },
];

export const chartInfoLabels = {
    sdt: { ID: 'INFORMASI PENGGUNA SUMBERDAYA TIDAK TETAP', EN: 'NON-FIXED RESOURCE USER INFORMATION' },
    st: { ID: 'INFORMASI PEMANFAATAN SUMBERDAYA TETAP', EN: 'FIXED RESOURCE UTILIZATION INFORMATION' },
    megafauna: { ID: 'INFORMASI MEGAFAUNA', EN: 'MEGAFAUNA INFORMATION' },
};

export const chartTitles = {
    sdt: { ID: 'Pemanfaat', EN: 'Users' },
    st: { ID: 'Jenis', EN: 'Type' },
    megafauna: { ID: 'Spesies', EN: 'Species' },
};

// ─── Foto Tangkapan (Catch Photos) ─────────────────────────────────
export const fotoTangkapan = [
    {
        id: 'RT001',
        src: photoUrls.foto01,
        caption: { ID: 'Hasil tangkapan ikan campuran', EN: 'Mixed fish catch' },
        summary: {
            areaTangkapan: { ID: 'Perairan Kepulauan Misool', EN: 'Misool Islands Waters' },
            posTangkapan: { ID: 'Pos Kayerepop', EN: 'Kayerepop Post' },
            hasilTangkapan: { ID: 'Ikan Campuran', EN: 'Mixed Fish' },
            panjang: '25 cm',
            jumlah: '13 ekor',
            beratBasah: '8 kg',
            beratKering: '0 kg',
            lamaKerja: '7 jam',
            keterangan: { ID: 'Hasil Tangkapan Ada', EN: 'Catch Available' },
            validasi: { ID: 'Diterima', EN: 'Accepted' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Misool', EN: 'Misool Islands' },
            posTemuan: { ID: 'Pos Kayerepop', EN: 'Kayerepop Post' },
            tanggal: '04 Januari 2025',
            idGps: 'GPS-2025-0104-001',
            lintang: '-1.8600°',
            bujur: '130.2200°',
            namaLokasi: { ID: 'Perairan Kepulauan Misool', EN: 'Misool Islands Waters' },
        },
    },
    {
        id: 'RT002',
        src: photoUrls.foto02,
        caption: { ID: 'Tangkapan ikan kerapu', EN: 'Grouper catch' },
        summary: {
            areaTangkapan: { ID: 'Perairan Selat Dampier', EN: 'Dampier Strait Waters' },
            posTangkapan: { ID: 'Pos Arborek', EN: 'Arborek Post' },
            hasilTangkapan: { ID: 'Ikan Kerapu', EN: 'Grouper' },
            panjang: '35 cm',
            jumlah: '5 ekor',
            beratBasah: '12 kg',
            beratKering: '0 kg',
            lamaKerja: '5 jam',
            keterangan: { ID: 'Hasil Tangkapan Ada', EN: 'Catch Available' },
            validasi: { ID: 'Diterima', EN: 'Accepted' },
        },
        detail: {
            kawasanTemuan: { ID: 'Selat Dampier', EN: 'Dampier Strait' },
            posTemuan: { ID: 'Pos Arborek', EN: 'Arborek Post' },
            tanggal: '06 Januari 2025',
            idGps: 'GPS-2025-0106-001',
            lintang: '-0.5200°',
            bujur: '130.6500°',
            namaLokasi: { ID: 'Perairan Selat Dampier', EN: 'Dampier Strait Waters' },
        },
    },
    {
        id: 'RT003',
        src: photoUrls.foto03,
        caption: { ID: 'Tangkapan ikan baronang', EN: 'Rabbitfish catch' },
        summary: {
            areaTangkapan: { ID: 'Perairan Teluk Mayalibit', EN: 'Mayalibit Bay Waters' },
            posTangkapan: { ID: 'Pos Warsowes', EN: 'Warsowes Post' },
            hasilTangkapan: { ID: 'Ikan Baronang', EN: 'Rabbitfish' },
            panjang: '20 cm',
            jumlah: '22 ekor',
            beratBasah: '6 kg',
            beratKering: '0 kg',
            lamaKerja: '4 jam',
            keterangan: { ID: 'Hasil Tangkapan Ada', EN: 'Catch Available' },
            validasi: { ID: 'Diterima', EN: 'Accepted' },
        },
        detail: {
            kawasanTemuan: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' },
            posTemuan: { ID: 'Pos Warsowes', EN: 'Warsowes Post' },
            tanggal: '08 Januari 2025',
            idGps: 'GPS-2025-0108-001',
            lintang: '-0.3400°',
            bujur: '130.8000°',
            namaLokasi: { ID: 'Perairan Teluk Mayalibit', EN: 'Mayalibit Bay Waters' },
        },
    },
    {
        id: 'RT004',
        src: photoUrls.foto04,
        caption: { ID: 'Tangkapan ikan tuna sirip kuning', EN: 'Yellowfin tuna catch' },
        summary: {
            areaTangkapan: { ID: 'Perairan Kepulauan Ayau-Asia', EN: 'Ayau-Asia Islands Waters' },
            posTangkapan: { ID: 'Pos Dorehkar', EN: 'Dorehkar Post' },
            hasilTangkapan: { ID: 'Ikan Tuna Sirip Kuning', EN: 'Yellowfin Tuna' },
            panjang: '55 cm',
            jumlah: '3 ekor',
            beratBasah: '18 kg',
            beratKering: '0 kg',
            lamaKerja: '8 jam',
            keterangan: { ID: 'Hasil Tangkapan Ada', EN: 'Catch Available' },
            validasi: { ID: 'Diterima', EN: 'Accepted' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Ayau-Asia', EN: 'Ayau-Asia Islands' },
            posTemuan: { ID: 'Pos Dorehkar', EN: 'Dorehkar Post' },
            tanggal: '10 Januari 2025',
            idGps: 'GPS-2025-0110-001',
            lintang: '0.0300°',
            bujur: '131.0800°',
            namaLokasi: { ID: 'Perairan Kepulauan Ayau-Asia', EN: 'Ayau-Asia Islands Waters' },
        },
    },
    {
        id: 'RT005',
        src: photoUrls.foto05,
        caption: { ID: 'Tangkapan ikan campuran Fam', EN: 'Mixed catch Fam' },
        summary: {
            areaTangkapan: { ID: 'Perairan Kepulauan Fam', EN: 'Fam Islands Waters' },
            posTangkapan: { ID: 'Pos Mioskor', EN: 'Mioskor Post' },
            hasilTangkapan: { ID: 'Ikan Campuran', EN: 'Mixed Fish' },
            panjang: '18 cm',
            jumlah: '30 ekor',
            beratBasah: '10 kg',
            beratKering: '0 kg',
            lamaKerja: '6 jam',
            keterangan: { ID: 'Hasil Tangkapan Ada', EN: 'Catch Available' },
            validasi: { ID: 'Diterima', EN: 'Accepted' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Fam', EN: 'Fam Islands' },
            posTemuan: { ID: 'Pos Mioskor', EN: 'Mioskor Post' },
            tanggal: '13 Januari 2025',
            idGps: 'GPS-2025-0113-001',
            lintang: '-0.7200°',
            bujur: '130.4400°',
            namaLokasi: { ID: 'Perairan Kepulauan Fam', EN: 'Fam Islands Waters' },
        },
    },
    {
        id: 'RT006',
        src: photoUrls.foto06,
        caption: { ID: 'Tangkapan ikan kakap merah', EN: 'Red snapper catch' },
        summary: {
            areaTangkapan: { ID: 'Perairan Misool Utara', EN: 'North Misool Waters' },
            posTangkapan: { ID: 'Pos Folpulo', EN: 'Folpulo Post' },
            hasilTangkapan: { ID: 'Ikan Kakap Merah', EN: 'Red Snapper' },
            panjang: '40 cm',
            jumlah: '8 ekor',
            beratBasah: '15 kg',
            beratKering: '0 kg',
            lamaKerja: '9 jam',
            keterangan: { ID: 'Hasil Tangkapan Ada', EN: 'Catch Available' },
            validasi: { ID: 'Diterima', EN: 'Accepted' },
        },
        detail: {
            kawasanTemuan: { ID: 'Misool Utara', EN: 'North Misool' },
            posTemuan: { ID: 'Pos Folpulo', EN: 'Folpulo Post' },
            tanggal: '15 Januari 2025',
            idGps: 'GPS-2025-0115-001',
            lintang: '-1.8200°',
            bujur: '130.3200°',
            namaLokasi: { ID: 'Perairan Misool Utara', EN: 'North Misool Waters' },
        },
    },
];

// ─── Foto Megafauna ────────────────────────────────────────────────
export const fotoMegafauna = [
    {
        id: 'RM001',
        src: photoUrls.foto03,
        caption: { ID: 'Pari Manta di perairan Dampier', EN: 'Manta Ray in Dampier waters' },
        summary: {
            lokasi: { ID: 'Perairan Arborek, Selat Dampier', EN: 'Arborek Waters, Dampier Strait' },
            spesies: { ID: 'Pari Manta', EN: 'Manta Ray' },
            jumlah: '3 ekor',
            waktu: '05 Jan 2025, 09:30 WITA',
            kondisi: { ID: 'Sehat', EN: 'Healthy' },
        },
        detail: {
            kawasanTemuan: { ID: 'Selat Dampier', EN: 'Dampier Strait' },
            posTemuan: { ID: 'Pos Arborek', EN: 'Arborek Post' },
            tanggal: '05 Januari 2025',
            idGps: 'GPS-2025-0105-001',
            lintang: '-0.4800°',
            bujur: '130.6200°',
            namaLokasi: { ID: 'Perairan Arborek, Selat Dampier', EN: 'Arborek Waters, Dampier Strait' },
        },
    },
    {
        id: 'RM002',
        src: photoUrls.foto05,
        caption: { ID: 'Penyu hijau di Kepulauan Misool', EN: 'Green turtle in Misool Islands' },
        summary: {
            lokasi: { ID: 'Perairan Selatan Misool', EN: 'South Misool Waters' },
            spesies: { ID: 'Penyu Hijau', EN: 'Green Turtle' },
            jumlah: '2 ekor',
            waktu: '12 Jan 2025, 14:00 WITA',
            kondisi: { ID: 'Sehat', EN: 'Healthy' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Misool', EN: 'Misool Islands' },
            posTemuan: { ID: 'Pos Ya Lapale', EN: 'Ya Lapale Post' },
            tanggal: '12 Januari 2025',
            idGps: 'GPS-2025-0112-001',
            lintang: '-1.9500°',
            bujur: '130.1800°',
            namaLokasi: { ID: 'Perairan Selatan Misool', EN: 'South Misool Waters' },
        },
    },
    {
        id: 'RM003',
        src: photoUrls.foto01,
        caption: { ID: 'Lumba-lumba di Kepulauan Fam', EN: 'Dolphins in Fam Islands' },
        summary: {
            lokasi: { ID: 'Perairan Pulau Penemu, Fam', EN: 'Penemu Island Waters, Fam' },
            spesies: { ID: 'Lumba-lumba', EN: 'Dolphin' },
            jumlah: '5 ekor',
            waktu: '15 Jan 2025, 07:45 WITA',
            kondisi: { ID: 'Sehat', EN: 'Healthy' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Fam', EN: 'Fam Islands' },
            posTemuan: { ID: 'Pos Mioskor', EN: 'Mioskor Post' },
            tanggal: '15 Januari 2025',
            idGps: 'GPS-2025-0115-002',
            lintang: '-0.7200°',
            bujur: '130.4400°',
            namaLokasi: { ID: 'Perairan Pulau Penemu, Fam', EN: 'Penemu Island Waters, Fam' },
        },
    },
    {
        id: 'RM004',
        src: photoUrls.foto04,
        caption: { ID: 'Hiu paus di perairan Ayau', EN: 'Whale shark in Ayau waters' },
        summary: {
            lokasi: { ID: 'Perairan Kepulauan Ayau-Asia', EN: 'Ayau-Asia Islands Waters' },
            spesies: { ID: 'Hiu Paus', EN: 'Whale Shark' },
            jumlah: '1 ekor',
            waktu: '11 Jan 2025, 11:15 WITA',
            kondisi: { ID: 'Sehat', EN: 'Healthy' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Ayau-Asia', EN: 'Ayau-Asia Islands' },
            posTemuan: { ID: 'Pos Dorehkar', EN: 'Dorehkar Post' },
            tanggal: '11 Januari 2025',
            idGps: 'GPS-2025-0111-001',
            lintang: '0.0300°',
            bujur: '131.0800°',
            namaLokasi: { ID: 'Perairan Kepulauan Ayau-Asia', EN: 'Ayau-Asia Islands Waters' },
        },
    },
    {
        id: 'RM005',
        src: photoUrls.foto02,
        caption: { ID: 'Pari Manta di Misool', EN: 'Manta Ray in Misool' },
        summary: {
            lokasi: { ID: 'Perairan Barat Misool', EN: 'West Misool Waters' },
            spesies: { ID: 'Pari Manta', EN: 'Manta Ray' },
            jumlah: '4 ekor',
            waktu: '08 Jan 2025, 10:00 WITA',
            kondisi: { ID: 'Sehat', EN: 'Healthy' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Misool', EN: 'Misool Islands' },
            posTemuan: { ID: 'Pos Ya Lapale', EN: 'Ya Lapale Post' },
            tanggal: '08 Januari 2025',
            idGps: 'GPS-2025-0108-002',
            lintang: '-1.9000°',
            bujur: '130.2800°',
            namaLokasi: { ID: 'Perairan Barat Misool', EN: 'West Misool Waters' },
        },
    },
    {
        id: 'RM006',
        src: photoUrls.foto06,
        caption: { ID: 'Penyu di Teluk Mayalibit', EN: 'Turtle in Mayalibit Bay' },
        summary: {
            lokasi: { ID: 'Perairan Teluk Mayalibit', EN: 'Mayalibit Bay Waters' },
            spesies: { ID: 'Penyu Sisik', EN: 'Hawksbill Turtle' },
            jumlah: '1 ekor',
            waktu: '09 Jan 2025, 16:20 WITA',
            kondisi: { ID: 'Sehat', EN: 'Healthy' },
        },
        detail: {
            kawasanTemuan: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' },
            posTemuan: { ID: 'Pos Warsowes', EN: 'Warsowes Post' },
            tanggal: '09 Januari 2025',
            idGps: 'GPS-2025-0109-001',
            lintang: '-0.3000°',
            bujur: '130.8200°',
            namaLokasi: { ID: 'Perairan Teluk Mayalibit', EN: 'Mayalibit Bay Waters' },
        },
    },
];

// ─── Foto Sumberdaya Tetap (Fixed Resources Photos) ────────────────
export const fotoSumberdayaTetap = [
    {
        id: 'RS001',
        src: photoUrls.foto02,
        caption: { ID: 'Homestay di Arborek', EN: 'Homestay in Arborek' },
        summary: {
            lokasi: { ID: 'Pulau Arborek, Selat Dampier', EN: 'Arborek Island, Dampier Strait' },
            jenis: { ID: 'Homestay', EN: 'Homestay' },
            kapasitas: '8 kamar',
            kondisi: { ID: 'Baik', EN: 'Good' },
        },
        detail: {
            kawasanTemuan: { ID: 'Selat Dampier', EN: 'Dampier Strait' },
            posTemuan: { ID: 'Pos Arborek', EN: 'Arborek Post' },
            tanggal: '05 Januari 2025',
            idGps: 'GPS-2025-0105-002',
            lintang: '-0.4800°',
            bujur: '130.6200°',
            namaLokasi: { ID: 'Pulau Arborek, Selat Dampier', EN: 'Arborek Island, Dampier Strait' },
        },
    },
    {
        id: 'RS002',
        src: photoUrls.foto04,
        caption: { ID: 'Resort di Pulau Kri', EN: 'Resort in Kri Island' },
        summary: {
            lokasi: { ID: 'Pulau Kri, Selat Dampier', EN: 'Kri Island, Dampier Strait' },
            jenis: { ID: 'Resort', EN: 'Resort' },
            kapasitas: '15 kamar',
            kondisi: { ID: 'Baik', EN: 'Good' },
        },
        detail: {
            kawasanTemuan: { ID: 'Selat Dampier', EN: 'Dampier Strait' },
            posTemuan: { ID: 'Pos Yenbekwan', EN: 'Yenbekwan Post' },
            tanggal: '07 Januari 2025',
            idGps: 'GPS-2025-0107-001',
            lintang: '-0.4600°',
            bujur: '130.6600°',
            namaLokasi: { ID: 'Pulau Kri, Selat Dampier', EN: 'Kri Island, Dampier Strait' },
        },
    },
    {
        id: 'RS003',
        src: photoUrls.foto06,
        caption: { ID: 'Rumberlab di Misool', EN: 'Rumberlab in Misool' },
        summary: {
            lokasi: { ID: 'Perairan Misool Selatan', EN: 'South Misool Waters' },
            jenis: { ID: 'Rumberlab', EN: 'Rumberlab' },
            kapasitas: '-',
            kondisi: { ID: 'Baik', EN: 'Good' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Misool', EN: 'Misool Islands' },
            posTemuan: { ID: 'Pos Ya Lapale', EN: 'Ya Lapale Post' },
            tanggal: '10 Januari 2025',
            idGps: 'GPS-2025-0110-002',
            lintang: '-1.9000°',
            bujur: '130.2800°',
            namaLokasi: { ID: 'Perairan Misool Selatan', EN: 'South Misool Waters' },
        },
    },
    {
        id: 'RS004',
        src: photoUrls.foto01,
        caption: { ID: 'Homestay di Teluk Mayalibit', EN: 'Homestay in Mayalibit Bay' },
        summary: {
            lokasi: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' },
            jenis: { ID: 'Homestay', EN: 'Homestay' },
            kapasitas: '5 kamar',
            kondisi: { ID: 'Cukup Baik', EN: 'Fairly Good' },
        },
        detail: {
            kawasanTemuan: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' },
            posTemuan: { ID: 'Pos Warsowes', EN: 'Warsowes Post' },
            tanggal: '12 Januari 2025',
            idGps: 'GPS-2025-0112-002',
            lintang: '-0.3000°',
            bujur: '130.8200°',
            namaLokasi: { ID: 'Teluk Mayalibit', EN: 'Mayalibit Bay' },
        },
    },
    {
        id: 'RS005',
        src: photoUrls.foto03,
        caption: { ID: 'Resort di Kepulauan Fam', EN: 'Resort in Fam Islands' },
        summary: {
            lokasi: { ID: 'Pulau Penemu, Kepulauan Fam', EN: 'Penemu Island, Fam Islands' },
            jenis: { ID: 'Resort', EN: 'Resort' },
            kapasitas: '10 kamar',
            kondisi: { ID: 'Baik', EN: 'Good' },
        },
        detail: {
            kawasanTemuan: { ID: 'Kepulauan Fam', EN: 'Fam Islands' },
            posTemuan: { ID: 'Pos Mioskor', EN: 'Mioskor Post' },
            tanggal: '14 Januari 2025',
            idGps: 'GPS-2025-0114-001',
            lintang: '-0.7200°',
            bujur: '130.4400°',
            namaLokasi: { ID: 'Pulau Penemu, Kepulauan Fam', EN: 'Penemu Island, Fam Islands' },
        },
    },
    {
        id: 'RS006',
        src: photoUrls.foto05,
        caption: { ID: 'Homestay di Sawingrai', EN: 'Homestay in Sawingrai' },
        summary: {
            lokasi: { ID: 'Sawingrai, Selat Dampier', EN: 'Sawingrai, Dampier Strait' },
            jenis: { ID: 'Homestay', EN: 'Homestay' },
            kapasitas: '6 kamar',
            kondisi: { ID: 'Baik', EN: 'Good' },
        },
        detail: {
            kawasanTemuan: { ID: 'Selat Dampier', EN: 'Dampier Strait' },
            posTemuan: { ID: 'Pos Yenadwak', EN: 'Yenadwak Post' },
            tanggal: '16 Januari 2025',
            idGps: 'GPS-2025-0116-001',
            lintang: '-0.4600°',
            bujur: '130.6800°',
            namaLokasi: { ID: 'Sawingrai, Selat Dampier', EN: 'Sawingrai, Dampier Strait' },
        },
    },
];

// ─── Latest findings for summary card ──────────────────────────────
export const latestFindings = [
    { label: { ID: 'Ikan Campuran - Misool', EN: 'Mixed Fish - Misool' }, location: { ID: 'Perairan Kepulauan Misool', EN: 'Misool Islands Waters' }, date: '04 Jan 2025' },
    { label: { ID: 'Ikan Kerapu - Dampier', EN: 'Grouper - Dampier' }, location: { ID: 'Perairan Selat Dampier', EN: 'Dampier Strait Waters' }, date: '06 Jan 2025' },
    { label: { ID: 'Ikan Baronang - Mayalibit', EN: 'Rabbitfish - Mayalibit' }, location: { ID: 'Perairan Teluk Mayalibit', EN: 'Mayalibit Bay Waters' }, date: '08 Jan 2025' },
    { label: { ID: 'Pari Manta - Arborek', EN: 'Manta Ray - Arborek' }, location: { ID: 'Perairan Arborek, Selat Dampier', EN: 'Arborek Waters, Dampier Strait' }, date: '05 Jan 2025' },
    { label: { ID: 'Penyu Hijau - Misool', EN: 'Green Turtle - Misool' }, location: { ID: 'Perairan Selatan Misool', EN: 'South Misool Waters' }, date: '12 Jan 2025' },
    { label: { ID: 'Lumba-lumba - Fam', EN: 'Dolphins - Fam' }, location: { ID: 'Perairan Pulau Penemu, Fam', EN: 'Penemu Island Waters, Fam' }, date: '15 Jan 2025' },
];

export const RUM_CATEGORY_TABS = [
    { key: 'tetap', label: 'Sumber Daya Tetap' },
    { key: 'tidak-tetap', label: 'Sumber Daya Tidak Tetap' },
    { key: 'megafauna', label: 'Megafauna' },
];

export const RUM_FEED_BADGE_CONFIG = {
    tetap: {
        label: 'Sumber Daya Tetap',
        activeClass: 'bg-[#2563eb]',
        inactiveClass: 'bg-[#2563eb]',
    },
    'tidak-tetap': {
        label: 'Sumber Daya Tidak Tetap',
        activeClass: 'bg-[#d97706]',
        inactiveClass: 'bg-[#d97706]',
    },
    megafauna: {
        label: 'Megafauna',
        activeClass: 'bg-[#16a34a]',
        inactiveClass: 'bg-[#16a34a]',
    },
};

export const EMBED_MAP_CONTAINER_CLASS =
    'min-h-[22rem] h-[22rem] sm:h-[26rem] md:h-[30rem] lg:h-[34rem] xl:h-full';

const RUM_APPROVAL_DELAY_SECONDS = {
    RT001: 98015,
    RT002: 88740,
    RT003: 93255,
    RT004: 84620,
    RT005: 90185,
    RT006: 95435,
    RM001: 74120,
    RM002: 79350,
    RM003: 82640,
    RM004: 76825,
    RM005: 81210,
    RM006: 69980,
    RS001: 105420,
    RS002: 97240,
    RS003: 91105,
    RS004: 86830,
    RS005: 83495,
    RS006: 100560,
};

export const RUM_FUEL_USAGE_LITERS_PER_POINT = 145.25;

const RUM_REPORT_META = {
    RT001: { koordinatorLabel: 'Nataniel Waran', speedboatLabel: 'Misool Jaya', statusKey: 'incoming' },
    RT002: { koordinatorLabel: 'Meldus Omboru', speedboatLabel: 'Mangku Bumi', statusKey: 'pending' },
    RT003: { koordinatorLabel: 'Paulus Werfete', speedboatLabel: 'Mayalibit Indah', statusKey: 'approved' },
    RT004: { koordinatorLabel: 'Nikolaus Yarangga', speedboatLabel: 'Ayau Bahari', statusKey: 'incoming' },
    RT005: { koordinatorLabel: 'Dominggus Waran', speedboatLabel: 'Fam Lestari', statusKey: 'approved' },
    RT006: { koordinatorLabel: 'Yulianus Bawer', speedboatLabel: 'Misool Utara', statusKey: 'approved' },
    RS001: { koordinatorLabel: 'Yulianus Werfete', speedboatLabel: 'Kri Bumi', statusKey: 'incoming' },
    RS002: { koordinatorLabel: 'Meldus Omboru', speedboatLabel: 'Mangku Bumi', statusKey: 'pending' },
    RS003: { koordinatorLabel: 'Niko Waran', speedboatLabel: 'Misool Jaya', statusKey: 'approved' },
    RS004: { koordinatorLabel: 'Paulus Werfete', speedboatLabel: 'Mayalibit Indah', statusKey: 'approved' },
    RS005: { koordinatorLabel: 'Dominggus Waran', speedboatLabel: 'Fam Lestari', statusKey: 'approved' },
    RS006: { koordinatorLabel: 'Yulianus Werfete', speedboatLabel: 'Kri Bumi', statusKey: 'approved' },
    RM001: { koordinatorLabel: 'Yulianus Werfete', speedboatLabel: 'Kri Bumi', statusKey: 'incoming' },
    RM002: { koordinatorLabel: 'Niko Waran', speedboatLabel: 'Misool Jaya', statusKey: 'pending' },
    RM003: { koordinatorLabel: 'Dominggus Waran', speedboatLabel: 'Fam Lestari', statusKey: 'approved' },
    RM004: { koordinatorLabel: 'Nikolaus Yarangga', speedboatLabel: 'Ayau Bahari', statusKey: 'approved' },
    RM005: { koordinatorLabel: 'Niko Waran', speedboatLabel: 'Misool Jaya', statusKey: 'approved' },
    RM006: { koordinatorLabel: 'Paulus Werfete', speedboatLabel: 'Mayalibit Indah', statusKey: 'approved' },
};

export function getPercentage(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

export function sumRumValues(item, keys) {
    return keys.reduce((sum, key) => sum + Number(item?.[key] || 0), 0);
}

export function resolveRumCategoryKey(category) {
    if (category === 'tetap') return 'tetap';
    if (category === 'megafauna') return 'megafauna';
    return 'tidak-tetap';
}

export function resolveRumMarkerType(category) {
    if (category === 'tetap') return 'homestay';
    if (category === 'megafauna') return 'megafauna';
    return 'fisherman';
}

export function buildRumMediaRecord(item, category) {
    const areaLabel = item?.detail?.kawasanTemuan?.ID || '';
    const posLabel = item?.detail?.posTemuan?.ID || '';
    const lat = parseNumericCoordinate(item?.detail?.lintang);
    const lng = parseNumericCoordinate(item?.detail?.bujur);
    const reportMeta = RUM_REPORT_META[item?.id] || {};
    const categoryKey = resolveRumCategoryKey(category);

    return {
        ...item,
        category,
        categoryKey,
        areaLabelRaw: areaLabel || '',
        posLabelRaw: posLabel || '',
        zoneValue: findOptionValueByLabel(KKP_OPTIONS, areaLabel),
        posValue: findOptionValueByLabel(POS_OPTIONS, posLabel),
        dateValue: getDateValue(item?.detail?.tanggal),
        coordinate: lat !== null && lng !== null ? { lat, lng } : null,
        markerType: resolveRumMarkerType(category),
        koordinatorLabel: reportMeta.koordinatorLabel || '-',
        speedboatLabel: reportMeta.speedboatLabel || '-',
        statusKey: reportMeta.statusKey || 'approved',
        reportTime: resolveRumReportTime(item),
        locationLabel:
            item?.detail?.namaLokasi?.ID ||
            item?.summary?.lokasi?.ID ||
            item?.summary?.areaTangkapan?.ID ||
            '-',
        factLabel:
            item?.summary?.hasilTangkapan?.ID ||
            item?.summary?.spesies?.ID ||
            item?.summary?.jenis?.ID ||
            '-',
        dateLabel: item?.detail?.tanggal || '-',
    };
}

export function resolveRumReportTime(item, fallbackHour = '06:00') {
    const summaryTime = String(item?.summary?.waktu || '').match(/\b\d{1,2}:\d{2}\b/);
    return summaryTime?.[0] || fallbackHour;
}

export function normalizeRumTimeValue(value) {
    const [hour = '00', minute = '00'] = String(value || '00:00').split(':');
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function resolveRumApprovalDelaySeconds(reportId) {
    return RUM_APPROVAL_DELAY_SECONDS[reportId] ?? 0;
}

export function buildInitialRumReportDraft(record) {
    if (!record) return null;

    return {
        attendanceKoordinator: record.koordinatorLabel || '-',
        attendancePencatatPosisi: 'Yustus Yoiwe',
        attendancePencatatPemanfaatan: 'Sergius Enemi',
        fuelLiters: '100',
        fuelNotes: 'BBM baru',
        restStop: record.locationLabel || '-',
        routeDescription: record.locationLabel || '-',
        areaLabel: record.areaLabel || record.areaLabelRaw || '-',
        posLabel: record.posLabel || record.posLabelRaw || '-',
        locationLabel: record.locationLabel || '-',
        coordinateText: record.coordinate
            ? `${record.coordinate.lat.toFixed(4)}, ${record.coordinate.lng.toFixed(4)}`
            : '-',
        gpsId: record.detail?.idGps || '-',
        dateText: record.dateLabel || '-',
        koordinatorLabel: record.koordinatorLabel || '-',
        speedboatLabel: record.speedboatLabel || '-',
        temuanTetapStatus: record.categoryKey === 'tetap' ? 'Ada' : 'Tidak',
        temuanTidakTetapStatus: record.categoryKey === 'tidak-tetap' ? 'Ada' : 'Tidak',
        temuanMegafaunaStatus: record.categoryKey === 'megafauna' ? 'Ada' : 'Tidak',
        hasilTangkapan: record.summary?.hasilTangkapan?.ID || '-',
        panjang: record.summary?.panjang || '-',
        jumlah: record.summary?.jumlah || '-',
        beratBasah: record.summary?.beratBasah || '-',
        beratKering: record.summary?.beratKering || '-',
        lamaKerja: record.summary?.lamaKerja || '-',
        keterangan: record.summary?.keterangan?.ID || '-',
        validasi: record.summary?.validasi?.ID || '-',
        jenisTetap: record.summary?.jenis?.ID || '-',
        kapasitas: record.summary?.kapasitas || '-',
        kondisiTetap: record.summary?.kondisi?.ID || '-',
        lokasiTetap: record.summary?.lokasi?.ID || record.locationLabel || '-',
        spesies: record.summary?.spesies?.ID || '-',
        jumlahMegafauna: record.summary?.jumlah || '-',
        waktuMegafauna: record.summary?.waktu || '-',
        kondisiMegafauna: record.summary?.kondisi?.ID || '-',
        lokasiMegafauna: record.summary?.lokasi?.ID || record.locationLabel || '-',
    };
}

