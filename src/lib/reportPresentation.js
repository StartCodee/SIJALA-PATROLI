const HABITAT_LOCATION_MAP = {
  'manta sandy': { lat: -0.5639, lon: 130.6636 },
  'manta ridge': { lat: -0.5704, lon: 130.6542 },
  'pos dayan/batanta': { lat: -0.4436, lon: 130.5656 },
  'pos andau/fam': { lat: -0.2679, lon: 130.0627 },
  membarayup: { lat: -0.7239, lon: 130.5962 },
  'irwor inbekya': { lat: -0.6118, lon: 130.7055 },
  'arborek jetty': { lat: -0.5448, lon: 130.5316 },
  'blue magic': { lat: -0.5017, lon: 130.6614 },
  'cape kri': { lat: -0.5632, lon: 130.6008 },
};

function asRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value;
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toOptionalText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function toText(value, fallback = '-') {
  return toOptionalText(value) ?? fallback;
}

export function toNumber(value, fallback = null) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  const normalized = `${value ?? ''}`.trim().toLowerCase();
  if (['1', 'true', 'ya', 'yes'].includes(normalized)) return true;
  if (['0', 'false', 'tidak', 'no'].includes(normalized)) return false;
  return fallback;
}

export function toStringArray(value) {
  return toArray(value)
    .map((item) => toOptionalText(item))
    .filter(Boolean);
}

export function toMapPoint(value) {
  const point = asRecord(value);
  const lat = toNumber(point.lat);
  const lon = toNumber(point.lon);
  if (lat === null || lon === null) return null;
  return { lat, lon };
}

export function formatCoordinate(point) {
  if (!point) return '-';
  return `${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`;
}

export function joinText(parts, separator = ' / ', fallback = '-') {
  const values = parts.map((part) => toOptionalText(part)).filter(Boolean);
  return values.length > 0 ? values.join(separator) : fallback;
}

export function normalizeTeamOthers(raw) {
  const list = toArray(raw);
  const seen = new Set();
  const output = [];

  for (const item of list) {
    const row = asRecord(item);
    const name = toOptionalText(row.name) ?? toOptionalText(item);
    if (!name) continue;

    const role = toOptionalText(row.role) ?? 'Lainnya';
    const key = `${role.toLowerCase()}|${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    output.push({
      name,
      role,
      signature:
        row.signature && typeof row.signature === 'object' && !Array.isArray(row.signature)
          ? row.signature
          : null,
    });
  }

  return output;
}

function normalizeTeamRoles(raw) {
  return toArray(raw)
    .map((item) => {
      const row = asRecord(item);
      const role = toOptionalText(row.role);
      const name = toOptionalText(row.name);
      if (!role || !name) return null;
      return {
        role,
        name,
        signature:
          row.signature && typeof row.signature === 'object' && !Array.isArray(row.signature)
            ? row.signature
            : null,
      };
    })
    .filter(Boolean);
}

function normalizeTeamSnapshot(raw) {
  const snapshot = asRecord(raw);
  return {
    date: toOptionalText(snapshot.date),
    source: toOptionalText(snapshot.source) ?? 'unknown',
    completed: toBoolean(snapshot.completed),
    copiedFromDate: toOptionalText(snapshot.copiedFromDate),
    updatedAt: toOptionalText(snapshot.updatedAt),
    roles: normalizeTeamRoles(snapshot.roles),
    others: normalizeTeamOthers(snapshot.others),
    photoUrls: toStringArray(snapshot.photoUrls),
  };
}

function snapshotHasContent(snapshot) {
  return (
    snapshot.roles.length > 0 ||
    snapshot.others.length > 0 ||
    snapshot.photoUrls.length > 0 ||
    Boolean(snapshot.date)
  );
}

function buildLegacyAttendanceSnapshot(payload, fallbackDate) {
  const attendance = toArray(asRecord(payload).attendance)
    .map((item) => asRecord(item))
    .map((item) => ({
      role: toOptionalText(item.role),
      name: toOptionalText(item.memberName),
      signature:
        item.signature && typeof item.signature === 'object' && !Array.isArray(item.signature)
          ? item.signature
          : null,
    }))
    .filter((item) => item.role && item.name);

  if (attendance.length === 0) return null;

  const roles = attendance
    .filter((item) => item.role.toLowerCase() !== 'lainnya')
    .map((item) => ({
      role: item.role,
      name: item.name,
      signature: item.signature,
    }));
  const others = attendance
    .filter((item) => item.role.toLowerCase() === 'lainnya')
    .map((item) => ({
      role: 'Lainnya',
      name: item.name,
      signature: item.signature,
    }));

  return {
    date: fallbackDate,
    source: 'new_team',
    completed: false,
    copiedFromDate: null,
    updatedAt: null,
    roles,
    others,
    photoUrls: [],
    changed: false,
  };
}

function buildTeamHistoryRanges(teamHistoryEntries) {
  const compositionKey = (entry) =>
    JSON.stringify({
      roles: entry.roles
        .map((item) => ({
          role: item.role.toLowerCase(),
          name: item.name.toLowerCase(),
        }))
        .sort((left, right) =>
          `${left.role}:${left.name}`.localeCompare(`${right.role}:${right.name}`),
        ),
      others: entry.others
        .map((item) => ({
          role: item.role.toLowerCase(),
          name: item.name.toLowerCase(),
        }))
        .sort((left, right) =>
          `${left.role}:${left.name}`.localeCompare(`${right.role}:${right.name}`),
        ),
    });

  const sortedEntries = [...teamHistoryEntries].sort((left, right) =>
    `${left.date || ''}`.localeCompare(`${right.date || ''}`),
  );

  const ranges = [];
  for (const entry of sortedEntries) {
    const key = compositionKey(entry);
    const lastRange = ranges[ranges.length - 1];
    if (!lastRange || lastRange.key !== key) {
      ranges.push({
        key,
        startDate: entry.date,
        endDate: entry.date,
        source: entry.source,
        roles: entry.roles,
        others: entry.others,
        photoUrls: [...entry.photoUrls],
      });
      continue;
    }

    lastRange.endDate = entry.date || lastRange.endDate;
    lastRange.photoUrls = [...new Set([...lastRange.photoUrls, ...entry.photoUrls])];
  }

  return ranges;
}

export function normalizePatrolReport(report) {
  const payload = asRecord(report?.payload);
  const summary = asRecord(report?.summary);
  const patrolInfo = asRecord(payload.patrolInfo);
  const fuelAndRoute = asRecord(payload.fuelAndRoute);
  const closing = asRecord(payload.closing);
  const area = asRecord(payload.area);
  const post = asRecord(payload.post);

  const equipment = toStringArray(patrolInfo.equipment);
  const equipmentOther = toOptionalText(patrolInfo.equipmentOther);
  if (equipmentOther) {
    equipment.push(`Lainnya: ${equipmentOther}`);
  }

  const findings = toArray(payload.findings).map((item, index) => {
    const finding = asRecord(item);
    const violationTypes = toStringArray(finding.violationTypes);
    const fishingTools = toStringArray(finding.fishingTools);
    const explicitLocationZone = toOptionalText(finding.locationZone);

    return {
      id: `finding-${index + 1}`,
      order: index + 1,
      gpsNumber: toText(finding.gpsNumber),
      zoneCoordinate: toText(finding.zoneCoordinate),
      locationName: toText(finding.locationName, `Temuan #${index + 1}`),
      locationZoneGroup: toOptionalText(finding.locationZoneGroup),
      locationZoneDetail: toOptionalText(finding.locationZoneDetail),
      locationZone:
        explicitLocationZone ??
        joinText([finding.locationZoneGroup, finding.locationZoneDetail]),
      vesselName: toText(finding.vesselName),
      captainName: toText(finding.captainName),
      enginePower: toText(finding.enginePower),
      engineCount: toNumber(finding.engineCount, 0) ?? 0,
      crewCount: toNumber(finding.crewCount, 0) ?? 0,
      passengerCount: toNumber(finding.passengerCount, 0) ?? 0,
      shipKind: toText(finding.shipKind),
      shipKindOther: toOptionalText(finding.shipKindOther),
      shipCategory: toText(finding.shipCategory),
      shipCategoryOther: toOptionalText(finding.shipCategoryOther),
      engineType: toText(finding.engineType),
      shipOrigin: toText(finding.shipOrigin),
      hasViolation: toBoolean(finding.hasViolation, violationTypes.length > 0),
      violationTypes,
      violationDetail: toText(finding.violationDetail),
      fishingTools,
      fishingToolsOther: toOptionalText(finding.fishingToolsOther),
      actionTaken: toText(finding.actionTaken),
      notes: toOptionalText(finding.notes),
      photoUrls: toStringArray(finding.photoUrls),
      mapPoint: toMapPoint(finding.mapPoint),
    };
  });

  const baseTeamHistory = toArray(payload.teamHistory)
    .map((item) => {
      const entry = asRecord(item);
      const snapshot = normalizeTeamSnapshot(entry);
      return {
        ...snapshot,
        source: toOptionalText(entry.source) ?? snapshot.source,
        changed: toBoolean(entry.changed),
      };
    })
    .filter(snapshotHasContent);

  let teamHistory = baseTeamHistory;
  if (teamHistory.length === 0) {
    const teamSnapshot = normalizeTeamSnapshot(payload.teamSnapshot);
    if (snapshotHasContent(teamSnapshot)) {
      teamHistory = [
        {
          ...teamSnapshot,
          date: teamSnapshot.date ?? toOptionalText(patrolInfo.departureDate),
          changed: false,
        },
      ];
    }
  }
  if (teamHistory.length === 0) {
    const legacySnapshot = buildLegacyAttendanceSnapshot(
      payload,
      toOptionalText(patrolInfo.departureDate) ?? toOptionalText(report?.submittedAt),
    );
    if (legacySnapshot) {
      teamHistory = [legacySnapshot];
    }
  }

  return {
    areaName: toText(area.name, toText(report?.areaName)),
    areaCode: toText(area.code),
    postName: toText(post.name, toText(report?.postName)),
    summary,
    patrolInfo: {
      speedboatName: toText(patrolInfo.speedboatName),
      speedboatOther: toOptionalText(patrolInfo.speedboatOther),
      patrolSequence: toNumber(patrolInfo.patrolSequence),
      departureDate: toOptionalText(patrolInfo.departureDate),
      departureTime: toOptionalText(patrolInfo.departureTime),
      equipment,
    },
    fuelAndRoute: {
      fuelStartLiters: toNumber(fuelAndRoute.fuelStartLiters, 0) ?? 0,
      fuelNote: toText(fuelAndRoute.fuelNote),
      overnightLocation: toText(fuelAndRoute.overnightLocation),
      routePlan: toText(fuelAndRoute.routePlan),
    },
    closing: {
      fuelRemainingLiters: toNumber(closing.fuelRemainingLiters, 0) ?? 0,
      distanceKm: toNumber(closing.distanceKm, 0) ?? 0,
      monitoredArea: toText(closing.monitoredArea),
      returnDate: toOptionalText(closing.returnDate),
      returnTime: toOptionalText(closing.returnTime),
      finalSignature:
        closing.finalSignature &&
        typeof closing.finalSignature === 'object' &&
        !Array.isArray(closing.finalSignature)
          ? closing.finalSignature
          : null,
    },
    routePoints: toArray(fuelAndRoute.routePoints).map(toMapPoint).filter(Boolean),
    findings,
    teamHistoryRanges: buildTeamHistoryRanges(teamHistory),
    teamSnapshot: normalizeTeamSnapshot(payload.teamSnapshot),
  };
}

function normalizeFixedResourceEntry(item, index) {
  const entry = asRecord(item);
  return {
    id: `fixed-${index + 1}`,
    order: index + 1,
    location: toMapPoint(entry.location),
    gpsNumber: toText(entry.gpsNumber),
    type: toText(entry.type),
    typeOther: toOptionalText(entry.typeOther),
    objectName: toText(entry.objectName),
    functionUse: toText(entry.functionUse),
    inUse: toBoolean(entry.inUse, false),
    unitCount: toNumber(entry.unitCount, 0) ?? 0,
    photoUrls: toStringArray(entry.photoUrls),
  };
}

function normalizeCatchEntry(item, index) {
  const entry = asRecord(item);
  return {
    id: `catch-${index + 1}`,
    order: index + 1,
    catchName: toText(entry.catchName),
    count: toNumber(entry.count, 0) ?? 0,
    wetWeightKg: toNumber(entry.wetWeightKg, toNumber(entry.weightKg, 0)) ?? 0,
    dryWeightKg: toNumber(entry.dryWeightKg, 0) ?? 0,
    workDurationHours: toNumber(entry.workDurationHours, 0) ?? 0,
    lengthCm:
      toNumber(entry.totalLengthCm, toNumber(entry.lengthCm, 0)) ?? 0,
    photoUrls: toStringArray(entry.photoUrls),
  };
}

function normalizeNonFixedResourceEntry(item, index) {
  const entry = asRecord(item);
  const catches = toArray(entry.catches).map(normalizeCatchEntry);

  if (catches.length === 0 && toBoolean(entry.hasCatch)) {
    const fallbackWeight = toNumber(entry.catchWeightKg);
    const fallbackLength = toNumber(entry.catchLengthCm);
    if (fallbackWeight !== null || fallbackLength !== null) {
      catches.push({
        id: 'catch-1',
        order: 1,
        catchName: toText(entry.catchName),
        count: toNumber(entry.count, 0) ?? 0,
        wetWeightKg: fallbackWeight ?? 0,
        dryWeightKg: 0,
        workDurationHours: 0,
        lengthCm: fallbackLength ?? 0,
        photoUrls: toStringArray(entry.photoUrls),
      });
    }
  }

  return {
    id: `non-fixed-${index + 1}`,
    order: index + 1,
    location: toMapPoint(entry.location),
    gpsNumber: toText(entry.gpsNumber),
    userType: toText(entry.userType),
    activity: toText(entry.activity),
    activityOther: toOptionalText(entry.activityOther),
    origin: toText(entry.origin),
    interviewed: toBoolean(entry.interviewed),
    interviewNote: toText(entry.interviewNote),
    interviewPhotoUrls: toStringArray(entry.interviewPhotoUrls),
    hasCatch: toBoolean(entry.hasCatch),
    photoUrls: toStringArray(entry.photoUrls),
    catches,
  };
}

function normalizeMegafaunaEntry(item, index) {
  const entry = asRecord(item);
  return {
    id: `megafauna-${index + 1}`,
    order: index + 1,
    location: toMapPoint(entry.location),
    gpsNumber: toText(entry.gpsNumber),
    placeName: toText(entry.placeName),
    species: toText(entry.species || entry.speciesName),
    speciesOther: toOptionalText(entry.speciesOther),
    speciesName: toOptionalText(entry.speciesName),
    count: toNumber(entry.count, 0) ?? 0,
    photoUrls: toStringArray(entry.photoUrls),
  };
}

function collectEntries(payload, pluralKey, singularKey, normalizer) {
  const pluralEntries = toArray(payload[pluralKey]).map(normalizer);
  if (pluralEntries.length > 0) return pluralEntries;

  const singularEntry = asRecord(payload[singularKey]);
  const hasContent =
    Object.keys(singularEntry).length > 0 &&
    Object.values(singularEntry).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return Number.isFinite(value) && value > 0;
      if (value && typeof value === 'object') return toMapPoint(value) !== null;
      return false;
    });

  return hasContent ? [normalizer(singularEntry, 0)] : [];
}

export function normalizeResourceUseReport(report) {
  const payload = asRecord(report?.payload);
  const summary = asRecord(report?.summary);

  const fixedEntries = collectEntries(payload, 'fixedResources', 'fixedResource', normalizeFixedResourceEntry);
  const nonFixedEntries = collectEntries(
    payload,
    'nonFixedResources',
    'nonFixedResource',
    normalizeNonFixedResourceEntry,
  );
  const megafaunaEntries = collectEntries(
    payload,
    'megafaunaEntries',
    'megafauna',
    normalizeMegafaunaEntry,
  );

  const markers = [
    ...fixedEntries
      .filter((entry) => entry.location)
      .map((entry) => ({
        lat: entry.location.lat,
        lon: entry.location.lon,
        label: `Sumber Daya Tetap #${entry.order}`,
        description: joinText([entry.type, entry.objectName], ' · '),
        color: '#22c55e',
        iconSymbol: '🪸',
        iconColor: '#16a34a',
      })),
    ...nonFixedEntries
      .filter((entry) => entry.location)
      .map((entry) => ({
        lat: entry.location.lat,
        lon: entry.location.lon,
        label: `Pemanfaatan #${entry.order}`,
        description: joinText([entry.userType, entry.activity], ' · '),
        color: '#f59e0b',
        iconSymbol: '🎣',
        iconColor: '#d97706',
      })),
    ...megafaunaEntries
      .filter((entry) => entry.location)
      .map((entry) => ({
        lat: entry.location.lat,
        lon: entry.location.lon,
        label: `Megafauna #${entry.order}`,
        description: joinText([entry.species, entry.placeName], ' · '),
        color: '#3b82f6',
        iconSymbol: '🐋',
        iconColor: '#2563eb',
      })),
  ];

  return {
    summary,
    areaName: toText(report?.areaName),
    postName: toText(report?.postName),
    fixedEntries,
    nonFixedEntries,
    megafaunaEntries,
    teamSnapshot: normalizeTeamSnapshot(payload.teamSnapshot),
    markers,
  };
}

function normalizeHabitatLocation(locationName) {
  const key = String(locationName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  return HABITAT_LOCATION_MAP[key] ?? null;
}

export function normalizeHabitatReport(report) {
  const payload = asRecord(report?.payload);
  const summary = asRecord(report?.summary);
  const visitorData = asRecord(payload.visitorData);
  const habitatEntries = toArray(payload.habitatEntries).map((item, index) => {
    const entry = asRecord(item);
    const location = toText(entry.location, `Lokasi ${index + 1}`);
    const point = normalizeHabitatLocation(location);
    const personnel = [1, 2, 3, 4, 5]
      .map((slot) => ({
        slot,
        label: `Personel ${slot}`,
        name: toOptionalText(entry[`officer${slot}`]),
      }))
      .filter((person) => person.name);

    return {
      id: `habitat-${index + 1}`,
      order: index + 1,
      location,
      date: toText(entry.date),
      time: toText(entry.time),
      signature:
        entry.signature && typeof entry.signature === 'object' && !Array.isArray(entry.signature)
          ? entry.signature
          : null,
      personnel,
      point,
    };
  });

  const markers = habitatEntries
    .filter((entry) => entry.point)
    .map((entry) => ({
      lat: entry.point.lat,
      lon: entry.point.lon,
      label: entry.location,
      description: joinText(
        [entry.personnel[0]?.name, entry.time !== '-' ? entry.time : null],
        ' · ',
      ),
      color: '#2563eb',
    }));

  return {
    summary,
    areaName: toText(report?.areaName),
    postName: toText(report?.postName),
    visitorData: {
      operatorName: toText(visitorData.operatorName),
      damageDescription: toText(visitorData.damageDescription),
      actionTaken: toText(visitorData.actionTaken),
      solution: toText(visitorData.solution),
      touristCount: toNumber(visitorData.touristCount, 0) ?? 0,
      guideCount: toNumber(visitorData.guideCount, 0) ?? 0,
      totalPeople: toNumber(visitorData.totalPeople, 0) ?? 0,
      mantaSightingsCount: toNumber(visitorData.mantaSightingsCount, 0) ?? 0,
      hasViolation: toBoolean(visitorData.hasViolation),
      violationTypes: toStringArray(visitorData.violationTypes),
      tjlPhotoUrls: toStringArray(visitorData.tjlPhotoUrls),
    },
    habitatEntries,
    teamSnapshot: normalizeTeamSnapshot(payload.teamSnapshot),
    markers,
  };
}

export function getReportTypeLabel(type) {
  switch (type) {
    case 'PATROL_JAGA_LAUT':
      return 'Patroli';
    case 'RESOURCE_USE_MONITORING':
      return 'Monitoring Pemanfaatan';
    case 'OTHER_MONITORING':
      return 'Monitoring Habitat';
    default:
      return 'Laporan';
  }
}

export function getReportRoute(report) {
  if (!report?.id) return '#';
  if (report.type === 'PATROL_JAGA_LAUT') return `/patrols/${report.id}`;
  if (report.type === 'RESOURCE_USE_MONITORING') return `/monitoring-megafauna/${report.id}`;
  return `/monitoring-habitat/${report.id}`;
}

export function getReportSummaryLine(report) {
  const summary = asRecord(report?.summary);

  if (report?.type === 'PATROL_JAGA_LAUT') {
    return [
      `${toNumber(summary.findingCount, 0) ?? 0} temuan`,
      `${toNumber(summary.violationCount, 0) ?? 0} pelanggaran`,
      toOptionalText(summary.speedboatName),
    ]
      .filter(Boolean)
      .join(' • ');
  }

  if (report?.type === 'RESOURCE_USE_MONITORING') {
    return [
      `${toNumber(summary.fixedEntryCount, 0) ?? 0} tetap`,
      `${toNumber(summary.nonFixedEntryCount, 0) ?? 0} tidak tetap`,
      `${toNumber(summary.megafaunaEntryCount, 0) ?? 0} megafauna`,
    ].join(' • ');
  }

  return [
    `${toNumber(summary.habitatCount, 0) ?? 0} entri`,
    `${toNumber(summary.totalPeople, 0) ?? 0} pengunjung`,
    `${toNumber(summary.mantaSightingsCount, 0) ?? 0} manta`,
  ].join(' • ');
}
