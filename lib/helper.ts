export const getURL = (path: string = "") => {
  // Prefer explicit public base URL; fall back to Vercel-provided URL.
  // Note: VERCEL_URL does not include a scheme.
  let url =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://next-app-hungngo269s-projects.vercel.app/";

  // Trim the URL and remove trailing slash if exists.
  url = url?.replace(/\/+$/, "");
  // Make sure to include `https://` when not localhost.
  url = url?.includes("http") ? url : url ? `https://${url}` : url;
  // Ensure path starts without a slash to avoid double slashes in the final URL.
  path = path.replace(/^\/+/, "");

  // Concatenate the URL and the path.
  return path ? `${url}/${path}` : url;
};
export function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
