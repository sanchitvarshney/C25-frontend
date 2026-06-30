type DetailedDownloadFn = () => void;

let handler: DetailedDownloadFn | null = null;

export function registerReportNavDetailedDownload(fn: DetailedDownloadFn) {
  handler = fn;
}

export function unregisterReportNavDetailedDownload() {
  handler = null;
}

export function triggerReportNavDetailedDownload() {
  handler?.();
}
