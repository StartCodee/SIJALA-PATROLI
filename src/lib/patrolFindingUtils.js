export const FINDING_ID_SEPARATOR = '__finding__';

const toText = (value, fallback = '-') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length === 0 ? fallback : text;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const toMapPoint = (value) => {
  const lat = Number(value?.lat);
  const lon = Number(value?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
};

export const composeFindingId = (reportId, findingIndex) =>
  `${reportId}${FINDING_ID_SEPARATOR}${findingIndex}`;

export const parseFindingId = (rawId) => {
  if (typeof rawId !== 'string') return null;
  const markerPos = rawId.lastIndexOf(FINDING_ID_SEPARATOR);
  if (markerPos === -1) return null;

  const reportId = rawId.slice(0, markerPos);
  const rawIndex = rawId.slice(markerPos + FINDING_ID_SEPARATOR.length);
  const findingIndex = Number(rawIndex);

  if (!reportId || !Number.isInteger(findingIndex) || findingIndex < 0) return null;
  return { reportId, findingIndex };
};

export const mapReportStatusToIncidentStatus = (reportStatus) => {
  if (reportStatus === 'validated') return 'closed';
  if (reportStatus === 'rejected') return 'open';
  return 'investigating';
};

const deriveIncidentSeverity = (finding) => {
  if (!finding.hasViolation) return 'low';
  const detailWeight = finding.violationDetail !== '-' ? 1 : 0;
  const score = finding.violationTypes.length + detailWeight;
  if (score >= 2) return 'high';
  return 'medium';
};

export const mapPatrolReportFindings = (report) => {
  if (!report || report.type !== 'PATROL_JAGA_LAUT') return [];

  const payload = report.payload && typeof report.payload === 'object' ? report.payload : {};
  const findings = toArray(payload.findings);

  return findings.map((finding, index) => {
    const violationTypes = toArray(finding?.violationTypes)
      .map((item) => toText(item, '').trim())
      .filter(Boolean);

    const fishingTools = toArray(finding?.fishingTools)
      .map((item) => toText(item, '').trim())
      .filter(Boolean);

    const violationDetail = toText(finding?.violationDetail, '-');
    const hasViolation =
      Boolean(finding?.hasViolation) || violationTypes.length > 0 || violationDetail !== '-';

    const photoUrls = toArray(finding?.photoUrls)
      .map((item) => toText(item, '').trim())
      .filter(Boolean);
    const explicitLocationZone = toText(finding?.locationZone, '').trim();
    const derivedLocationZone = [
      toText(finding?.locationZoneGroup, '').trim(),
      toText(finding?.locationZoneDetail, '').trim(),
    ]
      .filter(Boolean)
      .join(' / ');
    const locationZone = explicitLocationZone || derivedLocationZone || '-';

    return {
      id: composeFindingId(report.id, index),
      findingIndex: index,
      reportId: report.id,
      reportCode: toText(report.reportCode),
      reportStatus: toText(report.status, 'pending'),
      reviewNote: toText(report.reviewNote),
      areaName: toText(report.areaName),
      postName: toText(report.postName),
      submittedAt: report.submittedAt || null,
      submittedBy: toText(report.submittedBy),

      locationName: toText(finding?.locationName, 'Lokasi Tidak Diketahui'),
      gpsNumber: toText(finding?.gpsNumber),
      zoneCoordinate: toText(finding?.zoneCoordinate),
      locationZone,
      mapPoint: toMapPoint(finding?.mapPoint),

      vesselName: toText(finding?.vesselName),
      captainName: toText(finding?.captainName),
      enginePower: toText(finding?.enginePower),
      engineCount: Number(finding?.engineCount ?? 0),
      crewCount: Number(finding?.crewCount ?? 0),
      passengerCount: Number(finding?.passengerCount ?? 0),
      shipKind: toText(finding?.shipKind),
      shipKindOther: toText(finding?.shipKindOther, ''),
      shipCategory: toText(finding?.shipCategory),
      shipCategoryOther: toText(finding?.shipCategoryOther, ''),
      engineType: toText(finding?.engineType),
      shipOrigin: toText(finding?.shipOrigin),

      hasViolation,
      violationTypes,
      violationDetail,
      actionTaken: toText(finding?.actionTaken),
      fishingTools,
      fishingToolsOther: toText(finding?.fishingToolsOther, ''),
      notes: toText(finding?.notes, ''),
      photoUrls,
      rawFinding: finding,
      rawReport: report,
    };
  });
};

export const mapPatrolReportsToFindings = (reports = []) =>
  reports.flatMap((report) => mapPatrolReportFindings(report));

export const mapPatrolReportsToIncidents = (reports = []) =>
  mapPatrolReportsToFindings(reports)
    .filter((finding) => finding.hasViolation)
    .map((finding) => ({
      ...finding,
      incidentId: finding.id,
      status: mapReportStatusToIncidentStatus(finding.reportStatus),
      severity: deriveIncidentSeverity(finding),
      category: finding.violationTypes[0] || 'Pelanggaran Lainnya',
      title: finding.violationTypes[0]
        ? `${finding.violationTypes[0]} · ${finding.locationName}`
        : `Pelanggaran · ${finding.locationName}`,
      description:
        finding.violationDetail !== '-'
          ? finding.violationDetail
          : finding.actionTaken !== '-'
            ? finding.actionTaken
            : 'Temuan pelanggaran dari laporan patroli.',
      time: finding.submittedAt,
    }));

export const isWebImageUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());

function apiOrigin() {
  const configured = import.meta.env.VITE_API_BASE_URL || '/api';
  try {
    return new URL(configured).origin;
  } catch {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:4200';
  }
}

function appOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return apiOrigin();
}

function shouldUseAppUploadProxy() {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

function uploadBaseOrigin() {
  return shouldUseAppUploadProxy() ? appOrigin() : apiOrigin();
}

export const normalizeAttachmentUrl = (url) => {
  const raw = typeof url === 'string' ? url.trim() : '';
  if (!raw) return '';

  if (raw.startsWith('/uploads/')) {
    return `${uploadBaseOrigin()}${raw}`;
  }

  if (!/^https?:\/\//i.test(raw)) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith('/uploads/')) {
      const problematicHosts = new Set(['10.0.2.2', '127.0.0.1', 'localhost']);
      const mixedContentRisk = shouldUseAppUploadProxy() && parsed.protocol === 'http:';

      if (problematicHosts.has(parsed.hostname) || mixedContentRisk) {
        return `${uploadBaseOrigin()}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    }
    return parsed.toString();
  } catch {
    return raw;
  }
};
