
const MAX_CONSOLE = 10;
const MAX_NETWORK = 10;

const _store = {
  consoleLogs: [],
  networkLogs: [],
  wsSockets: new Map(),
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function _serialize(a) {
  try {
    return typeof a === "object" && a !== null ? JSON.stringify(a) : String(a);
  } catch {
    return "[unserializable]";
  }
}

function _pushNetwork(entry) {
  _store.networkLogs.push(entry);
  if (_store.networkLogs.length > MAX_NETWORK) _store.networkLogs.shift();
}

const _origConsole = {};
["error", "warn", "info", "log"].forEach((level) => {
  _origConsole[level] = console[level].bind(console);
  console[level] = (...args) => {
    try {
      const message = args.map(_serialize).join(" ");
      const last = _store.consoleLogs[_store.consoleLogs.length - 1];
      if (last && last.level === level && last.message === message) {
        last.count = (last.count || 1) + 1;
        last.lastTime = new Date().toISOString();
      } else {
        _store.consoleLogs.push({ level, message, time: new Date().toISOString(), count: 1 });
        if (_store.consoleLogs.length > MAX_CONSOLE) _store.consoleLogs.shift();
      }
    } catch (_) {}
    _origConsole[level](...args);
  };
});

// ── Fetch interceptor ────────────────────────────────────────────────────────
const _origFetch = window.fetch;
window.fetch = async function patchedFetch(input, init) {
  const url =
    typeof input === "string"
      ? input
      : input instanceof Request
      ? input.url
      : String(input);
  const method = (
    init?.method ||
    (input instanceof Request ? input.method : "GET")
  ).toUpperCase();
  const t0 = Date.now();
  const entry = { type: "fetch", method, url, time: new Date().toISOString() };
  try {
    const res = await _origFetch.call(this, input, init);
    entry.status = res.status;
    entry.duration = `${Date.now() - t0}ms`;
    _pushNetwork(entry);
    return res;
  } catch (err) {
    entry.error = err.message;
    entry.duration = `${Date.now() - t0}ms`;
    _pushNetwork(entry);
    throw err;
  }
};

// ── XHR interceptor (covers axios and any XHR-based libs) ────────────────────
const _OrigXHR = window.XMLHttpRequest;
function PatchedXHR() {
  const xhr = new _OrigXHR();
  const meta = {};

  const _open = xhr.open.bind(xhr);
  xhr.open = function (method, url, ...rest) {
    meta.method = String(method).toUpperCase();
    meta.url = url;
    meta.time = new Date().toISOString();
    meta.t0 = Date.now();
    return _open(method, url, ...rest);
  };

  xhr.addEventListener("loadend", () => {
    try {
      let response = null;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        response = xhr.responseText
          ? xhr.responseText.slice(0, 500)
          : null;
      }
      _pushNetwork({
        type: "xhr",
        method: meta.method,
        url: meta.url,
        status: xhr.status,
        duration: `${Date.now() - (meta.t0 ?? Date.now())}ms`,
        time: meta.time,
        response,
      });
    } catch (_) {}
  });

  return xhr;
}
PatchedXHR.prototype = _OrigXHR.prototype;
window.XMLHttpRequest = PatchedXHR;

// ── WebSocket interceptor ────────────────────────────────────────────────────
const _OrigWS = window.WebSocket;
class PatchedWebSocket extends _OrigWS {
  constructor(url, protocols) {
    super(url, protocols);
    const urlStr = String(typeof url === "string" ? url : url);
    const prev = _store.wsSockets.get(urlStr);
    const entry = {
      type: "websocket",
      url: urlStr,
      status: "connecting",
      attempts: (prev?.attempts ?? 0) + 1,
      firstSeen: prev?.firstSeen ?? new Date().toISOString(),
      lastAttempt: new Date().toISOString(),
      t0: Date.now(),
    };
    _store.wsSockets.set(urlStr, entry);

    this.addEventListener("open", () => {
      entry.status = "connected";
      entry.connectedAt = new Date().toISOString();
      entry.connectDuration = `${Date.now() - entry.t0}ms`;
    });

    this.addEventListener("error", () => {
      entry.status = "error";
      entry.lastError = new Date().toISOString();
    });

    this.addEventListener("close", (e) => {
      entry.status = "closed";
      entry.closeCode = e.code;
      entry.closeReason = e.reason || null;
    });
  }
}
window.WebSocket = PatchedWebSocket;

// ── Public API ───────────────────────────────────────────────────────────────
export function getDiagnostics() {
  const ls = {};
  const REDACT_LS = ["token", "password", "secret"];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (REDACT_LS.some((r) => key.toLowerCase().includes(r))) {
      ls[key] = "[redacted]";
      continue;
    }
    try {
      ls[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      ls[key] = localStorage.getItem(key);
    }
  }

  // SessionStorage
  const ss = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    try {
      ss[key] = JSON.parse(sessionStorage.getItem(key));
    } catch {
      ss[key] = sessionStorage.getItem(key);
    }
  }

  // Cookies
  const cookies = {};
  document.cookie.split(";").forEach((c) => {
    const idx = c.indexOf("=");
    if (idx > 0) cookies[c.slice(0, idx).trim()] = c.slice(idx + 1).trim();
  });

  return {
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      origin: window.location.origin,
      url: window.location.href,
      referrer: document.referrer || null,
      screen: `${window.screen.width}×${window.screen.height}`,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      online: navigator.onLine,
    },
    console: _store.consoleLogs,
    network: {
      requests: _store.networkLogs,
      sockets: Array.from(_store.wsSockets.values()).map(({ t0, ...rest }) => rest),
    },
    application: {
      localStorage: ls,
      sessionStorage: ss,
      cookies,
    },
    capturedAt: new Date().toISOString(),
  };
}
