const normalizePath = (value) => String(value || "").trim().normalize("NFC");

export const normalizeStoragePaths = (data) => {
  const paths = new Set();

  const append = (value) => {
    const normalized = normalizePath(value);
    if (normalized) paths.add(normalized);
  };

  if (Array.isArray(data)) {
    for (const item of data) {
      if (typeof item === "string") {
        append(item);
      } else if (item && typeof item === "object") {
        append(item.path ?? item.key ?? item.storage_key ?? item.name);
      }
    }
  } else if (data && typeof data === "object") {
    return normalizeStoragePaths(data.paths ?? data.files ?? data.items ?? []);
  }

  return paths;
};

export const isPathInStorage = (storagePaths, path) => {
  const normalized = normalizePath(path);
  if (!normalized) return false;
  return storagePaths.has(normalized);
};

export { normalizePath };
