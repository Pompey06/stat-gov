import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import { useApi } from "../Context/Context";
import adminI18n from "../../i18n";
import "./FileManager.css";

const CONTENT = {
  ru: {
    pageTitle: "Обновление файлов",
    pageSubtitle:
      "Управление прикрепляемыми файлами: доступ к webui, синхронизация и обновление карточек справочников, классификаторов и НПА.",
    refresh: "Обновить данные",
    sync: "Запустить синхронизацию",
    loading: "Загрузка данных...",
    partialError:
      "Часть данных не загрузилась. Доступные блоки показаны ниже.",
    totalFiles: "Всего файлов",
    deletedFiles: "Удаленные записи",
    linkedFiles: "Связей с индексом",
    lastParsed: "Последняя обработка",
    webuiTitle: "Файловый WebUI",
    webuiSubtitle:
      "Используйте этот блок для входа в webui, замены файлов и последующего запуска синхронизации.",
    webuiPath: "Ссылка",
    webuiLogin: "Логин",
    webuiPassword: "Пароль",
    openWebui: "Открыть WebUI",
    show: "Показать",
    hide: "Скрыть",
    syncTitle: "Синхронизация",
    syncSubtitle:
      "Ручной запуск и контроль статуса обновления прикрепляемых файлов.",
    syncStatus: "Статус",
    syncStatusEmpty: "Статус пока не вернул подробностей.",
    refreshStatus: "Проверить статус",
    catalogTitle: "Каталог файлов",
    catalogSubtitle:
      "По каждому файлу можно обновить keyword и локализованные пути, а также скачать текущую версию.",
    searchPlaceholder: "Поиск по keyword, storage key или пути",
    noFiles: "Файлы не найдены.",
    keyword: "Keyword",
    pathRu: "Путь RU",
    pathKz: "Путь KZ",
    storageKey: "Storage key",
    parsedAt: "Обработан",
    etag: "ETag",
    linkedIds: "Linked IDs",
    fileId: "ID файла",
    deleted: "Удален",
    active: "Активен",
    notSpecified: "Не указано",
    save: "Сохранить",
    downloadRu: "Скачать RU",
    downloadKz: "Скачать KZ",
    saveSuccess: "Изменения по файлу сохранены.",
    saveError: "Не удалось сохранить изменения по файлу.",
    syncSuccess: "Синхронизация запущена.",
    syncError: "Не удалось запустить синхронизацию.",
    statusSuccess: "Статус синхронизации обновлен.",
    statusError: "Не удалось получить статус синхронизации.",
    loadSuccess: "Данные по файлам обновлены.",
    loadError: "Не удалось загрузить данные по файлам.",
    invalidId: "У записи нет корректного ID для обновления.",
    downloadError: "Не удалось скачать файл.",
    pathMissing: "Путь к файлу не указан.",
  },
  kz: {
    pageTitle: "Файлдарды жаңарту",
    pageSubtitle:
      "Тіркелетін файлдарды басқару: webui қолжетімділігі, синхрондау және анықтамалықтар, классификаторлар мен НҚА файл карточкаларын жаңарту.",
    refresh: "Деректерді жаңарту",
    sync: "Синхрондауды іске қосу",
    loading: "Деректер жүктелуде...",
    partialError: "Деректердің бір бөлігі жүктелмеді. Қол жетімді блоктар төменде көрсетілді.",
    totalFiles: "Файлдар саны",
    deletedFiles: "Жойылған жазбалар",
    linkedFiles: "Индекспен байланыстар",
    lastParsed: "Соңғы өңдеу",
    webuiTitle: "Файлдық WebUI",
    webuiSubtitle:
      "Осы блок арқылы webui-ге кіріп, файлдарды ауыстырып, кейін синхрондауды іске қоса аласыз.",
    webuiPath: "Сілтеме",
    webuiLogin: "Логин",
    webuiPassword: "Құпиясөз",
    openWebui: "WebUI ашу",
    show: "Көрсету",
    hide: "Жасыру",
    syncTitle: "Синхрондау",
    syncSubtitle:
      "Тіркелетін файлдарды жаңартуды қолмен іске қосу және статусын бақылау.",
    syncStatus: "Статус",
    syncStatusEmpty: "Статус әлі толық мәлімет қайтармады.",
    refreshStatus: "Статусты тексеру",
    catalogTitle: "Файлдар тізімі",
    catalogSubtitle:
      "Әр файл бойынша keyword пен локализацияланған жолдарды жаңартуға және ағымдағы нұсқаны жүктеуге болады.",
    searchPlaceholder: "Keyword, storage key немесе жол бойынша іздеу",
    noFiles: "Файлдар табылмады.",
    keyword: "Keyword",
    pathRu: "RU жолы",
    pathKz: "KZ жолы",
    storageKey: "Storage key",
    parsedAt: "Өңделген уақыты",
    etag: "ETag",
    linkedIds: "Linked IDs",
    fileId: "Файл ID",
    deleted: "Жойылған",
    active: "Белсенді",
    notSpecified: "Көрсетілмеген",
    save: "Сақтау",
    downloadRu: "RU жүктеу",
    downloadKz: "KZ жүктеу",
    saveSuccess: "Файл бойынша өзгерістер сақталды.",
    saveError: "Файл бойынша өзгерістерді сақтау мүмкін болмады.",
    syncSuccess: "Синхрондау іске қосылды.",
    syncError: "Синхрондауды іске қосу мүмкін болмады.",
    statusSuccess: "Синхрондау статусы жаңартылды.",
    statusError: "Синхрондау статусын алу мүмкін болмады.",
    loadSuccess: "Файл деректері жаңартылды.",
    loadError: "Файл деректерін жүктеу мүмкін болмады.",
    invalidId: "Жазбада жаңарту үшін дұрыс ID жоқ.",
    downloadError: "Файлды жүктеу мүмкін болмады.",
    pathMissing: "Файл жолы көрсетілмеген.",
  },
};

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
  const [files, setFiles] = useState([]);
  const [originalFiles, setOriginalFiles] = useState({});
  const [webui, setWebui] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [downloadingPath, setDownloadingPath] = useState("");
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const text = i18n.language === "kz" ? CONTENT.kz : CONTENT.ru;

  const authHeaders = useMemo(() => {
    const encoded = btoa(`${credentials.login}:${credentials.password}`);
    return {
      Authorization: `Basic ${encoded}`,
    };
  }, [credentials.login, credentials.password]);

  const formatTimestamp = (value) => {
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
  };

  const updateStatus = (type, message) => {
    setStatus({ type, message });
  };

  const syncStatusPreview = useMemo(() => {
    if (!syncStatus || typeof syncStatus !== "object") return "";
    const keys = Object.keys(syncStatus);
    if (!keys.length) return text.syncStatusEmpty;
    return JSON.stringify(syncStatus, null, 2);
  }, [syncStatus, text.syncStatusEmpty]);

  const summary = useMemo(() => {
    const totalLinked = files.reduce(
      (acc, item) => acc + (item.linked_ids?.length || 0),
      0,
    );
    const deletedCount = files.filter((item) => item.deleted).length;
    const lastParsed = files
      .map((item) => item.parsed_at)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      totalFiles: files.length,
      deletedCount,
      totalLinked,
      lastParsed,
    };
  }, [files]);

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
        ...(item.linked_ids || []),
      ]
        .join(" ")
        .toLocaleLowerCase();

      return haystack.includes(query);
    });
  }, [files, searchTerm]);

  const isFileChanged = (item) => {
    const source = originalFiles[item.id];
    if (!source) return false;

    return (
      source.keyword !== item.keyword ||
      source.path_ru !== item.path_ru ||
      source.path_kz !== item.path_kz
    );
  };

  const loadData = async ({ silent = false, showSuccess = false } = {}) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [webuiResponse, filesResponse, syncResponse] = await Promise.allSettled([
        api.get("/files/webui", { headers: authHeaders }),
        api.get("/files/", { headers: authHeaders }),
        api.get("/files/sync/status", { headers: authHeaders }),
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

      if (hasError) {
        updateStatus("error", text.partialError);
      } else if (showSuccess) {
        updateStatus("success", text.loadSuccess);
      }
    } catch (error) {
      console.error("Failed to load file manager data:", error);
      updateStatus("error", text.loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFieldChange = (fileId, field, value) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === fileId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleSave = async (item) => {
    if (!item.id || item.id === "None") {
      updateStatus("error", text.invalidId);
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

      setFiles((prev) =>
        prev.map((file) => (file.id === item.id ? updatedFile : file)),
      );
      setOriginalFiles((prev) => ({
        ...prev,
        [updatedFile.id]: {
          keyword: updatedFile.keyword,
          path_ru: updatedFile.path_ru,
          path_kz: updatedFile.path_kz,
        },
      }));
      updateStatus("success", text.saveSuccess);
    } catch (error) {
      console.error("Failed to save file metadata:", error);
      updateStatus("error", text.saveError);
    } finally {
      setSavingId("");
    }
  };

  const handleDownload = async (path) => {
    if (!path) {
      updateStatus("error", text.pathMissing);
      return;
    }

    setDownloadingPath(path);

    try {
      const response = await api.get(`/files/${encodeURIComponent(path)}`, {
        headers: authHeaders,
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileNameFromPath(path);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
      updateStatus("error", text.downloadError);
    } finally {
      setDownloadingPath("");
    }
  };

  const handleSync = async () => {
    setSyncing(true);

    try {
      await api.post("/files/sync", {}, { headers: authHeaders });
      updateStatus("success", text.syncSuccess);
      await loadData({ silent: true });
    } catch (error) {
      console.error("Failed to start sync:", error);
      updateStatus("error", text.syncError);
    } finally {
      setSyncing(false);
    }
  };

  const handleRefreshStatus = async () => {
    setStatusLoading(true);

    try {
      const response = await api.get("/files/sync/status", {
        headers: authHeaders,
      });
      setSyncStatus(response.data || {});
      updateStatus("success", text.statusSuccess);
    } catch (error) {
      console.error("Failed to load sync status:", error);
      updateStatus("error", text.statusError);
    } finally {
      setStatusLoading(false);
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
        <div className="file-manager__loader">{text.loading}</div>
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
            className="file-manager__button file-manager__button_secondary"
            onClick={() => loadData({ silent: true, showSuccess: true })}
            disabled={refreshing}
          >
            {refreshing ? <span className="loader loader_inline" /> : text.refresh}
          </Button>
          <Button
            type="button"
            className="file-manager__button"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? <span className="loader loader_inline" /> : text.sync}
          </Button>
        </div>
      </div>

      {status && (
        <div className={`file-manager__status file-manager__status_${status.type}`}>
          {status.message}
        </div>
      )}

      <section className="file-manager__summary-grid">
        <article className="file-manager__summary-card">
          <span>{text.totalFiles}</span>
          <strong>{summary.totalFiles}</strong>
        </article>
        <article className="file-manager__summary-card">
          <span>{text.deletedFiles}</span>
          <strong>{summary.deletedCount}</strong>
        </article>
        <article className="file-manager__summary-card">
          <span>{text.linkedFiles}</span>
          <strong>{summary.totalLinked}</strong>
        </article>
        <article className="file-manager__summary-card">
          <span>{text.lastParsed}</span>
          <strong>{formatTimestamp(summary.lastParsed)}</strong>
        </article>
      </section>

      <div className="file-manager__grid">
        <section className="file-manager__panel">
          <div className="file-manager__panel-header">
            <div>
              <h3>{text.webuiTitle}</h3>
              <p>{text.webuiSubtitle}</p>
            </div>
            <Button
              type="button"
              className="file-manager__button"
              onClick={handleOpenWebui}
              disabled={!webui?.path}
            >
              {text.openWebui}
            </Button>
          </div>

          <div className="file-manager__credential-grid">
            <div className="file-manager__credential-card">
              <span>{text.webuiPath}</span>
              <strong>{webui?.path || text.notSpecified}</strong>
            </div>
            <div className="file-manager__credential-card">
              <span>{text.webuiLogin}</span>
              <strong>{webui?.login || text.notSpecified}</strong>
            </div>
            <div className="file-manager__credential-card">
              <div className="file-manager__credential-row">
                <span>{text.webuiPassword}</span>
                <button
                  type="button"
                  className="file-manager__toggle-secret"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? text.hide : text.show}
                </button>
              </div>
              <strong>
                {showPassword
                  ? webui?.password || text.notSpecified
                  : webui?.password
                    ? "••••••••"
                    : text.notSpecified}
              </strong>
            </div>
          </div>
        </section>

        <section className="file-manager__panel">
          <div className="file-manager__panel-header">
            <div>
              <h3>{text.syncTitle}</h3>
              <p>{text.syncSubtitle}</p>
            </div>
            <Button
              type="button"
              className="file-manager__button file-manager__button_secondary"
              onClick={handleRefreshStatus}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <span className="loader loader_inline" />
              ) : (
                text.refreshStatus
              )}
            </Button>
          </div>

          <div className="file-manager__status-box">
            <span className="file-manager__status-label">{text.syncStatus}</span>
            <pre className="file-manager__status-preview">{syncStatusPreview}</pre>
          </div>
        </section>
      </div>

      <section className="file-manager__panel file-manager__panel_full">
        <div className="file-manager__panel-header">
          <div>
            <h3>{text.catalogTitle}</h3>
            <p>{text.catalogSubtitle}</p>
          </div>
        </div>

        <div className="file-manager__search">
          <input
            type="text"
            className="file-manager__input"
            placeholder={text.searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="file-manager__list">
          {filteredFiles.length ? (
            filteredFiles.map((item) => (
              <article className="file-manager__file-card" key={item.id || item.storage_key}>
                <div className="file-manager__file-header">
                  <div>
                    <h4>{item.keyword || text.notSpecified}</h4>
                    <p>{item.storage_key || text.notSpecified}</p>
                  </div>
                  <span
                    className={`file-manager__badge ${
                      item.deleted ? "file-manager__badge_deleted" : ""
                    }`}
                  >
                    {item.deleted ? text.deleted : text.active}
                  </span>
                </div>

                <div className="file-manager__fields">
                  <label className="file-manager__field">
                    <span>{text.keyword}</span>
                    <input
                      type="text"
                      className="file-manager__input"
                      value={item.keyword}
                      onChange={(event) =>
                        handleFieldChange(item.id, "keyword", event.target.value)
                      }
                    />
                  </label>
                  <label className="file-manager__field">
                    <span>{text.pathRu}</span>
                    <input
                      type="text"
                      className="file-manager__input"
                      value={item.path_ru}
                      onChange={(event) =>
                        handleFieldChange(item.id, "path_ru", event.target.value)
                      }
                    />
                  </label>
                  <label className="file-manager__field">
                    <span>{text.pathKz}</span>
                    <input
                      type="text"
                      className="file-manager__input"
                      value={item.path_kz}
                      onChange={(event) =>
                        handleFieldChange(item.id, "path_kz", event.target.value)
                      }
                    />
                  </label>
                </div>

                <div className="file-manager__meta-grid">
                  <div className="file-manager__meta-item">
                    <span>{text.fileId}</span>
                    <strong>{item.id || text.notSpecified}</strong>
                  </div>
                  <div className="file-manager__meta-item">
                    <span>{text.etag}</span>
                    <strong>{item.etag || text.notSpecified}</strong>
                  </div>
                  <div className="file-manager__meta-item">
                    <span>{text.parsedAt}</span>
                    <strong>{formatTimestamp(item.parsed_at)}</strong>
                  </div>
                  <div className="file-manager__meta-item">
                    <span>{text.linkedIds}</span>
                    <strong>
                      {item.linked_ids?.length
                        ? item.linked_ids.join(", ")
                        : text.notSpecified}
                    </strong>
                  </div>
                </div>

                <div className="file-manager__file-actions">
                  <Button
                    type="button"
                    className="file-manager__button"
                    onClick={() => handleSave(item)}
                    disabled={savingId === item.id || !isFileChanged(item)}
                  >
                    {savingId === item.id ? (
                      <span className="loader loader_inline" />
                    ) : (
                      text.save
                    )}
                  </Button>
                  <Button
                    type="button"
                    className="file-manager__button file-manager__button_secondary"
                    onClick={() => handleDownload(item.path_ru)}
                    disabled={!item.path_ru || downloadingPath === item.path_ru}
                  >
                    {downloadingPath === item.path_ru ? (
                      <span className="loader loader_inline" />
                    ) : (
                      text.downloadRu
                    )}
                  </Button>
                  <Button
                    type="button"
                    className="file-manager__button file-manager__button_secondary"
                    onClick={() => handleDownload(item.path_kz)}
                    disabled={!item.path_kz || downloadingPath === item.path_kz}
                  >
                    {downloadingPath === item.path_kz ? (
                      <span className="loader loader_inline" />
                    ) : (
                      text.downloadKz
                    )}
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="file-manager__empty">{text.noFiles}</div>
          )}
        </div>
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
