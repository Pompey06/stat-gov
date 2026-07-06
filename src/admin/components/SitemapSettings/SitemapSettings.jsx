import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import SitemapEditor from "./SitemapEditor";
import { useApi } from "../Context/Context";
import useAuthHeaders from "../../hooks/useAuthHeaders";
import adminI18n from "../../i18n";
import "./SitemapSettings.css";

const LOCALES = ["ru", "kz"];

const TEXT = {
  ru: {
    pageTitle: "Карта сайта",
    pageSubtitle:
      "Markdown-структура stat.gov.kz — бот подставляет её в системный промпт, чтобы знать разделы сайта.",
    save: "Сохранить",
    saving: "Сохранение...",
    reload: "Обновить с сервера",
    loading: "Загрузка...",
    importTitle: "Импорт",
    fromUrl: "По URL страницы",
    fromHtml: "Из HTML-файла",
    urlPlaceholder: "https://stat.gov.kz/...",
    chooseFile: "Выбрать файл",
    noFile: "Файл не выбран",
    generate: "Подставить в редактор",
    generating: "Импорт...",
    successSaved: "Карта сайта сохранена.",
    successImported: "Текст подставлен в редактор.",
    loadError: "Не удалось загрузить карту сайта.",
    saveError: "Не удалось сохранить.",
    importError: "Не удалось импортировать.",
    unsavedChanges: "Есть несохранённые изменения.",
    ru: "Русский",
    kz: "Қазақша",
  },
  kz: {
    pageTitle: "Сайт картасы",
    pageSubtitle:
      "stat.gov.kz markdown құрылымы — бот сайт бөлімдерін білу үшін оны жүйелік промптке қосады.",
    save: "Сақтау",
    saving: "Сақталуда...",
    reload: "Серверден жаңарту",
    loading: "Жүктелуде...",
    importTitle: "Импорт",
    fromUrl: "Бет URL-і бойынша",
    fromHtml: "HTML-файлдан",
    urlPlaceholder: "https://stat.gov.kz/...",
    chooseFile: "Файл таңдау",
    noFile: "Файл таңдалмады",
    generate: "Редакторға қою",
    generating: "Импорт...",
    successSaved: "Сайт картасы сақталды.",
    successImported: "Мәтін редакторға қойылды.",
    loadError: "Сайт картасын жүктеу мүмкін болмады.",
    saveError: "Сақтау мүмкін болмады.",
    importError: "Импорттау мүмкін болмады.",
    unsavedChanges: "Сақталмаған өзгерістер бар.",
    ru: "Орысша",
    kz: "Қазақша",
  },
};

const normalizeSitemap = (sitemap = {}) => ({
  ru: sitemap.ru ?? "",
  kz: sitemap.kz ?? "",
});

const SitemapSettings = ({ credentials }) => {
  const { i18n } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();
  const authHeaders = useAuthHeaders(credentials);
  const langKey = i18n.language === "kz" ? "kz" : "ru";
  const text = TEXT[langKey];
  const htmlInputRef = useRef(null);
  const categoriesRef = useRef([]);
  const savedSitemapRef = useRef(normalizeSitemap());

  const [sitemap, setSitemap] = useState(() => normalizeSitemap());
  const [activeLocale, setActiveLocale] = useState("ru");
  const [urlToParse, setUrlToParse] = useState("");
  const [htmlFile, setHtmlFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);

  const isDirty =
    sitemap.ru !== savedSitemapRef.current.ru ||
    sitemap.kz !== savedSitemapRef.current.kz;

  const updateLocale = useCallback((locale, value) => {
    setSitemap((previous) => ({
      ...previous,
      [locale]: value,
    }));
  }, []);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.get("/settings/app-config", {
        headers: authHeaders,
      });
      const nextSitemap = normalizeSitemap(response.data?.sitemap);
      categoriesRef.current = Array.isArray(response.data?.categories)
        ? response.data.categories
        : [];
      savedSitemapRef.current = nextSitemap;
      setSitemap(nextSitemap);
    } catch (error) {
      console.error("Failed to load sitemap config:", error);
      setStatus({ type: "error", message: text.loadError });
    } finally {
      setIsLoading(false);
    }
  }, [api, authHeaders, text.loadError]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.put(
        "/settings/app-config",
        {
          categories: categoriesRef.current,
          sitemap,
        },
        {
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
        },
      );
      const nextSitemap = normalizeSitemap(response.data?.sitemap);
      categoriesRef.current = Array.isArray(response.data?.categories)
        ? response.data.categories
        : categoriesRef.current;
      savedSitemapRef.current = nextSitemap;
      setSitemap(nextSitemap);
      setStatus({ type: "success", message: text.successSaved });
    } catch (error) {
      console.error("Failed to save sitemap config:", error);
      setStatus({ type: "error", message: text.saveError });
    } finally {
      setIsSaving(false);
    }
  };

  const applyImportedMarkdown = (markdown) => {
    updateLocale(activeLocale, markdown ?? "");
    setStatus({ type: "success", message: text.successImported });
  };

  const handleGenerateFromUrl = async () => {
    if (!urlToParse.trim()) {
      return;
    }

    setIsGeneratingUrl(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post(
        "/settings/sitemap/from-url",
        {
          url: urlToParse.trim(),
          locale: activeLocale,
        },
        {
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
        },
      );
      applyImportedMarkdown(response.data.markdown);
    } catch (error) {
      console.error("Failed to generate sitemap from url:", error);
      setStatus({ type: "error", message: text.importError });
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleGenerateFromHtml = async () => {
    if (!htmlFile) {
      return;
    }

    setIsGeneratingHtml(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData();
    formData.append("file", htmlFile);

    try {
      const response = await api.post("/settings/sitemap/from-html", formData, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
        params: {
          locale: activeLocale,
        },
      });
      applyImportedMarkdown(response.data.markdown);
    } catch (error) {
      console.error("Failed to generate sitemap from html:", error);
      setStatus({ type: "error", message: text.importError });
    } finally {
      setIsGeneratingHtml(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sitemap-settings">
        <div className="sitemap-settings-loader">{text.loading}</div>
      </div>
    );
  }

  return (
    <div className="sitemap-settings">
      <div className="sitemap-settings__header">
        <div>
          <h2 className="sitemap-settings__title">{text.pageTitle}</h2>
          <p className="sitemap-settings__subtitle">{text.pageSubtitle}</p>
        </div>
        <div className="sitemap-settings__actions">
          <Button
            type="button"
            className="sitemap-settings__action"
            onClick={loadConfig}
          >
            {text.reload}
          </Button>
          <Button
            type="button"
            className="sitemap-settings__action sitemap-settings__action_primary"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? text.saving : text.save}
          </Button>
        </div>
      </div>

      {status.message && (
        <div
          className={`sitemap-settings__status sitemap-settings__status_${status.type}`}
        >
          {status.message}
        </div>
      )}

      {isDirty && !status.message && (
        <div className="sitemap-settings__status sitemap-settings__status_info">
          {text.unsavedChanges}
        </div>
      )}

      <section className="sitemap-settings__panel sitemap-settings__editor-panel">
        <div className="sitemap-settings__tabs">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              className={`sitemap-settings__tab${
                activeLocale === locale ? " sitemap-settings__tab_active" : ""
              }`}
              onClick={() => setActiveLocale(locale)}
            >
              {text[locale]}
            </button>
          ))}
        </div>
        <SitemapEditor
          value={sitemap[activeLocale]}
          onChange={(value) => updateLocale(activeLocale, value)}
        />
      </section>

      <section className="sitemap-settings__panel sitemap-settings__import">
        <h3 className="sitemap-settings__section-title">{text.importTitle}</h3>
        <div className="sitemap-settings__import-row">
          <span className="sitemap-settings__import-label">{text.fromUrl}</span>
          <input
            type="text"
            className="sitemap-settings__input"
            value={urlToParse}
            placeholder={text.urlPlaceholder}
            onChange={(event) => setUrlToParse(event.target.value)}
          />
          <Button
            type="button"
            className="sitemap-settings__import-button"
            onClick={handleGenerateFromUrl}
            disabled={isGeneratingUrl || !urlToParse.trim()}
          >
            {isGeneratingUrl ? text.generating : text.generate}
          </Button>
        </div>
        <div className="sitemap-settings__import-row">
          <span className="sitemap-settings__import-label">{text.fromHtml}</span>
          <input
            ref={htmlInputRef}
            type="file"
            accept=".html,.htm,text/html"
            className="sitemap-settings__hidden-file"
            onChange={(event) => setHtmlFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className="sitemap-settings__file-button"
            onClick={() => htmlInputRef.current?.click()}
          >
            {text.chooseFile}
          </button>
          <span className="sitemap-settings__file-name">
            {htmlFile ? htmlFile.name : text.noFile}
          </span>
          <Button
            type="button"
            className="sitemap-settings__import-button"
            onClick={handleGenerateFromHtml}
            disabled={isGeneratingHtml || !htmlFile}
          >
            {isGeneratingHtml ? text.generating : text.generate}
          </Button>
        </div>
      </section>
    </div>
  );
};

SitemapSettings.propTypes = {
  credentials: PropTypes.shape({
    login: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
};

export default SitemapSettings;
