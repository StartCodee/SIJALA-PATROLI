const MONTH_MAP = {
  januari: "01",
  februari: "02",
  maret: "03",
  april: "04",
  mei: "05",
  juni: "06",
  juli: "07",
  agustus: "08",
  september: "09",
  oktober: "10",
  november: "11",
  desember: "12",
  january: "01",
  february: "02",
  march: "03",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  october: "10",
  december: "12",
};

export const DEFAULT_FILTER_RANGE = {
  from: "2025-01-01",
  to: "2025-12-31",
};

function normalizeDateText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ");
}

export function normalizeOptionLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "");
}

export function getDateValue(value) {
  if (!value) return "";

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  if (/^\d{4}-\d{2}/.test(text)) {
    return `${text.slice(0, 7)}-01`;
  }

  const normalized = normalizeDateText(text);
  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length >= 3) {
    const dayToken = parts.find((part) => /^\d{1,2}$/.test(part));
    const yearToken = parts.find((part) => /^\d{4}$/.test(part));
    const monthToken = parts.find((part) => MONTH_MAP[part]);

    if (dayToken && yearToken && monthToken) {
      return `${yearToken}-${MONTH_MAP[monthToken]}-${dayToken.padStart(2, "0")}`;
    }
  }

  return "";
}

export function isDateInRange(dateValue, from, to) {
  if (!dateValue) return true;
  if (from && dateValue < from) return false;
  if (to && dateValue > to) return false;
  return true;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function toInputDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function resolveQuickRangeDates(range, baseDate = new Date()) {
  const end = new Date(baseDate);
  const year = end.getFullYear();
  const month = end.getMonth();
  const day = end.getDate();

  if (range === "tahunan") {
    return {
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    };
  }

  if (range === "bulanan") {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { from: toInputDate(firstDay), to: toInputDate(lastDay) };
  }

  if (range === "mingguan") {
    const start = new Date(year, month, day - 6);
    return { from: toInputDate(start), to: toInputDate(end) };
  }

  if (range === "harian") {
    const today = toInputDate(end);
    return { from: today, to: today };
  }

  return { ...DEFAULT_FILTER_RANGE };
}

export function formatFilterDateLabel(value) {
  if (!value) return "";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function findOptionValueByLabel(options, labelText) {
  const normalizedLabel = normalizeOptionLabel(labelText);
  if (!normalizedLabel) return "";

  const exact = options.find((option) => normalizeOptionLabel(option.label?.ID) === normalizedLabel);
  if (exact) return exact.value;

  const include = options.find((option) => {
    const candidate = normalizeOptionLabel(option.label?.ID);
    return candidate && (candidate.includes(normalizedLabel) || normalizedLabel.includes(candidate));
  });

  return include?.value || "";
}

export function parseNumericCoordinate(value) {
  const match = String(value || "").match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseCoordinatePair(coordinateText) {
  const numbers = String(coordinateText || "").match(/-?\d+(?:[.,]\d+)?/g);
  if (!numbers || numbers.length < 2) return null;

  const lat = Number(numbers[0].replace(",", "."));
  const lng = Number(numbers[1].replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export function formatIndonesiaNumber(value) {
  return Number(value || 0).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatReportDate(value, fallbackTime = "08:00") {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const dateText = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${dateText} ${fallbackTime}`;
}

export function formatLatencyDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}h`);
  if (hours > 0 || days > 0) parts.push(`${hours}j`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}d`);

  return parts.join(" ");
}
