export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return "--";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

export const matchAccept = (file: File, accept?: string): boolean => {
  const patterns = (accept ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!patterns.length) return true;

  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    }
    if (pattern.endsWith("/*")) {
      return file.type.startsWith(pattern.replace("/*", "/"));
    }
    return file.type === pattern;
  });
};

export const readImageDimensions = (
  url: string,
): Promise<{ width?: number; height?: number }> =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = url;
  });

export const generateUid = (): string =>
  `fu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
