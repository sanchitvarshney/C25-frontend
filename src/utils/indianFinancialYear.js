export function getIndianFinancialYearStartYear(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return m >= 3 ? y : y - 1;
}

/** Axios / Session header format e.g. "26-27" */
export function getCurrentIndianFinancialYearSession(date = new Date()) {
  const start = getIndianFinancialYearStartYear(date);
  const a = String(start).slice(-2);
  const b = String(start + 1).slice(-2);
  return `${a}-${b}`;
}

/** Full year label e.g. "2026-2027" */
export function getCurrentIndianFinancialYearFullLabel(date = new Date()) {
  const start = getIndianFinancialYearStartYear(date);
  return `${start}-${start + 1}`;
}

export function fiscalStartYearFromSessionCode(code) {
  const yy = parseInt(String(code).split("-")[0], 10);
  return 2000 + yy;
}

export function sessionCodeFromFiscalStartYear(fyStartYear) {
  const a = String(fyStartYear).slice(-2);
  const b = String(fyStartYear + 1).slice(-2);
  return `${a}-${b}`;
}

/**
 * If `stored` encodes a past Indian FY relative to `now`, returns the current
 * session code; otherwise returns `stored` (or current FY when missing/invalid).
 */
export function resolveSessionToCurrentFinancialYearIfStale(
  stored,
  now = new Date(),
) {
  const current = getCurrentIndianFinancialYearSession(now);
  if (stored == null || String(stored).trim() === "") {
    return current;
  }
  try {
    const storedStart = fiscalStartYearFromSessionCode(stored);
    const currentStart = fiscalStartYearFromSessionCode(current);
    if (Number.isNaN(storedStart) || Number.isNaN(currentStart)) {
      return current;
    }
    if (storedStart < currentStart) {
      return current;
    }
  } catch {
    return current;
  }
  return String(stored);
}

/** Keeps every legacy session and adds any FY from the oldest legacy through today’s FY. Newest first. */
export function buildMergedSessionSelectOptions(
  legacySessionValues,
  now = new Date(),
) {
  const currentStart = getIndianFinancialYearStartYear(now);
  const legacyStarts = legacySessionValues.map(fiscalStartYearFromSessionCode);
  const minStart = Math.min(...legacyStarts, currentStart);
  const set = new Set(legacySessionValues);
  for (let sy = minStart; sy <= currentStart; sy++) {
    set.add(sessionCodeFromFiscalStartYear(sy));
  }
  const sorted = Array.from(set).sort(
    (a, b) =>
      fiscalStartYearFromSessionCode(b) - fiscalStartYearFromSessionCode(a),
  );
  return sorted.map((value) => ({ label: `Session ${value}`, value }));
}

export function normalizeMsmeYearValue(v) {
  return String(v).replace(/\s+/g, "");
}

function fiscalStartYearFromMsmeValue(v) {
  const y = parseInt(normalizeMsmeYearValue(v).split("-")[0], 10);
  return y;
}

/** Merges hardcoded MSME rows with every FY from the oldest listed through the current Indian FY. Newest first. */
export function mergeMsmeYearOptions(legacyOptions, now = new Date()) {
  const currentStart = getIndianFinancialYearStartYear(now);
  const byKey = new Map();
  for (const o of legacyOptions) {
    const key = normalizeMsmeYearValue(o.value);
    if (!byKey.has(key)) byKey.set(key, { text: o.text, value: o.value });
  }
  const keys = [...byKey.keys()];
  const legacyMin =
    keys.length > 0
      ? Math.min(...keys.map((k) => fiscalStartYearFromMsmeValue(k)))
      : currentStart;
  const minStart = Math.min(legacyMin, currentStart);
  for (let y = minStart; y <= currentStart; y++) {
    const key = `${y}-${y + 1}`;
    if (!byKey.has(key)) byKey.set(key, { text: `${y}-${y + 1}`, value: key });
  }
  return [...byKey.values()].sort(
    (a, b) =>
      fiscalStartYearFromMsmeValue(b.value) -
      fiscalStartYearFromMsmeValue(a.value),
  );
}

/** Default sessions always retained in the header switcher; current FY is appended automatically when it advances. */
export const LEGACY_SESSION_CODES = ["25-26"];
