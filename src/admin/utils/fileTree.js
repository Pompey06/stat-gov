export const splitPathSegments = (path) =>
  String(path || "")
    .split(/[/\\]/)
    .map((part) => part.trim())
    .filter(Boolean);

const LOCALE_TREE_PREFIX = /^рус$/i;

export const getTreePathSegments = (path, pathKey = "path_ru") => {
  const parts = splitPathSegments(path);

  if (pathKey === "path_ru" && parts.length > 0 && LOCALE_TREE_PREFIX.test(parts[0])) {
    return parts.slice(1);
  }

  return parts;
};

const createNode = (name, fullPath) => ({
  name,
  fullPath,
  children: new Map(),
  file: null,
});

export const buildFileTree = (files, pathKey = "path_ru") => {
  const root = createNode("", "");
  const orphans = [];

  for (const file of files) {
    const parts = getTreePathSegments(file[pathKey] || file.storage_key, pathKey);

    if (!parts.length) {
      orphans.push(file);
      continue;
    }

    let node = root;
    let pathSoFar = "";

    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;

      if (!node.children.has(part)) {
        node.children.set(part, createNode(part, pathSoFar));
      }

      node = node.children.get(part);

      if (index === parts.length - 1) {
        node.file = file;
      }
    }
  }

  return {
    roots: sortTreeNodes(root.children),
    orphans,
  };
};

const sortTreeNodes = (childrenMap) =>
  [...childrenMap.values()]
    .sort((left, right) =>
      left.name.localeCompare(right.name, "ru", { sensitivity: "base" }),
    )
    .map((node) => ({
      ...node,
      children: sortTreeNodes(node.children),
    }));

export const collectAncestorPaths = (path, pathKey = "path_ru") => {
  const parts = getTreePathSegments(path, pathKey);
  const paths = [];
  let pathSoFar = "";

  for (let index = 0; index < parts.length - 1; index += 1) {
    pathSoFar = pathSoFar ? `${pathSoFar}/${parts[index]}` : parts[index];
    paths.push(pathSoFar);
  }

  return paths;
};

export const replacePathLastSegment = (path, newSegment) => {
  const parts = splitPathSegments(path);
  const trimmed = String(newSegment || "").trim();

  if (!parts.length) return trimmed;
  parts[parts.length - 1] = trimmed;
  return parts.join("/");
};

export const collectAllFolderPaths = (nodes) => {
  const paths = new Set();

  const walk = (nodeList) => {
    for (const node of nodeList) {
      if (node.children.length > 0) {
        paths.add(node.fullPath);
        walk(node.children);
      }
    }
  };

  walk(nodes);
  return paths;
};

export const collectExpandPathsForFiles = (files, pathKey = "path_ru") => {
  const expanded = new Set();

  for (const file of files) {
    for (const path of collectAncestorPaths(file[pathKey], pathKey)) {
      expanded.add(path);
    }
  }

  return expanded;
};
