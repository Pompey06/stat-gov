import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import { useApi } from "../Context/Context";
import useAuthHeaders from "../../hooks/useAuthHeaders";
import {
  buildFileTree,
  collectAllFolderPaths,
  collectExpandPathsForFiles,
  replacePathLastSegment,
} from "../../utils/fileTree";
import { normalizeStoragePaths, normalizePath } from "../../utils/storagePaths";
import FileTree from "./FileTree";
import FileDetails from "./FileDetails";
import adminI18n from "../../i18n";
import "./FileManager.css";

const CONTENT = {
  ru: {
    pageTitle: "Обновление файлов",
    pageSubtitle:
      "Справочники и документы, которые бот может приложить к ответу пользователю.",
    refresh: "Обновить",
    sync: "Синхронизировать",
    loading: "Загрузка...",
    partialError: "Часть данных не загрузилась.",
    searchPlaceholder: "Поиск по keyword или пути",
    noFiles: "Файлы не найдены.",
    keyword: "Ключевые слова",
    pathRu: "Путь RU",
    pathKz: "Путь KZ",
    deleted: "Удалён",
    active: "Активен",
    save: "Сохранить",
    downloadRu: "RU",
    downloadKz: "KZ",
    upload: "Загрузить",
    download: "Скачать",
    fileMissing: "Файл отсутствует в хранилище",
    uploadSuccess: "Файл загружен.",
    uploadError: "Не удалось загрузить файл.",
    saveSuccess: "Сохранено.",
    saveError: "Не удалось сохранить.",
    syncSuccess: "Синхронизация запущена.",
    syncError: "Не удалось запустить синхронизацию.",
    loadSuccess: "Данные обновлены.",
    loadError: "Не удалось загрузить данные.",
    invalidId: "Некорректный ID файла.",
    downloadError: "Не удалось скачать файл.",
    pathMissing: "Путь не указан.",
    uploadTitle: "Загрузка файлов",
    uploadHint: "Массовая замена файлов через WebUI.",
    openWebui: "Открыть WebUI",
    login: "Логин",
    password: "Пароль",
    show: "Показать",
    hide: "Скрыть",
    notSpecified: "—",
    syncRunning: "Синхронизация выполняется…",
    syncIdle: "Синхронизация не запущена",
    lastRun: "Последний запуск",
    filesCount: "файлов",
    noPath: "Без пути",
    selectFile: "Выберите файл",
    selectFileHint: "Кликните по файлу в дереве слева",
    fileDetails: "Свойства",
    renameHint: "Двойной клик по имени в дереве — быстрое переименование",
    newFile: "Новый файл",
    create: "Создать",
    cancel: "Отмена",
    createSuccess: "Файл создан.",
    createError: "Не удалось создать файл.",
    pathRuRequired: "Укажите путь RU.",
    delete: "Удалить",
    deleteConfirm: "Удалить запись и файлы из хранилища?",
    deleteSuccess: "Файл удалён.",
    deleteError: "Не удалось удалить файл.",
    createStepRuHint: "Шаг 1. Выберите русскоязычный файл для загрузки.",
    createStepKzHint: "Шаг 2. Загрузите казахскую версию или пропустите этот шаг.",
    createStepConfigureHint: "Шаг 3. При необходимости измените пути и ключевые слова.",
    selectRuFile: "Выбрать файл (RU)",
    selectKzFile: "Выбрать файл (KZ)",
    skipKz: "Пропустить",
    selectedFile: "Выбран",
  },
  kz: {
    pageTitle: "Файлдарды жаңарту",
    pageSubtitle:
      "Бот пайдаланушы жауабына қоса алатын анықтамалықтар мен құжаттар.",
    refresh: "Жаңарту",
    sync: "Синхрондау",
    loading: "Жүктелуде...",
    partialError: "Деректердің бір бөлігі жүктелмеді.",
    searchPlaceholder: "Keyword немесе жол бойынша іздеу",
    noFiles: "Файлдар табылмады.",
    keyword: "Keyword",
    pathRu: "RU жолы",
    pathKz: "KZ жолы",
    deleted: "Жойылған",
    active: "Белсенді",
    save: "Сақтау",
    downloadRu: "RU",
    downloadKz: "KZ",
    upload: "Жүктеу",
    download: "Жүктеп алу",
    fileMissing: "Файл сақтауда жоқ",
    uploadSuccess: "Файл жүктелді.",
    uploadError: "Файлды жүктеу мүмкін болмады.",
    saveSuccess: "Сақталды.",
    saveError: "Сақтау мүмкін болмады.",
    syncSuccess: "Синхрондау іске қосылды.",
    syncError: "Синхрондауды іске қосу мүмкін болмады.",
    loadSuccess: "Деректер жаңартылды.",
    loadError: "Деректерді жүктеу мүмкін болмады.",
    invalidId: "Файл ID дұрыс емес.",
    downloadError: "Файлды жүктеу мүмкін болмады.",
    pathMissing: "Жол көрсетілмеген.",
    uploadTitle: "Файлдарды жүктеу",
    uploadHint: "WebUI арқылы файлдарды жаппай ауыстыру.",
    openWebui: "WebUI ашу",
    login: "Логин",
    password: "Құпиясөз",
    show: "Көрсету",
    hide: "Жасыру",
    notSpecified: "—",
    syncRunning: "Синхрондау орындалуда…",
    syncIdle: "Синхрондау іске қосылмаған",
    lastRun: "Соңғы іске қосу",
    filesCount: "файл",
    noPath: "Жолы жоқ",
    selectFile: "Файлды таңдаңыз",
    selectFileHint: "Сол жақтағы ағаштан файлды басыңыз",
    fileDetails: "Қасиеттер",
    renameHint: "Ағаштағы атауға екі рет басу — жылдам атауды өзгерту",
    newFile: "Жаңа файл",
    create: "Қосу",
    cancel: "Болдырмау",
    createSuccess: "Файл қосылды.",
    createError: "Файлды қосу мүмкін болмады.",
    pathRuRequired: "RU жолын көрсетіңіз.",
    delete: "Жою",
    deleteConfirm: "Жазба мен файлдарды сақтаудан жою керек пе?",
    deleteSuccess: "Файл жойылды.",
    deleteError: "Файлды жою мүмкін болмады.",
    createStepRuHint: "1-қадам. Орыс тіліндегі файлды таңдап жүктеңіз.",
    createStepKzHint: "2-қадам. Қазақ тіліндегі нұсқасын жүктеңіз немесе өткізіп жіберіңіз.",
    createStepConfigureHint: "3-қадам. Қажет болса, жолдар мен keyword-ті өзгертіңіз.",
    selectRuFile: "Файл таңдау (RU)",
    selectKzFile: "Файл таңдау (KZ)",
    skipKz: "Өткізу",
    selectedFile: "Таңдалды",
  },
};

const NEW_FILE_ID = "__new__";

const CREATE_STEP = {
  UPLOAD_RU: "upload_ru",
  UPLOAD_KZ: "upload_kz",
  CONFIGURE: "configure",
};

const RU_PREFIX = "Рус/";
const KZ_PREFIX = "Каз/";

const deriveRuPath = (fileName) => `${RU_PREFIX}${fileName}`;

const deriveKzPathFromRu = (pathRu) => {
  const normalized = normalizePath(pathRu);
  if (normalized.startsWith(RU_PREFIX)) {
    return `${KZ_PREFIX}${normalized.slice(RU_PREFIX.length)}`;
  }
  return `${KZ_PREFIX}${getFileNameFromPath(normalized)}`;
};

const createEmptyDraft = () => ({
  id: NEW_FILE_ID,
  createStep: CREATE_STEP.UPLOAD_RU,
  storage_key: "",
  path_ru: "",
  path_kz: "",
  keyword: "",
  etag: "",
  parsed_at: "",
  linked_ids: [],
  deleted: false,
  pendingRuFile: null,
  pendingKzFile: null,
});

const mapFileRecord = (item) => ({
  id: typeof item?.id === "string" ? item.id : "",
  storage_key: item?.storage_key || "",
  path_ru: item?.path_ru || "",
  path_kz: item?.path_kz || "",
  keyword: item?.keyword || "",
  etag: item?.etag || "",
  parsed_at: item?.parsed_at || "",
  linked_ids: Array.isArray(item?.linked_ids) ? item.linked_ids : [],
  deleted: Boolean(item?.deleted),
});

const normalizeExternalUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith(":")) {
    return `${window.location.protocol}//${window.location.hostname}${value}`;
  }
  if (value.startsWith("/")) {
    return `${window.location.origin}${value}`;
  }
  return value;
};

const getFileNameFromPath = (path) => {
  const normalized = String(path || "").split(/[\\/]/);
  return normalized[normalized.length - 1] || "file";
};

const FileManager = ({ credentials }) => {
  const { i18n } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();
  const authHeaders = useAuthHeaders(credentials);
  const text = i18n.language === "kz" ? CONTENT.kz : CONTENT.ru;

  const [files, setFiles] = useState([]);
  const [storagePaths, setStoragePaths] = useState(() => new Set());
  const [originalFiles, setOriginalFiles] = useState({});
  const [webui, setWebui] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [uploadingPath, setUploadingPath] = useState("");
  const [downloadingPath, setDownloadingPath] = useState("");
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(() => new Set());
  const [selectedFileId, setSelectedFileId] = useState("");
  const [editingFileId, setEditingFileId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [draftFile, setDraftFile] = useState(null);

  const formatTimestamp = useCallback(
    (value) => {
      if (!value) return text.notSpecified;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return new Intl.DateTimeFormat(i18n.language === "kz" ? "kk-KZ" : "ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    [i18n.language, text.notSpecified],
  );

  const syncStatusText = useMemo(() => {
    if (!syncStatus) return text.syncIdle;
    if (syncStatus.running) return text.syncRunning;

    const parts = [];
    if (syncStatus.last_run) {
      parts.push(`${text.lastRun}: ${formatTimestamp(syncStatus.last_run)}`);
    } else {
      parts.push(text.syncIdle);
    }
    if (syncStatus.created) parts.push(`+${syncStatus.created}`);
    if (syncStatus.updated) parts.push(`~${syncStatus.updated}`);
    if (syncStatus.deleted) parts.push(`−${syncStatus.deleted}`);

    return parts.join(" · ");
  }, [formatTimestamp, syncStatus, text.lastRun, text.syncIdle, text.syncRunning]);

  const filteredFiles = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    if (!query) return files;

    return files.filter((item) => {
      const haystack = [
        item.keyword,
        item.storage_key,
        item.path_ru,
        item.path_kz,
        item.id,
      ]
        .join(" ")
        .toLocaleLowerCase();

      return haystack.includes(query);
    });
  }, [files, searchTerm]);

  const { roots: treeRoots, orphans } = useMemo(
    () => buildFileTree(filteredFiles),
    [filteredFiles],
  );

  const effectiveExpanded = useMemo(() => {
    const query = searchTerm.trim();
    if (!query) return expandedNodes;

    const next = new Set(expandedNodes);
    for (const path of collectExpandPathsForFiles(filteredFiles)) {
      next.add(path);
    }
    return next;
  }, [expandedNodes, filteredFiles, searchTerm]);

  useEffect(() => {
    if (!treeRoots.length) return;

    setExpandedNodes((previous) => {
      if (previous.size) return previous;

      return collectAllFolderPaths(treeRoots);
    });
  }, [treeRoots]);

  const toggleNode = (fullPath) => {
    setExpandedNodes((previous) => {
      const next = new Set(previous);
      if (next.has(fullPath)) {
        next.delete(fullPath);
      } else {
        next.add(fullPath);
      }
      return next;
    });
  };

  const isCreating = draftFile !== null;

  const selectedFile = useMemo(() => {
    if (isCreating) return draftFile;
    return files.find((item) => item.id === selectedFileId) || null;
  }, [draftFile, files, isCreating, selectedFileId]);

  const handleSelectFile = (fileId) => {
    if (fileId === NEW_FILE_ID) return;
    setDraftFile(null);
    setSelectedFileId(fileId);
  };

  const handleStartCreate = () => {
    setDraftFile(createEmptyDraft());
    setSelectedFileId(NEW_FILE_ID);
    setEditingFileId("");
    setRenameValue("");
    setStatus(null);
  };

  const handleCancelCreate = () => {
    setDraftFile(null);
    setSelectedFileId("");
  };

  const handleRenameStart = (fileId, currentName) => {
    setEditingFileId(fileId);
    setRenameValue(currentName);
    setSelectedFileId(fileId);
  };

  const handleRenameCancel = () => {
    setEditingFileId("");
    setRenameValue("");
  };

  const handleRenameCommit = (fileId) => {
    const trimmed = renameValue.trim();
    setEditingFileId("");
    setRenameValue("");

    if (!trimmed) return;

    setFiles((previous) =>
      previous.map((item) => {
        if (item.id !== fileId) return item;

        const nextPath = replacePathLastSegment(item.path_ru, trimmed);
        if (nextPath === item.path_ru) return item;

        return { ...item, path_ru: nextPath };
      }),
    );
  };

  const isFileChanged = (item) => {
    const source = originalFiles[item.id];
    if (!source) return false;

    return (
      source.keyword !== item.keyword ||
      source.path_ru !== item.path_ru ||
      source.path_kz !== item.path_kz
    );
  };

  const loadData = useCallback(
    async ({ silent = false, showSuccess = false } = {}) => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setStatus(null);

      try {
        const [webuiResponse, filesResponse, syncResponse, storageResponse] =
          await Promise.allSettled([
            api.get("/files/webui", { headers: authHeaders }),
            api.get("/files/", { headers: authHeaders }),
            api.get("/files/sync/status", { headers: authHeaders }),
            api.get("/files/storage", { headers: authHeaders }),
          ]);

        let hasError = false;

        if (webuiResponse.status === "fulfilled") {
          setWebui(webuiResponse.value.data || null);
        } else {
          hasError = true;
        }

        if (filesResponse.status === "fulfilled") {
          const mappedFiles = Array.isArray(filesResponse.value.data)
            ? filesResponse.value.data.map(mapFileRecord)
            : [];

          setFiles(mappedFiles);
          setOriginalFiles(
            mappedFiles.reduce((acc, item) => {
              acc[item.id] = {
                keyword: item.keyword,
                path_ru: item.path_ru,
                path_kz: item.path_kz,
              };
              return acc;
            }, {}),
          );
        } else {
          hasError = true;
        }

        if (syncResponse.status === "fulfilled") {
          setSyncStatus(syncResponse.value.data || {});
        } else {
          hasError = true;
        }

        if (storageResponse.status === "fulfilled") {
          setStoragePaths(normalizeStoragePaths(storageResponse.value.data));
        } else {
          hasError = true;
        }

        if (hasError) {
          setStatus({ type: "error", message: text.partialError });
        } else if (showSuccess) {
          setStatus({ type: "success", message: text.loadSuccess });
        }
      } catch (error) {
        console.error("Failed to load file manager data:", error);
        setStatus({ type: "error", message: text.loadError });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api, authHeaders, text.loadError, text.loadSuccess, text.partialError],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFieldChange = (fileId, field, value) => {
    if (fileId === NEW_FILE_ID) {
      setDraftFile((previous) =>
        previous
          ? {
              ...previous,
              [field]: value,
            }
          : previous,
      );
      return;
    }

    setFiles((previous) =>
      previous.map((item) =>
        item.id === fileId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const uploadFileToStorage = async (path, file) => {
    const normalizedPath = normalizePath(path);
    if (!normalizedPath || !file) {
      throw new Error("pathMissing");
    }

    const formData = new FormData();
    formData.append("path", normalizedPath);
    formData.append("file", file);

    await api.post("/files/upload", formData, { headers: authHeaders });
    setStoragePaths((previous) => new Set([...previous, normalizedPath]));
    return normalizedPath;
  };

  const handleCreate = async (item) => {
    const pathRu = normalizePath(item.path_ru);
    if (!pathRu) {
      setStatus({ type: "error", message: text.pathRuRequired });
      return;
    }

    if (!item.pendingRuFile) {
      setStatus({ type: "error", message: text.pathRuRequired });
      return;
    }

    const pathKz = normalizePath(item.path_kz) || null;

    setSavingId(NEW_FILE_ID);
    setStatus(null);

    try {
      await uploadFileToStorage(pathRu, item.pendingRuFile);

      if (item.pendingKzFile && pathKz) {
        await uploadFileToStorage(pathKz, item.pendingKzFile);
      }

      const response = await api.post(
        "/files/",
        {
          path_ru: pathRu,
          path_kz: pathKz,
          keyword: item.keyword || undefined,
        },
        { headers: authHeaders },
      );

      const createdFile = mapFileRecord(response.data || item);

      setFiles((previous) => [...previous, createdFile]);
      setOriginalFiles((previous) => ({
        ...previous,
        [createdFile.id]: {
          keyword: createdFile.keyword,
          path_ru: createdFile.path_ru,
          path_kz: createdFile.path_kz,
        },
      }));
      setDraftFile(null);
      setSelectedFileId(createdFile.id);
      setStatus({ type: "success", message: text.createSuccess });
    } catch (error) {
      console.error("Failed to create file:", error);
      const detail = error?.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((entry) => entry.msg).join(", ")
            : text.createError;
      setStatus({ type: "error", message });
    } finally {
      setSavingId("");
    }
  };

  const handleDraftRuSelect = (file) => {
    if (!file) return;

    const pathRu = deriveRuPath(file.name);
    const pathKz = deriveKzPathFromRu(pathRu);

    setDraftFile((previous) =>
      previous
        ? {
            ...previous,
            createStep: CREATE_STEP.UPLOAD_KZ,
            path_ru: pathRu,
            path_kz: pathKz,
            pendingRuFile: file,
          }
        : previous,
    );
    setStatus(null);
  };

  const handleDraftKzSelect = (file) => {
    if (!file || !draftFile) return;

    const pathKz =
      normalizePath(draftFile.path_kz) || deriveKzPathFromRu(draftFile.path_ru);

    setDraftFile((previous) =>
      previous
        ? {
            ...previous,
            createStep: CREATE_STEP.CONFIGURE,
            path_kz: pathKz,
            pendingKzFile: file,
          }
        : previous,
    );
    setStatus(null);
  };

  const handleSkipKzUpload = () => {
    setDraftFile((previous) =>
      previous
        ? {
            ...previous,
            createStep: CREATE_STEP.CONFIGURE,
          }
        : previous,
    );
  };

  const handleSave = async (item) => {
    if (!item.id || item.id === "None") {
      setStatus({ type: "error", message: text.invalidId });
      return;
    }

    setSavingId(item.id);

    try {
      const response = await api.put(
        `/files/${item.id}`,
        {
          keyword: item.keyword,
          path_ru: item.path_ru,
          path_kz: item.path_kz,
        },
        { headers: authHeaders },
      );

      const updatedFile = mapFileRecord(response.data || item);

      setFiles((previous) =>
        previous.map((file) => (file.id === item.id ? updatedFile : file)),
      );
      setOriginalFiles((previous) => ({
        ...previous,
        [updatedFile.id]: {
          keyword: updatedFile.keyword,
          path_ru: updatedFile.path_ru,
          path_kz: updatedFile.path_kz,
        },
      }));
      setStatus({ type: "success", message: text.saveSuccess });
    } catch (error) {
      console.error("Failed to save file metadata:", error);
      setStatus({ type: "error", message: text.saveError });
    } finally {
      setSavingId("");
    }
  };

  const handleDownload = async (path) => {
    const normalizedPath = String(path || "").trim();
    if (!normalizedPath) {
      setStatus({ type: "error", message: text.pathMissing });
      return;
    }

    setDownloadingPath(normalizedPath);

    try {
      const response = await api.get(
        `/files/${encodeURIComponent(normalizedPath)}`,
        {
          headers: authHeaders,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileNameFromPath(normalizedPath);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
      setStatus({ type: "error", message: text.downloadError });
    } finally {
      setDownloadingPath("");
    }
  };

  const handleUpload = async (path, file) => {
    const normalizedPath = String(path || "").trim();
    if (!normalizedPath || !file) {
      setStatus({ type: "error", message: text.pathMissing });
      return;
    }

    setUploadingPath(normalizedPath);
    setStatus(null);

    try {
      await uploadFileToStorage(normalizedPath, file);
      setStatus({ type: "success", message: text.uploadSuccess });
    } catch (error) {
      console.error("Failed to upload file:", error);
      setStatus({ type: "error", message: text.uploadError });
    } finally {
      setUploadingPath("");
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id || item.id === NEW_FILE_ID) return;
    if (!window.confirm(text.deleteConfirm)) return;

    setDeletingId(item.id);
    setStatus(null);

    const pathsToRemove = [item.path_ru, item.path_kz, item.storage_key]
      .filter(Boolean)
      .map(normalizePath);

    try {
      await api.delete(`/files/${item.id}`, { headers: authHeaders });

      setFiles((previous) => previous.filter((file) => file.id !== item.id));
      setOriginalFiles((previous) => {
        const next = { ...previous };
        delete next[item.id];
        return next;
      });
      setStoragePaths((previous) => {
        const next = new Set(previous);
        for (const path of pathsToRemove) {
          next.delete(path);
        }
        return next;
      });
      if (selectedFileId === item.id) {
        setSelectedFileId("");
      }
      setStatus({ type: "success", message: text.deleteSuccess });
    } catch (error) {
      console.error("Failed to delete file:", error);
      setStatus({ type: "error", message: text.deleteError });
    } finally {
      setDeletingId("");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setStatus(null);

    try {
      await api.post("/files/sync", {}, { headers: authHeaders });
      setStatus({ type: "success", message: text.syncSuccess });
      await loadData({ silent: true });
    } catch (error) {
      console.error("Failed to start sync:", error);
      setStatus({ type: "error", message: text.syncError });
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenWebui = () => {
    const target = normalizeExternalUrl(webui?.path);
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="file-manager">
        <div className="file-manager-loader">{text.loading}</div>
      </div>
    );
  }

  return (
    <div className="file-manager">
      <div className="file-manager__header">
        <div>
          <h2 className="file-manager__title">{text.pageTitle}</h2>
          <p className="file-manager__subtitle">{text.pageSubtitle}</p>
        </div>
        <div className="file-manager__actions">
          <Button
            type="button"
            className="file-manager__action"
            onClick={() => loadData({ silent: true, showSuccess: true })}
            disabled={refreshing}
          >
            {refreshing ? text.loading : text.refresh}
          </Button>
          <Button
            type="button"
            className="file-manager__action file-manager__action_primary"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? text.loading : text.sync}
          </Button>
        </div>
      </div>

      {status && (
        <div className={`file-manager__status file-manager__status_${status.type}`}>
          {status.message}
        </div>
      )}

      <section className="file-manager__panel file-manager__panel_workspace">
        <div className="file-manager__toolbar">
          <input
            type="text"
            className="file-manager__search"
            placeholder={text.searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div className="file-manager__toolbar-actions">
            <span className="file-manager__count">
              {filteredFiles.length} {text.filesCount}
            </span>
            <Button
              type="button"
              className="file-manager__action file-manager__action_compact"
              onClick={handleStartCreate}
              disabled={isCreating}
            >
              {text.newFile}
            </Button>
          </div>
        </div>

        <div className="file-manager__workspace">
          <div className="file-manager__explorer">
            {filteredFiles.length ? (
              <FileTree
                roots={treeRoots}
                orphans={orphans}
                expanded={effectiveExpanded}
                selectedFileId={isCreating ? "" : selectedFileId}
                editingFileId={editingFileId}
                renameValue={renameValue}
                text={text}
                onToggle={toggleNode}
                onSelect={handleSelectFile}
                onRenameStart={handleRenameStart}
                onRenameChange={setRenameValue}
                onRenameCommit={handleRenameCommit}
                onRenameCancel={handleRenameCancel}
              />
            ) : (
              <div className="file-manager__tree-empty">{text.noFiles}</div>
            )}
          </div>
          <FileDetails
            file={selectedFile}
            isNew={isCreating}
            storagePaths={storagePaths}
            text={text}
            savingId={savingId}
            deletingId={deletingId}
            uploadingPath={uploadingPath}
            downloadingPath={downloadingPath}
            isChanged={selectedFile && !isCreating ? isFileChanged(selectedFile) : false}
            onFieldChange={handleFieldChange}
            onSave={handleSave}
            onCreate={handleCreate}
            onCancelCreate={handleCancelCreate}
            onDraftRuSelect={handleDraftRuSelect}
            onDraftKzSelect={handleDraftKzSelect}
            onSkipKzUpload={handleSkipKzUpload}
            onDelete={handleDelete}
            onUpload={handleUpload}
            onDownload={handleDownload}
          />
        </div>
      </section>

      <section className="file-manager__panel file-manager__upload">
        <div className="file-manager__upload-header">
          <div>
            <h3 className="file-manager__section-title">{text.uploadTitle}</h3>
            <p className="file-manager__upload-hint">{text.uploadHint}</p>
          </div>
          <Button
            type="button"
            className="file-manager__action"
            onClick={handleOpenWebui}
            disabled={!webui?.path}
          >
            {text.openWebui}
          </Button>
        </div>
        <div className="file-manager__upload-meta">
          <span>
            {text.login}: <strong>{webui?.login || text.notSpecified}</strong>
          </span>
          <span>
            {text.password}:{" "}
            <strong>
              {showPassword
                ? webui?.password || text.notSpecified
                : webui?.password
                  ? "••••••••"
                  : text.notSpecified}
            </strong>
            {webui?.password && (
              <button
                type="button"
                className="file-manager__toggle-secret"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? text.hide : text.show}
              </button>
            )}
          </span>
        </div>
        <p className="file-manager__sync-line">{syncStatusText}</p>
      </section>
    </div>
  );
};

FileManager.propTypes = {
  credentials: PropTypes.shape({
    login: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
};

export default FileManager;
