export const POST_LOGIN_REDIRECT_STORAGE_KEY = "postLoginRedirect";

const AUTH_PUBLIC_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/ims/login",
  "/first-login",
];

/**

 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
export function getSafeInternalRedirect(raw) {
  if (raw == null || typeof raw !== "string") return null;
  let path;
  try {
    path = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  const pathOnly = path.split(/[?#]/)[0];
  if (!pathOnly || pathOnly === "/") return null;
  if (
    AUTH_PUBLIC_PATH_PREFIXES.some(
      (p) => pathOnly === p || pathOnly.startsWith(`${p}/`),
    )
  ) {
    return null;
  }
  return path;
}
