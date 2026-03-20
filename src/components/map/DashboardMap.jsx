import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, GeoJSON, Pane, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ChevronLeft, ChevronRight, ChevronDown, Copy, Eye, EyeOff, Layers, MapPin, Plus, Minus, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import LazyMapMount from '@/components/LazyMapMount';
import kkpNormal from '@/assets/icon/kkp-normal.png';
import papuabaratdayaLogo from '@/assets/icon/papuabaratdaya-logo.webp';
import geoJsonBaseData from '@/data/geojson/geoJson.json';
import posJagaGeoJson from '@/data/geojson/posJaga.json';
import { photoUrls } from '@/assets/image';
import {
    activityPerZone,
    armadaJenisData,
    armadaTipeData,
    findingDetails,
    KKP_OPTIONS,
    POS_OPTIONS,
    violationPerZoneStacked,
} from '@/data/sispandalwasData';

function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && zoom) {
            map.flyTo(center, zoom, { duration: 1.0 });
        }
    }, [center, zoom, map]);
    return null;
}

function MapBridge({ onReady }) {
    const map = useMap();
    useEffect(() => {
        onReady?.(map);
    }, [map, onReady]);
    return null;
}

const ZONE_COLORS = {
    'Zona Inti': '#EA3323',
    'Zona Lainnya': '#828282',
    'Zona Pemanfaatan Terbatas': '#AFFCA1',
};

function geoStyle(feature) {
    const zonasi = feature?.properties?.Zonasi || '';
    const color = ZONE_COLORS[zonasi] || '#3b82f6';
    return {
        color,
        weight: 0.5,
        opacity: 0.8,
        fillColor: color,
        fillOpacity: 0.7,
    };
}

function onEachFeature(feature, layer) {
    if (!feature.properties) return;
    const { Kawasan, Zonasi, Aturan_1, Aturan_2, Aturan_3, Luas_Ha } = feature.properties;
    const zoneColor = ZONE_COLORS[Zonasi] || '#3b82f6';
    const textColor = Zonasi === 'Zona Pemanfaatan Terbatas' ? '#1a5c39' : '#fff';
    const area = Luas_Ha ? Number(Luas_Ha).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-';
    const ruleRow = (label, val) => (!val || val === '-') ? '' :
        `<tr>
            <td style="font-weight:600;padding:3px 8px 3px 0;vertical-align:top;white-space:nowrap;color:#6b7280;font-size:10px">${label}</td>
            <td style="padding:3px 0;font-size:11px;color:#374151;line-height:1.4">${val}</td>
        </tr>`;
    const rulesHtml = [ruleRow('Aturan 1', Aturan_1), ruleRow('Aturan 2', Aturan_2), ruleRow('Aturan 3', Aturan_3)].join('');
    const html = `
        <div style="font-family:system-ui,sans-serif;min-width:200px;max-width:260px">
            <p style="font-weight:700;font-size:13px;margin:0 0 6px;color:#111827">${Kawasan || ''}</p>
            <span style="display:inline-block;background:${zoneColor};color:${textColor};padding:2px 10px;border-radius:9999px;font-size:10px;font-weight:600;margin-bottom:6px">${Zonasi || ''}</span>
            <p style="color:#9ca3af;font-size:11px;margin:0 0 8px">Luas: <b style="color:#6b7280">${area} Ha</b></p>
            ${rulesHtml ? `<div style="border-top:1px solid #e5e7eb;padding-top:8px"><table style="width:100%;border-collapse:collapse">${rulesHtml}</table></div>` : ''}
        </div>`;
    layer.bindPopup(html, { maxWidth: 300, maxHeight: 220 });
}

const DASHBOARD_MARKER_COLORS = {
    temuan: '#5ce342',
    pos: '#1f9ed3',
    patrol: '#0b61d6',
    posMonitoring: '#16a34a',
};
const REPORT_STATUS_COLORS = {
    incoming: '#ef4444',
    pending: '#f59e0b',
    approved: '#22c55e',
};

function createIcon(label, color) {
    const size = 24;
    const glyphSize = 13;
    let glyph = '';

    if (label === 'temuan') {
        glyph = `
            <svg width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 3L2.8 20h18.4L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 9.5v5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <circle cx="12" cy="17.5" r="1" fill="currentColor" />
            </svg>
        `;
    }

    if (label === 'pos' || label === 'posJaga') {
        glyph = `
            <svg width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 21h4l-1.2-8h-1.6L10 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <path d="M10.7 13h2.6l-.6-4h-1.4l-.6 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <path d="M12 5V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M6 20c1-.9 2-.9 3 0M15 20c1-.9 2-.9 3 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
        `;
    }

    if (label === 'patrol' || label === 'timPatrol') {
        glyph = `
            <svg width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 14h16l-1.8 4H5.8L4 14z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <path d="M12 6v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M12 6l5 3h-5V6z" fill="currentColor" />
                <path d="M7 20c1 .9 2 .9 3 0 1 .9 2 .9 3 0 1 .9 2 .9 3 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
        `;
    }

    if (label === 'posMonitoring') {
        glyph = `
            <svg width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
        `;
    }

    return L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:grid;place-items:center;color:#fff">${glyph}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createStatusIcon(color) {
    const size = 24;
    return L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:grid;place-items:center"><span style="width:8px;height:8px;border-radius:9999px;background:#fff;display:block"></span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createFindingStatusIcon() {
    const size = 20;
    return L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${DASHBOARD_MARKER_COLORS.temuan};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:grid;place-items:center;color:#fff">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 3L2.8 20h18.4L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 9.5v5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <circle cx="12" cy="17.5" r="1" fill="currentColor" />
            </svg>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [4, size - 2],
    });
}

const ICONS = {
    temuan: createIcon('temuan', DASHBOARD_MARKER_COLORS.temuan),
    pos: createIcon('pos', DASHBOARD_MARKER_COLORS.pos),
    patrol: createIcon('patrol', DASHBOARD_MARKER_COLORS.patrol),
    timPatrol: createIcon('timPatrol', DASHBOARD_MARKER_COLORS.patrol),
    posJaga: createIcon('posJaga', DASHBOARD_MARKER_COLORS.pos),
    posMonitoring: createIcon('posMonitoring', DASHBOARD_MARKER_COLORS.posMonitoring),
    incoming: createStatusIcon(REPORT_STATUS_COLORS.incoming),
    pending: createStatusIcon(REPORT_STATUS_COLORS.pending),
    approved: createStatusIcon(REPORT_STATUS_COLORS.approved),
    temuanStatus: createFindingStatusIcon(),
};

const FOCUS_ICON = L.divIcon({
    className: '',
    html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:48px">
            <span style="position:absolute;width:48px;height:48px;border-radius:9999px;border:2px solid rgba(255,255,255,0.9);background:transparent;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></span>
            <span style="position:absolute;width:30px;height:30px;border-radius:9999px;border:2px solid rgba(255,255,255,0.95);background:transparent;box-shadow:0 0 0 3px rgba(255,255,255,0.18)"></span>
        </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});

const LEGEND_ICONS = {
    temuan: createIcon('temuan', DASHBOARD_MARKER_COLORS.temuan).options.html,
    pos: createIcon('pos', DASHBOARD_MARKER_COLORS.pos).options.html,
    patrol: createIcon('patrol', DASHBOARD_MARKER_COLORS.patrol).options.html,
    timPatrol: createIcon('timPatrol', DASHBOARD_MARKER_COLORS.patrol).options.html,
    posJaga: createIcon('posJaga', DASHBOARD_MARKER_COLORS.pos).options.html,
    posMonitoring: createIcon('posMonitoring', DASHBOARD_MARKER_COLORS.posMonitoring).options.html,
    incoming: createStatusIcon(REPORT_STATUS_COLORS.incoming).options.html,
    pending: createStatusIcon(REPORT_STATUS_COLORS.pending).options.html,
    approved: createStatusIcon(REPORT_STATUS_COLORS.approved).options.html,
    temuanStatus: createFindingStatusIcon().options.html,
};

function normalizeDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function groupPosPoints(points) {
    const acc = new Map();
    points.forEach((pt) => {
        const key = pt.pos || 'tanpa-pos';
        const current = acc.get(key) || { count: 0, lat: 0, lng: 0, zone: pt.zone, pos: pt.pos, dates: [], points: [] };
        current.count += 1;
        current.lat += pt.lat;
        current.lng += pt.lng;
        current.dates.push(pt.date);
        current.points.push(pt);
        acc.set(key, current);
    });
    return Array.from(acc.entries()).map(([key, value]) => ({
        id: `pos-${key}`,
        markerType: 'pos',
        lat: value.lat / value.count,
        lng: value.lng / value.count,
        zone: value.zone,
        pos: value.pos,
        date: [...value.dates].sort().at(-1) || null,
        source: value,
    }));
}

const AREA_SLUG_RULES = [
    { pattern: /ayau|asia/, value: 'kepulauan-ayau-asia' },
    { pattern: /mayalibit/, value: 'teluk-mayalibit' },
    { pattern: /dampier/, value: 'selat-dampier' },
    { pattern: /misool selatan|kepulauan misool|misool/, value: 'kepulauan-misool' },
    { pattern: /kofiau|boo/, value: 'kepulauan-kofiau-boo' },
    { pattern: /fam/, value: 'kepulauan-fam' },
    { pattern: /misool utara/, value: 'misool-utara' },
];

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s/-]/g, ' ')
        .replace(/\s+/g, ' ');
}

function mapAreaToZone(areaLabel) {
    const normalized = normalizeText(areaLabel);
    const matchedRule = AREA_SLUG_RULES.find((rule) => rule.pattern.test(normalized));
    return matchedRule?.value || '';
}

function mapPosLabelToValue(posLabel) {
    const normalized = normalizeText(posLabel);
    const matchedPos = POS_OPTIONS.find((option) => normalizeText(getLocalizedText(option.label, option.value)) === normalized);
    return matchedPos?.value || '';
}

function normalizePosJagaGeoJson(geoJson) {
    const features = geoJson?.features || [];

    return features
        .filter((feature) => feature?.geometry?.type === 'Point' && Array.isArray(feature?.geometry?.coordinates))
        .map((feature, index) => {
            const [lng, lat] = feature.geometry.coordinates;
            const area = feature?.properties?.Area || '';
            const label = feature?.properties?.Pos || `Pos Jaga ${index + 1}`;

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return null;
            }

            return {
                id: `pos-jaga-${index + 1}`,
                lat,
                lng,
                label,
                area,
                zone: mapAreaToZone(area),
                pos: mapPosLabelToValue(label),
                markerType: 'posJaga',
            };
        })
        .filter(Boolean);
}

function filterLayerPoints(points = [], selectedZone = 'all', selectedPos = 'all') {
    return points.filter((point) => {
        if (selectedZone !== 'all' && point.zone && point.zone !== selectedZone) return false;
        if (selectedPos !== 'all' && point.pos && point.pos !== selectedPos) return false;
        return true;
    });
}

function groupMonitoringPoints(points = []) {
    const acc = new Map();

    points.forEach((point) => {
        if (!Number.isFinite(point?.lat) || !Number.isFinite(point?.lng)) return;

        const key = point.pos || point.id || `monitoring-${acc.size + 1}`;
        const current = acc.get(key) || {
            count: 0,
            lat: 0,
            lng: 0,
            zone: point.zone,
            pos: point.pos,
            latestDate: point.date || null,
            incomingCount: 0,
            pendingCount: 0,
            approvedCount: 0,
        };

        current.count += 1;
        current.lat += point.lat;
        current.lng += point.lng;
        current.zone = current.zone || point.zone;
        current.pos = current.pos || point.pos;

        if (point.date && (!current.latestDate || point.date > current.latestDate)) {
            current.latestDate = point.date;
        }

        if (point.statusKey === 'approved') current.approvedCount += 1;
        else if (point.statusKey === 'pending') current.pendingCount += 1;
        else current.incomingCount += 1;

        acc.set(key, current);
    });

    return Array.from(acc.entries()).map(([key, value]) => ({
        id: `pos-monitoring-${key}`,
        lat: value.lat / value.count,
        lng: value.lng / value.count,
        zone: value.zone,
        pos: value.pos,
        label: getPosLabel(value.pos),
        date: value.latestDate,
        markerType: 'posMonitoring',
        source: value,
    }));
}

function getLocalizedText(value, fallback = '-') {
    if (value && typeof value === 'object') {
        return value.ID || value.EN || fallback;
    }
    return value ?? fallback;
}

function getZoneLabel(value) {
    return KKP_OPTIONS.find((option) => option.value === value)?.label?.ID || value || '-';
}

function getPosLabel(value) {
    return POS_OPTIONS.find((option) => option.value === value)?.label?.ID || value || '-';
}

function formatMarkerDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
    }
    return String(value);
}

function formatCoordinateValue(value) {
    if (typeof value === 'number') {
        return value.toFixed(4);
    }
    return value || '-';
}

function parseNumericCoordinate(value) {
    const match = String(value || '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDetailDate(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';

    const monthMap = {
        januari: '01',
        februari: '02',
        maret: '03',
        april: '04',
        mei: '05',
        juni: '06',
        juli: '07',
        agustus: '08',
        september: '09',
        oktober: '10',
        november: '11',
        desember: '12',
    };

    const match = normalized.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
    if (!match) return '';

    const [, day, monthName, year] = match;
    const month = monthMap[monthName];
    if (!month) return '';
    return `${year}-${month}-${String(day).padStart(2, '0')}`;
}

function findRelatedFinding(marker) {
    const markerDate = marker.date ? String(marker.date).slice(0, 10) : '';
    const markerLat = typeof marker.lat === 'number' ? marker.lat : null;
    const markerLng = typeof marker.lng === 'number' ? marker.lng : null;

    return (
        findingDetails.find((item) => {
            const detail = item.detail || {};
            const detailLat = parseNumericCoordinate(detail.lintang);
            const detailLng = parseNumericCoordinate(detail.bujur);
            const sameCoordinate =
                markerLat !== null &&
                markerLng !== null &&
                detailLat !== null &&
                detailLng !== null &&
                Math.abs(markerLat - detailLat) < 0.0005 &&
                Math.abs(markerLng - detailLng) < 0.0005;

            const sameDate = markerDate && normalizeDetailDate(detail.tanggal) === markerDate;
            const sameZone = getLocalizedText(detail.kawasanTemuan) === getZoneLabel(marker.zone);
            const samePos = getLocalizedText(detail.posTemuan) === getPosLabel(marker.pos);

            return sameCoordinate || (sameDate && sameZone && samePos);
        }) || null
    );
}

function buildMarkerCard(marker) {
    const relatedFinding = marker.finding || findRelatedFinding(marker);
    const detail = relatedFinding?.detail || {};
    const imageSrc = relatedFinding?.src || photoUrls.foto01;
    const titlePrefix =
        marker.markerType === 'report'
            ? 'Laporan'
            : marker.markerType === 'temuan'
                ? 'Temuan'
                : marker.markerType === 'posJaga'
                    ? 'Pos Jaga Laut'
                    : marker.markerType === 'posMonitoring'
                        ? 'Pos Monitoring'
                        : marker.markerType === 'pos'
                            ? 'Pos'
                            : marker.markerType === 'patrolTeam'
                                ? 'Tim Patrol'
                                : 'Patroli';
    const titleValue =
        marker.markerType === 'report'
            ? relatedFinding?.caption?.ID || marker.label || '-'
            : marker.markerType === 'temuan'
                ? relatedFinding?.caption?.ID || marker.label || '-'
                : marker.markerType === 'pos' || marker.markerType === 'posJaga' || marker.markerType === 'posMonitoring'
                    ? marker.label || getPosLabel(marker.pos)
                    : marker.label || '-';

    const statusLabel =
        marker.statusKey === 'approved'
            ? 'Disetujui'
            : marker.statusKey === 'pending'
                ? 'Tertunda'
                : marker.statusKey === 'incoming'
                    ? 'Masuk'
                    : '-';

    const rows = marker.markerType === 'report'
        ? [
            ['Status Laporan', statusLabel],
            ['Temuan', relatedFinding?.caption?.ID || marker.label || '-'],
            ['Kawasan Temuan', getLocalizedText(detail.kawasanTemuan, getZoneLabel(marker.zone))],
            ['Pos Temuan', getLocalizedText(detail.posTemuan, getPosLabel(marker.pos))],
            ['Tanggal', detail.tanggal || formatMarkerDate(marker.date)],
            ['Koordinat', relatedFinding?.summary?.koordinat || `${formatCoordinateValue(marker.lat)}, ${formatCoordinateValue(marker.lng)}`],
            ['Status Pelanggaran', getLocalizedText(relatedFinding?.summary?.statusPelanggaran, statusLabel)],
            ['Jenis Kapal', getLocalizedText(detail.jenisKapal)],
            ['Nama Kapal', detail.namaKapal || relatedFinding?.summary?.identitasKapal || '-'],
            ['Informasi Pelanggaran', getLocalizedText(detail.informasiPelanggaran)],
            ['Validasi Temuan', getLocalizedText(detail.validasiTemuan)],
        ]
        : marker.markerType === 'temuan'
        ? [
            ['Temuan', relatedFinding?.caption?.ID || marker.label || '-'],
            ['Kawasan Temuan', getLocalizedText(detail.kawasanTemuan, getZoneLabel(marker.zone))],
            ['PosTemuan', getLocalizedText(detail.posTemuan, getPosLabel(marker.pos))],
            ['Tanggal', detail.tanggal || formatMarkerDate(marker.date)],
            ['ID GPS', detail.idGps || '-'],
            ['Lintang (N/S)', detail.lintang || formatCoordinateValue(marker.lat)],
            ['Bujur (E)', detail.bujur || formatCoordinateValue(marker.lng)],
            ['Nama Lokasi Temuan', getLocalizedText(detail.namaLokasiTemuan)],
            ['Jenis Kapal/ Perahu', getLocalizedText(detail.jenisKapal)],
            ['Tipe Kapal', getLocalizedText(detail.tipeKapal)],
            ['Nama Kapal', detail.namaKapal || '-'],
            ['Nama Kapten', detail.namaKapten || '-'],
            ['Asal Kapal', getLocalizedText(detail.asalKapal)],
            ['Jumlah ABK', detail.jumlahABK ?? '-'],
            ['Jumlah Penumpang', detail.jumlahPenumpang ?? '-'],
            ['Informasi Pelanggaran', getLocalizedText(detail.informasiPelanggaran)],
            ['Validasi Temuan', getLocalizedText(detail.validasiTemuan)],
        ]
        : marker.markerType === 'pos' || marker.markerType === 'posJaga'
            ? [
                ['Pos Jaga Laut', marker.label || getPosLabel(marker.pos)],
                ['Kawasan Temuan', marker.area || getZoneLabel(marker.zone)],
                ['Tanggal Terakhir', formatMarkerDate(marker.date)],
                ['Lintang (N/S)', formatCoordinateValue(marker.lat)],
                ['Bujur (E)', formatCoordinateValue(marker.lng)],
                ['Jumlah Titik Terkait', marker.source?.count ?? '-'],
                ['Jumlah Temuan', marker.source?.points?.filter((item) => item.type === 'violation').length ?? 0],
                ['Patroli Terkait', marker.source?.points?.filter((item) => item.type !== 'violation').length ?? 0],
                ['Temuan Terdekat', relatedFinding?.caption?.ID || '-'],
            ]
            : marker.markerType === 'posMonitoring'
                ? [
                    ['Pos Monitoring', marker.label || getPosLabel(marker.pos)],
                    ['Kawasan Temuan', getZoneLabel(marker.zone)],
                    ['Tanggal Terakhir', formatMarkerDate(marker.date)],
                    ['Lintang (N/S)', formatCoordinateValue(marker.lat)],
                    ['Bujur (E)', formatCoordinateValue(marker.lng)],
                    ['Total Laporan', marker.source?.count ?? 0],
                    ['Laporan Masuk', marker.source?.incomingCount ?? 0],
                    ['Laporan Tertunda', marker.source?.pendingCount ?? 0],
                    ['Laporan Disetujui', marker.source?.approvedCount ?? 0],
                ]
                : [
                    ['Patroli', marker.label || '-'],
                    ['Kawasan Temuan', getZoneLabel(marker.zone)],
                    ['PosTemuan', getPosLabel(marker.pos)],
                    ['Tanggal', formatMarkerDate(marker.date)],
                    ['Lintang (N/S)', formatCoordinateValue(marker.lat)],
                    ['Bujur (E)', formatCoordinateValue(marker.lng)],
                    ['Jenis Marker', marker.markerType === 'patrolTeam' ? 'Tim Patrol' : 'Patroli'],
                    ['Temuan Terkait', relatedFinding?.caption?.ID || '-'],
                    ['ID GPS', detail.idGps || '-'],
                    ['Nama Lokasi Temuan', getLocalizedText(detail.namaLokasiTemuan)],
                ];

    return {
        title: `${titlePrefix}: ${titleValue}`,
        imageSrc,
        rows,
    };
}

function PatrolPopupCard({ marker, finding }) {
    const dateText = marker.date ? new Date(marker.date).toLocaleDateString('id-ID') : '-';
    const image = finding?.src || photoUrls.foto01;
    const jenisKapal = finding?.detail?.jenisKapal?.ID || (marker.markerType === 'patrol' ? 'Speedboat' : '-');
    const tipeKapal = finding?.detail?.tipeKapal?.ID || (marker.markerType === 'patrol' ? 'Patroli' : '-');
    const asalKapal = finding?.detail?.asalKapal?.ID || 'Raja Ampat';
    const pelanggaran = marker.markerType === 'temuan' ? 'Ya' : 'Tidak';

    return (
        <div className="w-58 text-[11px] text-gray-800">
            <img
                src={image}
                alt="Temuan"
                className="h-28 w-full object-cover rounded-md border border-gray-200 mb-2"
            />
            <div className="grid grid-cols-[108px_1fr] gap-x-2 gap-y-1 leading-tight">
                <span className="text-gray-500">Tanggal Patroli</span><span>{dateText}</span>
                <span className="text-gray-500">Kawasan Temuan</span><span>{marker.zone || '-'}</span>
                <span className="text-gray-500">Pos Temuan</span><span>{marker.pos || '-'}</span>
                <span className="text-gray-500">Jenis Kapal</span><span>{jenisKapal}</span>
                <span className="text-gray-500">Tipe Kapal</span><span>{tipeKapal}</span>
                <span className="text-gray-500">Asal Kapal</span><span>{asalKapal}</span>
                <span className="text-gray-500">Pelanggaran</span><span>{pelanggaran}</span>
            </div>
        </div>
    );
}

function Slides({ slides, height = 'h-58' }) {
    const [index, setIndex] = useState(0);
    const current = slides[index];

    return (
        <div className="rounded-lg border border-slate-200 bg-white text-slate-900 overflow-hidden shadow-sm">
            <div className={`${height} p-3`}>{current.content}</div>
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="h-7 w-7 rounded-md border border-slate-300 text-slate-700 grid place-items-center hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1.5">
                    {slides.map((_, i) => (
                        <span
                            key={i}
                            className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-[#0f5c7b]' : 'bg-slate-300'}`}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
                    className="h-7 w-7 rounded-md border border-slate-300 text-slate-700 grid place-items-center hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Next slide"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

function SimpleBarChart({ title, data, maxOverride }) {
    const maxValue = maxOverride || Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="h-full">
            <h4 className="text-center text-sm font-bold mb-3 text-slate-800">{title}</h4>
            <div className="h-[calc(100%-2.25rem)] flex items-end gap-2 border-l border-b border-slate-300 pl-2 pb-1">
                {data.map((item) => (
                    <div key={item.label} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[11px] font-semibold mb-1 text-slate-700">{item.value}</span>
                        <div
                            className="w-full rounded-t-sm"
                            style={{
                                height: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                                backgroundColor: item.color,
                            }}
                        />
                        <span className="text-[10px] text-center mt-1.5 leading-tight text-slate-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SimpleDonutChart({ title, data }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const size = 170;
    const center = size / 2;
    const radius = 58;
    const innerRadius = 34;
    const arcs = data.reduce((acc, item) => {
        const startAngle = acc.nextAngle;
        const sweep = total ? (item.value / total) * 360 : 0;
        const endAngle = startAngle + sweep;
        const start = (startAngle * Math.PI) / 180;
        const end = (endAngle * Math.PI) / 180;
        const x1 = center + radius * Math.cos(start);
        const y1 = center + radius * Math.sin(start);
        const x2 = center + radius * Math.cos(end);
        const y2 = center + radius * Math.sin(end);
        const ix1 = center + innerRadius * Math.cos(start);
        const iy1 = center + innerRadius * Math.sin(start);
        const ix2 = center + innerRadius * Math.cos(end);
        const iy2 = center + innerRadius * Math.sin(end);
        const largeArc = sweep > 180 ? 1 : 0;
        const d = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
            'Z',
        ].join(' ');
        acc.items.push({ ...item, d });
        acc.nextAngle = endAngle;
        return acc;
    }, { items: [], nextAngle: -90 }).items;

    return (
        <div className="h-full flex flex-col">
            <h4 className="text-center text-sm font-bold mb-2 text-slate-800">{title}</h4>
            <div className="flex-1 grid grid-cols-[1fr_1fr] gap-2 items-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-40 mx-auto">
                    {arcs.map((arc) => <path key={arc.label} d={arc.d} fill={arc.color} />)}
                </svg>
                <div className="space-y-1.5 max-h-40 overflow-auto pr-1">
                    {data.map((item) => (
                        <div key={item.label} className="text-[11px] flex items-center gap-2 text-slate-700">
                            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                            <span className="flex-1 truncate">{item.label}</span>
                            <span className="font-semibold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PatrolDashboardMap({ points, center, zoom, geoJsonData, containerClassName = '' }) {
    const [kawasan, setKawasan] = useState('all');
    const [posKawasan, setPosKawasan] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [tahun, setTahun] = useState('all');
    const [quickInfo, setQuickInfo] = useState('all');
    const [mapRef, setMapRef] = useState(null);
    const [showLegendPanel, setShowLegendPanel] = useState(false);
    const [showLayerPanel, setShowLayerPanel] = useState(false);
    const [showDatePanel, setShowDatePanel] = useState(false);
    const [showEmbedPanel, setShowEmbedPanel] = useState(false);
    const [embedCopied, setEmbedCopied] = useState(false);
    const [isRightPanelHidden, setIsRightPanelHidden] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const internalGeoJson = geoJsonBaseData;
    const [layers, setLayers] = useState({
        timPatrol: true,
        posJagaLaut: true,
        temuan: true,
        zonasiKK: true,
    });

    const effectiveGeoJson = geoJsonData || internalGeoJson;

    const areaOptions = useMemo(() => {
        const values = Array.from(new Set(points.map((pt) => pt.zone).filter(Boolean)));
        return values;
    }, [points]);

    const posOptions = useMemo(() => {
        const values = Array.from(new Set(points.map((pt) => pt.pos).filter(Boolean)));
        return values;
    }, [points]);

    const yearOptions = useMemo(() => {
        const years = Array.from(new Set(points.map((pt) => normalizeDate(pt.date)?.getFullYear()).filter(Boolean)));
        return years.sort((a, b) => b - a);
    }, [points]);

    const quickFilteredPoints = useMemo(() => {
        const now = new Date();
        const start = new Date(now);

        if (quickInfo === 'day') {
            start.setHours(0, 0, 0, 0);
        }
        if (quickInfo === 'week') {
            start.setDate(now.getDate() - 7);
        }
        if (quickInfo === 'month') {
            start.setMonth(now.getMonth() - 1);
        }

        return points.filter((pt) => {
            const dt = normalizeDate(pt.date);
            if (!dt) return quickInfo === 'all';
            if (quickInfo === 'all') return true;
            return dt >= start;
        });
    }, [points, quickInfo]);

    const filteredBasePoints = useMemo(() => {
        return quickFilteredPoints.filter((pt) => {
            if (kawasan !== 'all' && pt.zone !== kawasan) return false;
            if (posKawasan !== 'all' && pt.pos !== posKawasan) return false;

            const pointDate = normalizeDate(pt.date);
            if (tahun !== 'all' && pointDate?.getFullYear()?.toString() !== tahun) return false;

            if (dateFrom) {
                const from = new Date(dateFrom);
                if (pointDate && pointDate < from) return false;
            }
            if (dateTo) {
                const to = new Date(dateTo);
                to.setHours(23, 59, 59, 999);
                if (pointDate && pointDate > to) return false;
            }
            return true;
        });
    }, [quickFilteredPoints, kawasan, posKawasan, tahun, dateFrom, dateTo]);

    const markers = useMemo(() => {
        const patrolMarkers = filteredBasePoints.filter((pt) => pt.type !== 'violation').map((pt) => ({
            ...pt,
            markerType: 'patrol',
        }));
        const temuanMarkers = filteredBasePoints.filter((pt) => pt.type === 'violation').map((pt) => ({
            ...pt,
            markerType: 'temuan',
        }));
        const posMarkers = groupPosPoints(filteredBasePoints);
        return { patrolMarkers, temuanMarkers, posMarkers };
    }, [filteredBasePoints]);

    const filteredGeoJson = useMemo(() => {
        if (!effectiveGeoJson || !layers.zonasiKK) return null;
        return {
            ...effectiveGeoJson,
            features: effectiveGeoJson.features.filter((f) => {
                if (f?.geometry?.type === 'Point') return false;
                const z = f?.properties?.Zonasi;
                return z === 'Zona Inti' || z === 'Zona Pemanfaatan Terbatas' || z === 'Zona Lainnya';
            }),
        };
    }, [effectiveGeoJson, layers.zonasiKK]);

    const geoKey = useMemo(() => `${filteredGeoJson?.features?.length || 0}-${layers.zonasiKK}`, [filteredGeoJson, layers.zonasiKK]);

    const totalPatrol = markers.patrolMarkers.length;
    const totalViolations = markers.temuanMarkers.length;
    const activeFleet = new Set(markers.patrolMarkers.map((pt) => pt.pos)).size;
    const coveragePercent = areaOptions.length ? Math.round((new Set(filteredBasePoints.map((pt) => pt.zone)).size / areaOptions.length) * 100) : 0;

    const activitySlideData = activityPerZone.map((item) => ({
        label: item.zone.ID.replace('Subzona ', 'Subzona\n'),
        value: item.patroli,
        color: item.color,
    }));

    const typeSlideData = useMemo(() => {
        const wisata = armadaTipeData.find((item) => item.key === 'wisata')?.value || 0;
        const nelayan = armadaTipeData.find((item) => item.key === 'nelayan')?.value || 0;
        const lainnya = armadaTipeData
            .filter((item) => item.key !== 'wisata' && item.key !== 'nelayan')
            .reduce((sum, item) => sum + item.value, 0);
        return [
            { label: 'Wisata', value: wisata, color: '#3b82f6' },
            { label: 'Nelayan', value: nelayan, color: '#84cc16' },
            { label: 'Lain-lain', value: lainnya, color: '#f59e0b' },
        ];
    }, []);

    const asalKapalData = useMemo(() => {
        const result = findingDetails.reduce((acc, item) => {
            const asal = item?.detail?.asalKapal?.ID || '';
            const isDalam = /raja ampat|waigeo|misool|kofiau|fam/i.test(asal);
            if (isDalam) acc.dalam += 1;
            else acc.luar += 1;
            return acc;
        }, { dalam: 0, luar: 0 });
        return [
            { label: 'Dari Dalam', value: result.dalam, color: '#22c55e' },
            { label: 'Dari Luar', value: result.luar, color: '#60a5fa' },
        ];
    }, []);

    const pelanggaranZoneData = useMemo(() => {
        const totalByZone = { 'Zona Inti': 0, 'Zona Lainnya': 0, 'Zona Pemanfaatan Terbatas': 0 };
        violationPerZoneStacked.forEach((item) => {
            const total = Object.values(item.violations).reduce((sum, value) => sum + value, 0);
            if (item.zone.ID.includes('Inti')) totalByZone['Zona Inti'] += total;
            if (item.zone.ID.includes('Lain')) totalByZone['Zona Lainnya'] += total;
            if (item.zone.ID.includes('Budidaya') || item.zone.ID.includes('Wisata') || item.zone.ID.includes('Tangkap')) {
                totalByZone['Zona Pemanfaatan Terbatas'] += total;
            }
        });
        return [
            { label: 'Zona Inti', value: totalByZone['Zona Inti'], color: '#a3e635' },
            { label: 'Zona Lainnya', value: totalByZone['Zona Lainnya'], color: '#0ea5e9' },
            { label: 'Zona Pemanfaatan\nTerbatas', value: totalByZone['Zona Pemanfaatan Terbatas'], color: '#d1d5db' },
        ];
    }, []);

    const handleMyLocation = () => {
        if (!navigator?.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            const next = [pos.coords.latitude, pos.coords.longitude];
            setUserLocation(next);
            mapRef?.flyTo(next, 12, { duration: 1.1 });
        });
    };

    const embedSrc = typeof window !== 'undefined' ? `${window.location.origin}/patrols` : '/patrols';
    const embedCode = `<iframe\n  src="${embedSrc}"\n  width="100%"\n  height="800"\n  style="border:none;">\n</iframe>`;

    const copyEmbed = async () => {
        try {
            await navigator.clipboard.writeText(embedCode);
            setEmbedCopied(true);
            setTimeout(() => setEmbedCopied(false), 1600);
        } catch {
            setEmbedCopied(false);
        }
    };

    const slideGroupOne = [
        {
            title: 'Jumlah Aktivitas (Temuan) per Zona (Subzona)',
            content: <SimpleBarChart title="Lokasi Aktivitas Per Zona" data={activitySlideData} maxOverride={150} />,
        },
        {
            title: 'Jenis Kapal Temuan di Kawasan Konservasi',
            content: <SimpleDonutChart title="Informasi Armada Temuan" data={armadaJenisData.map((d) => ({ label: d.label.ID, value: d.value, color: d.color }))} />,
        },
        {
            title: 'Tipe Kapal Temuan di Kawasan Konservasi',
            content: <SimpleBarChart title="Tipe Kapal Temuan" data={typeSlideData} />,
        },
        {
            title: 'Asal Kapal',
            content: <SimpleBarChart title="Asal Kapal Temuan" data={asalKapalData} />,
        },
    ];

    const slideGroupTwo = [
        {
            title: 'Jumlah Pelanggaran di Kawasan (Subzona)',
            content: <SimpleBarChart title="Jenis Pelanggaran Tiap Zona" data={pelanggaranZoneData} />,
        },
        {
            title: 'Waktu Respon Rata-rata dari Pelaporan',
            content: (
                <div className="h-full grid place-items-center text-center px-4">
                    <div>
                        <p className="text-sm text-slate-600 mb-2">Waktu Respon Rata-rata dari Pelaporan</p>
                        <p className="text-4xl font-extrabold text-[#0f5c7b]">1-2 bulan</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Capaian Patroli Belum Terealisasi',
            content: (
                <div className="h-full grid place-items-center text-center px-4">
                    <div>
                        <p className="text-sm text-slate-600 mb-2">Capaian Patroli Belum Terealisasi</p>
                        <p className="text-5xl font-extrabold text-red-400">24%</p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <section className="w-full rounded-2xl border border-slate-300 overflow-hidden bg-[#eef3f7] shadow-md text-slate-900">
            <div className="bg-[#0f5c7b] border-b border-slate-300 px-4 py-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
                <div className="shrink-0">
                    <h2 className="text-sm md:text-lg font-extrabold text-white whitespace-nowrap">Sistem Informasi Patrol Jaga Laut</h2>
                    <p className="text-[10px] md:text-[11px] font-semibold text-white/90 whitespace-nowrap">Kawasan Konservasi di Perairan Kepulauan Raja Ampat</p>
                </div>

                <div className="hidden lg:block w-px self-stretch bg-white/25 shrink-0" />

                <div className="grid grid-cols-2 xl:grid-cols-5 gap-1.5 xl:gap-2 flex-1">
                    <select value={kawasan} onChange={(e) => setKawasan(e.target.value)} className="h-8 px-2 rounded-md border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#63b3c8]/50">
                        <option value="all">Kawasan (area)</option>
                        {areaOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <select value={posKawasan} onChange={(e) => setPosKawasan(e.target.value)} className="h-8 px-2 rounded-md border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#63b3c8]/50">
                        <option value="all">Pos Kawasan</option>
                        {posOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowDatePanel((prev) => !prev)}
                            className="h-8 w-full px-2 rounded-md border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#63b3c8]/50 flex items-center justify-between gap-1 cursor-pointer"
                        >
                            <span className="truncate">{dateFrom || dateTo ? `${dateFrom || '…'} – ${dateTo || '…'}` : 'Rentang Tanggal'}</span>
                            <ChevronDown size={11} className="shrink-0" />
                        </button>
                        {showDatePanel && (
                            <div className="absolute top-full left-0 mt-1 z-50 min-w-44 bg-white border border-slate-300 rounded-md shadow-lg p-2.5 flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Dari</label>
                                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-7 px-2 w-full rounded border border-slate-300 bg-white text-slate-700 text-[11px]" />
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sampai</label>
                                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-7 px-2 w-full rounded border border-slate-300 bg-white text-slate-700 text-[11px]" />
                                {(dateFrom || dateTo) && (
                                    <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-[10px] text-red-500 hover:underline self-start mt-0.5 cursor-pointer">Reset</button>
                                )}
                            </div>
                        )}
                    </div>
                    <select value={tahun} onChange={(e) => setTahun(e.target.value)} className="h-8 px-2 rounded-md border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#63b3c8]/50">
                        <option value="all">Tahun</option>
                        {yearOptions.map((value) => <option key={value} value={value.toString()}>{value}</option>)}
                    </select>
                    <select value={quickInfo} onChange={(e) => setQuickInfo(e.target.value)} className="h-8 px-2 rounded-md border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#63b3c8]/50">
                        <option value="all">Informasi Cepat</option>
                        <option value="month">Bulan ini</option>
                        <option value="week">Minggu ini</option>
                        <option value="day">Hari ini</option>
                    </select>
                </div>
            </div>

            <div className={`relative xl:flex ${containerClassName || 'min-h-180'}`}>
                <div className={`relative border-r border-gray-300 transition-all duration-300 ${isRightPanelHidden ? 'xl:w-full' : 'xl:w-[64%]'}`}>
                    <div className="relative h-full min-h-[22rem]">
                        <LazyMapMount lang="ID">
                            <MapContainer
                                center={center}
                                zoom={zoom}
                                style={{ height: '100%', width: '100%' }}
                                minZoom={6}
                                maxZoom={16}
                                zoomControl={false}
                                scrollWheelZoom
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />

                                <MapBridge onReady={setMapRef} />
                                <MapController center={center} zoom={zoom} />

                                {filteredGeoJson && (
                                    <Pane name="zones" style={{ zIndex: 340 }}>
                                        <GeoJSON key={geoKey} data={filteredGeoJson} style={geoStyle} onEachFeature={onEachFeature} />
                                    </Pane>
                                )}

                                {userLocation && (
                                    <CircleMarker
                                        center={userLocation}
                                        radius={8}
                                        pathOptions={{ color: '#111827', fillColor: '#f9fafb', fillOpacity: 0.95, weight: 2 }}
                                    />
                                )}

                                <Pane name="markers" style={{ zIndex: 460 }}>
                                    {layers.timPatrol && markers.patrolMarkers.map((pt, i) => (
                                        <Marker key={`patrol-${pt.id}`} position={[pt.lat, pt.lng]} icon={ICONS.patrol}>
                                            <Popup>
                                                <PatrolPopupCard marker={pt} finding={findingDetails[i % findingDetails.length]} />
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {layers.temuan && markers.temuanMarkers.map((pt, i) => (
                                        <Marker key={`temuan-${pt.id}`} position={[pt.lat, pt.lng]} icon={ICONS.temuan}>
                                            <Popup>
                                                <PatrolPopupCard marker={pt} finding={findingDetails[(i + 2) % findingDetails.length]} />
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {layers.posJagaLaut && markers.posMarkers.map((pt) => (
                                        <Marker key={pt.id} position={[pt.lat, pt.lng]} icon={ICONS.pos}>
                                            <Popup>
                                                <PatrolPopupCard marker={pt} />
                                            </Popup>
                                        </Marker>
                                    ))}
                                </Pane>
                            </MapContainer>
                        </LazyMapMount>

                        <div className="absolute top-2 right-0 z-900 flex items-start gap-2 pointer-events-none">
                            {/* Floating panels — appear to the left of the strip */}
                            <div className="flex flex-col gap-2 items-end">
                                {showLegendPanel && (
                                    <div className="pointer-events-auto w-56 bg-white text-slate-800 border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                                        <div className="px-3 py-2 border-b border-slate-200 bg-[#e7f1f6] flex items-center justify-between">
                                            <span className="font-semibold text-[#0f4c6e] text-sm">Legend</span>
                                            <button type="button" onClick={() => setShowLegendPanel(false)} className="h-6 w-6 rounded border border-slate-300 grid place-items-center cursor-pointer hover:bg-slate-100"><X size={12} /></button>
                                        </div>
                                        <div className="p-3 space-y-3 text-sm text-slate-700">
                                            <div>
                                                <p className="font-semibold mb-1">Temuan</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.temuan }} />
                                                    Diterima
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold mb-1">Pos Jaga Laut</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.pos }} />
                                                    Pos Aktif
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold mb-1">Tim Patrol</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.patrol }} />
                                                    Armada Patroli
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showLayerPanel && (
                                    <div className="pointer-events-auto w-52 bg-white text-slate-800 border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                                        <div className="px-3 py-2 border-b border-slate-200 bg-[#e7f1f6] flex items-center justify-between">
                                            <span className="font-semibold text-[#0f4c6e] text-sm">Layers</span>
                                            <button type="button" onClick={() => setShowLayerPanel(false)} className="h-6 w-6 rounded border border-slate-300 grid place-items-center cursor-pointer hover:bg-slate-100"><X size={12} /></button>
                                        </div>
                                        <div className="p-3 space-y-2 text-sm text-slate-700">
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={layers.timPatrol} onChange={() => setLayers((prev) => ({ ...prev, timPatrol: !prev.timPatrol }))} />Tim Patrol</label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={layers.posJagaLaut} onChange={() => setLayers((prev) => ({ ...prev, posJagaLaut: !prev.posJagaLaut }))} />Pos Jaga Laut</label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={layers.temuan} onChange={() => setLayers((prev) => ({ ...prev, temuan: !prev.temuan }))} />Temuan</label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={layers.zonasiKK} onChange={() => setLayers((prev) => ({ ...prev, zonasiKK: !prev.zonasiKK }))} />Zonasi KK</label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Unified control strip — flush to right edge */}
                            <div className="pointer-events-auto bg-white border border-gray-300 border-r-0 rounded-l-xl shadow-md overflow-hidden flex flex-col divide-y divide-gray-200">
                                <button type="button" title="Lokasi saya" onClick={handleMyLocation} className="h-10 w-10 grid place-items-center cursor-pointer transition-colors text-[#0f5c7b] hover:bg-[#e8f4f8]">
                                    <MapPin size={16} />
                                </button>
                                <button type="button" title="Zoom in" onClick={() => mapRef?.zoomIn()} className="h-10 w-10 grid place-items-center cursor-pointer transition-colors text-[#0f5c7b] hover:bg-[#e8f4f8]"><Plus size={16} /></button>
                                <button type="button" title="Zoom out" onClick={() => mapRef?.zoomOut()} className="h-10 w-10 grid place-items-center cursor-pointer transition-colors text-[#0f5c7b] hover:bg-[#e8f4f8]"><Minus size={16} /></button>
                                <button type="button" title="Legend" onClick={() => setShowLegendPanel((prev) => !prev)} className={`h-10 w-10 grid place-items-center cursor-pointer transition-colors ${showLegendPanel ? 'bg-[#0f5c7b] text-white' : 'text-[#0f5c7b] hover:bg-[#e8f4f8]'}`}><Eye size={16} /></button>
                                <button type="button" title="Layers" onClick={() => setShowLayerPanel((prev) => !prev)} className={`h-10 w-10 grid place-items-center cursor-pointer transition-colors ${showLayerPanel ? 'bg-[#0f5c7b] text-white' : 'text-[#0f5c7b] hover:bg-[#e8f4f8]'}`}><Layers size={16} /></button>
                                <button
                                    type="button"
                                    title={isRightPanelHidden ? 'Tampilkan panel kanan' : 'Sembunyikan panel kanan'}
                                    onClick={() => setIsRightPanelHidden((prev) => !prev)}
                                    className={`h-10 w-10 grid place-items-center cursor-pointer transition-colors ${isRightPanelHidden ? 'bg-[#0f5c7b] text-white' : 'text-[#0f5c7b] hover:bg-[#e8f4f8]'}`}
                                >
                                    {isRightPanelHidden ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="absolute right-2 bottom-2 z-900 bg-white/90 rounded-md px-2 py-1 border border-gray-300 flex items-center gap-2">
                    <img src={papuabaratdayaLogo} alt="Logo Provinsi PBD" className="h-10 w-auto object-contain" />
                            <img src={kkpNormal} alt="Logo KKP" className="h-10 w-auto rounded-md bg-white px-1 py-1 object-contain" />
                        </div>
                    </div>
                </div>

                <aside
                    className={`bg-[#f4f8fb] p-3 md:p-4 border-t xl:border-t-0 border-slate-300 space-y-3 text-slate-700 xl:w-[36%] xl:min-w-87.5 xl:transition-all xl:duration-300 ${
                        isRightPanelHidden
                            ? 'xl:absolute xl:right-0 xl:top-0 xl:h-full xl:translate-x-[105%] xl:opacity-0 xl:pointer-events-none'
                            : 'xl:translate-x-0 xl:opacity-100'
                    }`}
                >
                    <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
                        <h3 className="text-center text-[12px] font-bold uppercase py-2 border-b border-gray-300 bg-[#e7f1f6] text-[#0f4c6e]">Ringkasan Aktivitas</h3>
                        <div className="grid grid-cols-2 text-xs font-semibold text-slate-700">
                            <div className="p-2 border-r border-b border-gray-300">Armada Aktif <span className="font-extrabold text-slate-900">: {activeFleet}</span></div>
                            <div className="p-2 border-b border-gray-300">Total Jangkauan Patroli Kawasan <span className="font-extrabold text-slate-900">: {coveragePercent}%</span></div>
                            <div className="p-2 border-r border-gray-300">Jumlah Patroli <span className="font-extrabold text-slate-900">: {totalPatrol}</span></div>
                            <div className="p-2">Total Jumlah Pelanggaran <span className="font-extrabold text-slate-900">: {totalViolations}</span></div>
                        </div>
                    </div>

                    <Slides slides={slideGroupOne} />
                    <Slides slides={slideGroupTwo} />

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setShowEmbedPanel((prev) => !prev)}
                            className="w-full h-9 rounded-md border border-[#0f5c7b]/35 bg-[#0f5c7b] text-white text-sm font-semibold hover:bg-[#0d4c66] transition-colors cursor-pointer"
                        >
                            Embed Code
                        </button>
                        {showEmbedPanel && (
                            <div className="rounded-md border border-gray-300 bg-white p-2">
                                <textarea readOnly value={embedCode} className="w-full h-24 text-[11px] p-2 border border-gray-300 rounded resize-none" />
                                <button
                                    type="button"
                                    onClick={copyEmbed}
                                    className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#0f5c7b]/25 bg-[#e7f1f6] text-[#0f4c6e] text-xs font-semibold hover:bg-[#d6eaf3] transition-colors cursor-pointer"
                                >
                                    <Copy size={13} /> {embedCopied ? 'Tersalin' : 'Copy Embed Code'}
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </section>
    );
}

function ClassicDashboardMap({
    points,
    center,
    zoom,
    geoJsonData,
    containerClassName = '',
    focusPoint = null,
    focusZoom = 10,
    focusRequestKey = 0,
    showResetFocus = false,
    onResetFocus,
    onSelectReport,
    hasStatusPoints = false,
    selectedZone = 'all',
    selectedPos = 'all',
    patrolTeamPoints = [],
    findingPoints = [],
}) {
    const internalGeoJson = geoJsonBaseData;
    const [mapRef, setMapRef] = useState(null);
    const [showLegendPanel, setShowLegendPanel] = useState(false);
    const [showLayerPanel, setShowLayerPanel] = useState(false);
    const [activeCard, setActiveCard] = useState(null);
    const [isCardBodyVisible, setIsCardBodyVisible] = useState(true);
    const [layers, setLayers] = useState({
        laporanMasuk: true,
        laporanTertunda: true,
        laporanDisetujui: true,
        timPatrol: true,
        posJagaLaut: true,
        posMonitoring: true,
        temuan: true,
        zonasiKK: true,
        koordinat: true,
    });

    const effectiveGeoJson = geoJsonData || internalGeoJson;

    const filteredGeoJson = useMemo(() => {
        if (!effectiveGeoJson) return null;
        return {
            ...effectiveGeoJson,
            features: effectiveGeoJson.features.filter((f) => {
                if (f?.geometry?.type === 'Point') return false;
                if (!layers.zonasiKK) return false;
                return true;
            }),
        };
    }, [effectiveGeoJson, layers.zonasiKK]);

    const geoKey = useMemo(() => filteredGeoJson?.features?.length || 0, [filteredGeoJson]);
    const posJagaSourcePoints = useMemo(() => normalizePosJagaGeoJson(posJagaGeoJson), []);
    const posMarkers = useMemo(() => groupPosPoints(points), [points]);
    const incomingPoints = useMemo(() => points.filter((pt) => pt.statusKey === 'incoming'), [points]);
    const pendingPoints = useMemo(() => points.filter((pt) => pt.statusKey === 'pending'), [points]);
    const approvedPoints = useMemo(() => points.filter((pt) => pt.statusKey === 'approved'), [points]);
    const visiblePatrolTeamPoints = useMemo(
        () => filterLayerPoints(patrolTeamPoints, selectedZone, selectedPos),
        [patrolTeamPoints, selectedPos, selectedZone],
    );
    const visiblePosJagaPoints = useMemo(
        () => filterLayerPoints(posJagaSourcePoints, selectedZone, selectedPos),
        [posJagaSourcePoints, selectedPos, selectedZone],
    );
    const visibleMonitoringPoints = useMemo(() => groupMonitoringPoints(points), [points]);
    const mapContainerClassName = containerClassName || 'h-105 md:h-130 lg:h-145';

    const handleFlyToFocus = () => {
        if (focusPoint && mapRef) {
            mapRef.flyTo([focusPoint.lat, focusPoint.lng], focusZoom, { duration: 1 });
        }
    };

    useEffect(() => {
        if (focusPoint && mapRef) {
            mapRef.flyTo([focusPoint.lat, focusPoint.lng], focusZoom, { duration: 1 });
        }
    }, [focusPoint, focusRequestKey, focusZoom, mapRef]);

    const handleSelectMarker = (marker) => {
        setActiveCard(buildMarkerCard(marker));
        setIsCardBodyVisible(true);
        if ((marker?.markerType === 'report' || marker?.markerType === 'temuan') && marker?.finding) {
            onSelectReport?.(marker.finding);
        }
    };

    return (
        <div className={`relative w-full ${mapContainerClassName} rounded-2xl overflow-hidden border border-white/10 shadow-sm bg-[#b7d6e3] z-0`}>
            <LazyMapMount lang="ID">
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%', background: '#b7d6e3' }}
                    minZoom={6}
                    maxZoom={16}
                    scrollWheelZoom
                    attributionControl={false}
                    zoomControl={false}
                >
                    <Pane name="monitoringBasePane" className="monitoring-basemap-pane" style={{ zIndex: 150 }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            opacity={0.72}
                        />
                    </Pane>
                    <MapBridge onReady={setMapRef} />
                    <MapController center={center} zoom={zoom} />
                    <Pane name="monitoringTooltipPane" style={{ zIndex: 1200 }} />

                    {filteredGeoJson && (
                        <Pane name="zoneLayerPane" style={{ zIndex: 350 }}>
                            <GeoJSON key={geoKey} data={filteredGeoJson} style={geoStyle} onEachFeature={onEachFeature} />
                        </Pane>
                    )}

                    <Pane name="pointsPane" style={{ zIndex: 450 }}>
                        {layers.timPatrol && visiblePatrolTeamPoints.map((pt) => (
                            <Marker
                                key={`tim-patrol-${pt.id}`}
                                position={[pt.lat, pt.lng]}
                                icon={ICONS.timPatrol}
                                eventHandlers={{
                                    click: () => handleSelectMarker({ ...pt, markerType: 'patrolTeam' }),
                                }}
                            />
                        ))}
                        {layers.posJagaLaut && visiblePosJagaPoints.map((pt) => (
                            <Marker
                                key={pt.id}
                                position={[pt.lat, pt.lng]}
                                icon={ICONS.posJaga}
                                eventHandlers={{
                                    click: () => handleSelectMarker(pt),
                                }}
                            />
                        ))}
                        {layers.posMonitoring && visibleMonitoringPoints.map((pt) => (
                            <Marker
                                key={pt.id}
                                position={[pt.lat, pt.lng]}
                                icon={ICONS.posMonitoring}
                                eventHandlers={{
                                    click: () => handleSelectMarker(pt),
                                }}
                            />
                        ))}
                        {hasStatusPoints ? (
                            <>
                                {layers.laporanMasuk && incomingPoints.map((pt) => (
                                    <Marker
                                        key={`incoming-${pt.id}`}
                                        position={[pt.lat, pt.lng]}
                                        icon={ICONS.incoming}
                                        eventHandlers={{
                                            click: () => handleSelectMarker({ ...pt, markerType: 'report' }),
                                        }}
                                    />
                                ))}
                                {layers.laporanTertunda && pendingPoints.map((pt) => (
                                    <Marker
                                        key={`pending-${pt.id}`}
                                        position={[pt.lat, pt.lng]}
                                        icon={ICONS.pending}
                                        eventHandlers={{
                                            click: () => handleSelectMarker({ ...pt, markerType: 'report' }),
                                        }}
                                    />
                                ))}
                                {layers.laporanDisetujui && approvedPoints.map((pt) => (
                                    <Marker
                                        key={`approved-${pt.id}`}
                                        position={[pt.lat, pt.lng]}
                                        icon={ICONS.approved}
                                        eventHandlers={{
                                            click: () => handleSelectMarker({ ...pt, markerType: 'report' }),
                                        }}
                                    />
                                ))}
                                {layers.temuan && findingPoints.map((pt) => (
                                    <Marker
                                        key={pt.id}
                                        position={[pt.lat, pt.lng]}
                                        icon={ICONS.temuanStatus}
                                        eventHandlers={{
                                            click: () => handleSelectMarker(pt),
                                        }}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                {layers.temuan && points.filter((pt) => pt.type === 'violation').map((pt, index) => (
                                    <Marker
                                        key={`temuan-${pt.id}`}
                                        position={[pt.lat, pt.lng]}
                                        icon={ICONS.temuan}
                                        eventHandlers={{
                                            click: () => handleSelectMarker({ ...pt, markerType: 'temuan', relatedIndex: index }),
                                        }}
                                    />
                                ))}
                                {layers.posJagaLaut && visiblePosJagaPoints.length === 0 && posMarkers.map((pt) => (
                                    <Marker
                                        key={pt.id}
                                        position={[pt.lat, pt.lng]}
                                        icon={ICONS.pos}
                                        eventHandlers={{
                                            click: () => handleSelectMarker(pt),
                                        }}
                                    />
                                ))}
                            </>
                        )}
                        {layers.koordinat && focusPoint && (
                            <Marker position={[focusPoint.lat, focusPoint.lng]} icon={FOCUS_ICON} />
                        )}
                    </Pane>
                </MapContainer>
            </LazyMapMount>

            {activeCard && (
                <div className="absolute left-3 top-3 z-[1200] w-[min(24rem,calc(100%-1.5rem))] overflow-hidden rounded-[16px] border border-slate-200 bg-white text-slate-900 shadow-2xl">
                    <div className="flex items-center justify-between bg-[#1b5f88] px-4 py-3 text-white">
                        <span className="truncate pr-3 text-[13px] font-bold">{activeCard.title}</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setIsCardBodyVisible((prev) => !prev)}
                                className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-white/10 cursor-pointer"
                                title={isCardBodyVisible ? 'Hide' : 'Show'}
                            >
                                {isCardBodyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCard(null)}
                                className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-white/10 cursor-pointer"
                                title="Close"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {isCardBodyVisible ? (
                        <div className="custom-scrollbar max-h-[27rem] overflow-y-auto">
                            <div className="border-b border-slate-200 bg-slate-50 p-2.5">
                                <img
                                    src={activeCard.imageSrc}
                                    alt={activeCard.title}
                                    className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                                />
                            </div>
                            <div className="divide-y divide-slate-200">
                                {activeCard.rows.map(([label, value], index) => (
                                    <div key={`${label}-${index}`} className="grid grid-cols-[8.5rem_1fr] gap-2.5 px-3 py-2 text-[12px] leading-tight">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="text-slate-900 break-words">{value || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            <div className="absolute top-3 right-3 z-[900] flex items-start gap-2 pointer-events-none">
                <div className="flex flex-col gap-2 items-end">
                    {showLegendPanel && (
                        <div className="pointer-events-auto w-56 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-200 bg-[#e7f1f6] px-3 py-2">
                                <span className="text-sm font-semibold text-[#0f4c6e]">Legend</span>
                                <button type="button" onClick={() => setShowLegendPanel(false)} className="grid h-6 w-6 place-items-center rounded border border-slate-300 hover:bg-slate-100 cursor-pointer">
                                    <X size={12} />
                                </button>
                            </div>
                            <div className="space-y-3 p-3 text-sm text-slate-700">
                                {focusPoint && (
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full border border-white bg-cyan-500 shadow-[0_0_0_3px_rgba(14,165,233,0.24)]" />
                                        <span>Koordinat Anda</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.timPatrol }} />
                                    <span>Tim Patrol</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.posJaga }} />
                                    <span>Pos Jaga Laut</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.posMonitoring }} />
                                    <span>Pos Monitoring</span>
                                </div>
                                {hasStatusPoints ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.temuanStatus }} />
                                            <span>Titik Temuan</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.incoming }} />
                                            <span>Laporan Masuk</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.pending }} />
                                            <span>Laporan Tertunda</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.approved }} />
                                            <span>Laporan Disetujui</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.patrol }} />
                                            <span>Armada Patroli</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.temuan }} />
                                            <span>Titik Temuan</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex" dangerouslySetInnerHTML={{ __html: LEGEND_ICONS.pos }} />
                                            <span>Pos Aktif</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-5 rounded-sm border border-black/10 bg-[#AFFCA1]" />
                                    <span>Zonasi KK</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {showLayerPanel && (
                        <div className="pointer-events-auto w-52 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-200 bg-[#e7f1f6] px-3 py-2">
                                <span className="text-sm font-semibold text-[#0f4c6e]">Layer</span>
                                <button type="button" onClick={() => setShowLayerPanel(false)} className="grid h-6 w-6 place-items-center rounded border border-slate-300 hover:bg-slate-100 cursor-pointer">
                                    <X size={12} />
                                </button>
                            </div>
                            <div className="space-y-2 p-3 text-sm text-slate-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={layers.timPatrol} onChange={() => setLayers((prev) => ({ ...prev, timPatrol: !prev.timPatrol }))} />
                                    Tim Patrol
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={layers.posJagaLaut} onChange={() => setLayers((prev) => ({ ...prev, posJagaLaut: !prev.posJagaLaut }))} />
                                    Pos Jaga Laut
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={layers.posMonitoring} onChange={() => setLayers((prev) => ({ ...prev, posMonitoring: !prev.posMonitoring }))} />
                                    Pos Monitoring
                                </label>
                                {hasStatusPoints ? (
                                    <>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={layers.temuan} onChange={() => setLayers((prev) => ({ ...prev, temuan: !prev.temuan }))} />
                                            Titik Temuan
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={layers.laporanMasuk} onChange={() => setLayers((prev) => ({ ...prev, laporanMasuk: !prev.laporanMasuk }))} />
                                            Laporan Masuk
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={layers.laporanTertunda} onChange={() => setLayers((prev) => ({ ...prev, laporanTertunda: !prev.laporanTertunda }))} />
                                            Laporan Tertunda
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={layers.laporanDisetujui} onChange={() => setLayers((prev) => ({ ...prev, laporanDisetujui: !prev.laporanDisetujui }))} />
                                            Laporan Disetujui
                                        </label>
                                    </>
                                ) : (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={layers.temuan} onChange={() => setLayers((prev) => ({ ...prev, temuan: !prev.temuan }))} />
                                        Temuan
                                    </label>
                                )}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={layers.koordinat} onChange={() => setLayers((prev) => ({ ...prev, koordinat: !prev.koordinat }))} />
                                    Koordinat Anda
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={layers.zonasiKK} onChange={() => setLayers((prev) => ({ ...prev, zonasiKK: !prev.zonasiKK }))} />
                                    Zonasi KK
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md divide-y divide-gray-200">
                    <button type="button" title="Koordinat anda" onClick={handleFlyToFocus} className="grid h-10 w-10 place-items-center text-[#0f5c7b] transition-colors hover:bg-[#e8f4f8] cursor-pointer">
                        <MapPin size={16} />
                    </button>
                    <button type="button" title="Zoom in" onClick={() => mapRef?.zoomIn()} className="grid h-10 w-10 place-items-center text-[#0f5c7b] transition-colors hover:bg-[#e8f4f8] cursor-pointer">
                        <Plus size={16} />
                    </button>
                    <button type="button" title="Zoom out" onClick={() => mapRef?.zoomOut()} className="grid h-10 w-10 place-items-center text-[#0f5c7b] transition-colors hover:bg-[#e8f4f8] cursor-pointer">
                        <Minus size={16} />
                    </button>
                    <button type="button" title="Legend" onClick={() => setShowLegendPanel((prev) => !prev)} className={`grid h-10 w-10 place-items-center transition-colors cursor-pointer ${showLegendPanel ? 'bg-[#0f5c7b] text-white' : 'text-[#0f5c7b] hover:bg-[#e8f4f8]'}`}>
                        <Eye size={16} />
                    </button>
                    <button type="button" title="Layer" onClick={() => setShowLayerPanel((prev) => !prev)} className={`grid h-10 w-10 place-items-center transition-colors cursor-pointer ${showLayerPanel ? 'bg-[#0f5c7b] text-white' : 'text-[#0f5c7b] hover:bg-[#e8f4f8]'}`}>
                        <Layers size={16} />
                    </button>
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[900] flex items-end justify-between gap-3">
                <div className="pointer-events-auto min-w-0">
                    {showResetFocus ? (
                        <button
                            type="button"
                            onClick={onResetFocus}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/35 bg-red-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-900/30 cursor-pointer"
                        >
                            <X size={13} /> Reset
                        </button>
                    ) : null}
                </div>

                <div className="flex items-center gap-2 px-1 py-1">
                    <img src={papuabaratdayaLogo} alt="Logo Provinsi PBD" className="h-10 w-auto object-contain" />
                    <img src={kkpNormal} alt="Logo KKP" className="h-10 w-auto rounded-md bg-white px-1 py-1 object-contain" />
                </div>
            </div>
        </div>
    );
}

export default function DashboardMap({
    lang = 'ID',
    points = [],
    center = [-0.7, 130.5],
    zoom = 8,
    geoJsonData = null,
    layoutVariant = 'classic',
    containerClassName = '',
    focusPoint = null,
    focusZoom = 10,
    focusRequestKey = 0,
    showResetFocus = false,
    onResetFocus,
    onSelectReport,
    selectedZone = 'all',
    selectedPos = 'all',
    patrolTeamPoints = [],
    findingPoints = [],
}) {
    if (layoutVariant === 'dashboard') {
        return <PatrolDashboardMap points={points} center={center} zoom={zoom} geoJsonData={geoJsonData} lang={lang} containerClassName={containerClassName} />;
    }
    const hasStatusPoints = points.some((point) => point?.statusKey);
    return (
        <ClassicDashboardMap
            points={points}
            center={center}
            zoom={zoom}
            geoJsonData={geoJsonData}
            lang={lang}
            containerClassName={containerClassName}
            focusPoint={focusPoint}
            focusZoom={focusZoom}
            focusRequestKey={focusRequestKey}
            showResetFocus={showResetFocus}
            onResetFocus={onResetFocus}
            onSelectReport={onSelectReport}
            hasStatusPoints={hasStatusPoints}
            selectedZone={selectedZone}
            selectedPos={selectedPos}
            patrolTeamPoints={patrolTeamPoints}
            findingPoints={findingPoints}
        />
    );
}

