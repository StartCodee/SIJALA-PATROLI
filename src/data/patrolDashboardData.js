import { photoUrls } from "@/assets/image";
import { parseCoordinatePair } from "@/utils/monitoringFilterUtils";

export const FUEL_USAGE_LITERS_BY_PATROL_ID = {
  P001: 1050,
  P002: 980,
  P003: 920,
  P004: 1340,
  P005: 1280,
  P006: 860,
  P007: 910,
  P008: 1110,
  P011: 1240,
  P012: 2210,
};

const PATROL_APPROVAL_DELAY_SECONDS = {
  FT001: 68420,
  FT002: 71250,
  FT003: 83940,
  FT004: 70115,
  FT005: 90280,
  FT006: 73360,
  FT007: 68890,
  FT008: 82140,
  FT009: 64570,
  FT010: 69740,
  FT011: 75810,
  FT012: 78635,
};

const PATROL_REPORT_META_BY_POS = {
  "pos-dorehkar": { koordinatorLabel: "Nikolaus Yarangga", speedboatLabel: "Ayau Bahari" },
  "pos-warsowes": { koordinatorLabel: "Paulus Werfete", speedboatLabel: "Mayalibit Indah" },
  "pos-yenbekwan": { koordinatorLabel: "Meldis Ombori", speedboatLabel: "Mangku Bumi" },
  "pos-yenadwak": { koordinatorLabel: "Yulianus Werfete", speedboatLabel: "Kri Bumi" },
  "pos-ya-lapale": { koordinatorLabel: "Niko Waran", speedboatLabel: "Misool Jaya" },
  "pos-mioskor": { koordinatorLabel: "Dominggus Waran", speedboatLabel: "Fam Lestari" },
};

const PATROL_ATTENDANCE_BY_POS = {
  "pos-dorehkar": { koordinator: "Nikolaus Yarangga", pencatatPosisi: "Yosef Deda", pencatatPemanfaatan: "Markus Kafiar" },
  "pos-warsowes": { koordinator: "Paulus Werfete", pencatatPosisi: "Yustus Yoiwe", pencatatPemanfaatan: "Sergius Enemi" },
  "pos-yenbekwan": { koordinator: "Meldis Ombori", pencatatPosisi: "Yustus Yoiwe", pencatatPemanfaatan: "Sergius Enemi" },
  "pos-yenadwak": { koordinator: "Yulianus Werfete", pencatatPosisi: "Kristofel Mambraku", pencatatPemanfaatan: "Aser Yarangga" },
  "pos-ya-lapale": { koordinator: "Niko Waran", pencatatPosisi: "Habel Solossa", pencatatPemanfaatan: "Petrus Kayame" },
  "pos-mioskor": { koordinator: "Dominggus Waran", pencatatPosisi: "Elia Dimara", pencatatPemanfaatan: "Filipus Kabes" },
};

const PATROL_REST_STOP_BY_POS = {
  "pos-dorehkar": "Pulau Dorehkar; Pulau Ayau Besar",
  "pos-warsowes": "Pulau Semak Dau; Pulau Semak Belukar",
  "pos-yenbekwan": "Arborek; Yenbuba",
  "pos-yenadwak": "Mansuar; Sawinggrai",
  "pos-ya-lapale": "Lilinta; Yellu",
  "pos-mioskor": "Pulau Mioskon; Pulau Fam",
};

export const DUMMY_INCOMING_PATROL_REPORTS = [
  {
    id: "FTD001",
    src: photoUrls.foto06,
    caption: { ID: "Speedboat mencurigakan di Teluk Kabui", EN: "Suspicious speedboat in Kabui Bay" },
    summary: {
      lokasi: { ID: "Perairan Teluk Kabui", EN: "Kabui Bay Waters" },
      koordinat: "-0.5584, 130.5932",
      identitasKapal: "Mangku Bumi",
      statusPelanggaran: { ID: "Laporan Masuk", EN: "Incoming Report" },
      waktuTemuan: "06 Jan 2025, 14:27 WITA",
    },
    detail: {
      kawasanTemuan: { ID: "Selat Dampier", EN: "Dampier Strait" },
      posTemuan: { ID: "Pos Yenbekwan", EN: "Yenbekwan Post" },
      tanggal: "06 Januari 2025",
      idGps: "GPS-DUMMY-001",
      lintang: "-0.5584",
      bujur: "130.5932",
      namaLokasiTemuan: { ID: "Teluk Kabui", EN: "Kabui Bay" },
      namaKapal: "Mangku Bumi",
      validasiTemuan: { ID: "Belum Diproses", EN: "Not Processed" },
    },
    violationTypeKey: "illegal-anchoring",
  },
  {
    id: "FTD002",
    src: photoUrls.foto05,
    caption: { ID: "Aktivitas kapal wisata belum tervalidasi", EN: "Unvalidated tourism vessel activity" },
    summary: {
      lokasi: { ID: "Perairan Utara Mansuar", EN: "North Mansuar Waters" },
      koordinat: "-0.5221, 130.6128",
      identitasKapal: "Kri Bumi",
      statusPelanggaran: { ID: "Laporan Masuk", EN: "Incoming Report" },
      waktuTemuan: "15 Jan 2025, 09:10 WITA",
    },
    detail: {
      kawasanTemuan: { ID: "Selat Dampier", EN: "Dampier Strait" },
      posTemuan: { ID: "Pos Yenadwak", EN: "Yenadwak Post" },
      tanggal: "15 Januari 2025",
      idGps: "GPS-DUMMY-002",
      lintang: "-0.5221",
      bujur: "130.6128",
      namaLokasiTemuan: { ID: "Utara Mansuar", EN: "North Mansuar" },
      namaKapal: "Kri Bumi",
      validasiTemuan: { ID: "Belum Diproses", EN: "Not Processed" },
    },
    violationTypeKey: "illegal-fishing",
  },
  {
    id: "FTD003",
    src: photoUrls.foto01,
    caption: { ID: "Laporan awal aktivitas penangkapan di Mayalibit", EN: "Initial report of fishing activity in Mayalibit" },
    summary: {
      lokasi: { ID: "Perairan Dalam Teluk Mayalibit", EN: "Inner Mayalibit Bay Waters" },
      koordinat: "-0.4126, 130.7084",
      identitasKapal: "Mayalibit Indah",
      statusPelanggaran: { ID: "Laporan Masuk", EN: "Incoming Report" },
      waktuTemuan: "09 Jan 2025, 06:45 WITA",
    },
    detail: {
      kawasanTemuan: { ID: "Teluk Mayalibit", EN: "Mayalibit Bay" },
      posTemuan: { ID: "Pos Warsowes", EN: "Warsowes Post" },
      tanggal: "09 Januari 2025",
      idGps: "GPS-DUMMY-003",
      lintang: "-0.4126",
      bujur: "130.7084",
      namaLokasiTemuan: { ID: "Teluk Mayalibit", EN: "Mayalibit Bay" },
      namaKapal: "Mayalibit Indah",
      validasiTemuan: { ID: "Belum Diproses", EN: "Not Processed" },
    },
    violationTypeKey: "banned-gear",
  },
  {
    id: "FTD004",
    src: photoUrls.foto02,
    caption: { ID: "Laporan masyarakat dari Misool Selatan", EN: "Community report from South Misool" },
    summary: {
      lokasi: { ID: "Perairan Selatan Misool", EN: "South Misool Waters" },
      koordinat: "-1.8874, 130.2956",
      identitasKapal: "Misool Jaya",
      statusPelanggaran: { ID: "Laporan Masuk", EN: "Incoming Report" },
      waktuTemuan: "13 Jan 2025, 20:10 WITA",
    },
    detail: {
      kawasanTemuan: { ID: "Kepulauan Misool", EN: "Misool Islands" },
      posTemuan: { ID: "Pos Ya Lapale", EN: "Ya Lapale Post" },
      tanggal: "13 Januari 2025",
      idGps: "GPS-DUMMY-004",
      lintang: "-1.8874",
      bujur: "130.2956",
      namaLokasiTemuan: { ID: "Selatan Misool", EN: "South Misool" },
      namaKapal: "Misool Jaya",
      validasiTemuan: { ID: "Belum Diproses", EN: "Not Processed" },
    },
    violationTypeKey: "illegal-fishing",
  },
  {
    id: "FTD005",
    src: photoUrls.foto03,
    caption: { ID: "Laporan baru dari kawasan Ayau-Asia", EN: "New report from Ayau-Asia area" },
    summary: {
      lokasi: { ID: "Perairan Wayag", EN: "Wayag Waters" },
      koordinat: "0.4028, 130.7351",
      identitasKapal: "Ayau Bahari",
      statusPelanggaran: { ID: "Laporan Masuk", EN: "Incoming Report" },
      waktuTemuan: "11 Jan 2025, 15:20 WITA",
    },
    detail: {
      kawasanTemuan: { ID: "Kepulauan Ayau-Asia", EN: "Ayau-Asia Islands" },
      posTemuan: { ID: "Pos Dorehkar", EN: "Dorehkar Post" },
      tanggal: "11 Januari 2025",
      idGps: "GPS-DUMMY-005",
      lintang: "0.4028",
      bujur: "130.7351",
      namaLokasiTemuan: { ID: "Wayag", EN: "Wayag" },
      namaKapal: "Ayau Bahari",
      validasiTemuan: { ID: "Belum Diproses", EN: "Not Processed" },
    },
    violationTypeKey: "illegal-anchoring",
  },
];

export function resolveFindingStatusKey(statusLabel) {
  if (statusLabel === "Terverifikasi") return "approved";
  if (statusLabel === "Dalam Investigasi" || statusLabel === "Ditolak") return "pending";
  return "incoming";
}

export function resolveApprovalDelaySeconds(reportId) {
  return PATROL_APPROVAL_DELAY_SECONDS[reportId] ?? 0;
}

export function resolvePatrolReportMeta(posValue) {
  return PATROL_REPORT_META_BY_POS[posValue] || {};
}

export function formatFindingCoordinateText(value) {
  const parsed = parseCoordinatePair(value);
  if (!parsed) return String(value || "").replace(/\s+/g, "");
  return [parsed.lat, parsed.lng].map((item) => item.toFixed(7).replace(".", ",")).join(";");
}

export function buildInitialReportDraft(report, nearestPatrol) {
  const attendance = PATROL_ATTENDANCE_BY_POS[report?.posValue] || {};
  const route = report?.summary?.lokasi?.ID || report?.detail?.namaLokasiTemuan?.ID || "-";

  return {
    attendanceKoordinator: attendance.koordinator || report?.koordinatorLabel || "-",
    attendancePencatatPosisi: attendance.pencatatPosisi || "-",
    attendancePencatatPemanfaatan: attendance.pencatatPemanfaatan || "-",
    fuelLiters: nearestPatrol ? String(Number(FUEL_USAGE_LITERS_BY_PATROL_ID[nearestPatrol.id] || 0)) : "",
    fuelNotes: "BBM baru",
    restStop: PATROL_REST_STOP_BY_POS[report?.posValue] || "-",
    routeDescription: route,
    hasFinding: "Ada",
    coordinateText: formatFindingCoordinateText(
      report?.summary?.koordinat || `${report?.detail?.lintang || "-"};${report?.detail?.bujur || "-"}`
    ),
    gpsId: report?.detail?.idGps || "-",
    findingLocationName: report?.detail?.namaLokasiTemuan?.ID || "-",
  };
}
