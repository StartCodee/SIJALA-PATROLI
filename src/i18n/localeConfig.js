export const LANGUAGE_STORAGE_KEY = "sijala_patroli_language_v1";

export const DEFAULT_LANGUAGE = "id";

export const SUPPORTED_LANGUAGES = ["id", "en"];

const ROUTE_PAGE_MAP = [
  { match: () => true, page: "app" },
];

export function resolveLocalePage(pathname = "/") {
  const matched = ROUTE_PAGE_MAP.find((route) => route.match(pathname));
  return matched?.page || "app";
}
