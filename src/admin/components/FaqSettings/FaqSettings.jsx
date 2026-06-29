import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import { useApi } from "../Context/Context";
import adminI18n from "../../i18n";
import "./FaqSettings.css";

const LOCALE_KEYS = ["ru", "kz", "en"];
const SITEMAP_LOCALES = ["ru", "kz"];

const TEXT = {
  ru: {
    pageTitle: "Часто задаваемые вопросы и настройки разделов",
    pageSubtitle:
      "Редактирование категорий, подкатегорий, отчетов, FAQ и sitemap по тем возможностям, которые поддерживает бэкенд.",
    save: "Сохранить настройки",
    saving: "Сохранение...",
    reload: "Обновить с сервера",
    export: "Выгрузить JSON",
    yamlSave: "Сохранить YAML",
    yamlSaving: "Отправка YAML...",
    addCategory: "Добавить направление",
    addSubcategory: "Добавить подкатегорию",
    addReport: "Добавить отчет",
    addFaq: "Добавить FAQ",
    delete: "Удалить",
    category: "Направление",
    subcategory: "Подкатегория",
    reports: "Отчеты",
    faq: "Частые вопросы",
    sitemap: "Sitemap",
    sitemapSubtitle:
      "Можно редактировать вручную или сгенерировать markdown из URL/HTML через backend endpoints.",
    sitemapRu: "Sitemap RU",
    sitemapKz: "Sitemap KZ",
    fromUrl: "Сгенерировать sitemap по URL",
    fromHtml: "Сгенерировать sitemap из HTML",
    locale: "Локаль",
    urlPlaceholder: "https://example.com/page",
    chooseFile: "Выбрать HTML-файл",
    noFile: "Файл не выбран",
    generate: "Сгенерировать",
    generating: "Генерация...",
    yamlTitle: "Импорт через YAML",
    yamlSubtitle:
      "Если у команды уже есть готовый YAML-файл конфигурации, его можно вставить сюда и сохранить целиком.",
    yamlPlaceholder: "Вставьте YAML конфигурации сюда",
    metaTitle: "Состояние конфигурации",
    lastUpdated: "Последнее обновление",
    categoriesCount: "Направлений",
    faqCount: "FAQ всего",
    reportsCount: "Отчетов всего",
    schemaNote:
      "Источник данных: /settings/app-config, сохранение: /settings/app-config и /settings/app-config/yaml.",
    successSaved: "Настройки успешно сохранены.",
    successYamlSaved: "YAML успешно применен.",
    successSitemapGenerated: "Sitemap успешно сгенерирован и подставлен в форму.",
    loadError:
      "Не удалось загрузить настройки с сервера. Проверьте, существует ли AppConfig на бэкенде.",
    saveError: "Не удалось сохранить настройки.",
    exportError: "Не удалось выгрузить JSON-конфиг.",
    yamlError: "Не удалось применить YAML.",
    sitemapError: "Не удалось сгенерировать sitemap.",
    emptyCategories:
      "Направления пока не добавлены. Можно начать с кнопки «Добавить направление».",
    question: "Вопрос",
    answer: "Ответ",
    name: "Название",
    report: "Отчет",
    ru: "РУ",
    kz: "ҚАЗ",
    en: "ENG",
    rawJsonTitle: "Текущая структура",
    rawJsonSubtitle:
      "Показывает, как текущая конфигурация будет отправлена в /settings/app-config.",
  },
  kz: {
    pageTitle: "Жиі қойылатын сұрақтар және бөлім баптаулары",
    pageSubtitle:
      "Бэкенд қолдайтын мүмкіндіктерге сәйкес санаттарды, ішкі санаттарды, есептерді, FAQ және sitemap-ты өңдеу.",
    save: "Баптауларды сақтау",
    saving: "Сақталуда...",
    reload: "Серверден жаңарту",
    export: "JSON жүктеу",
    yamlSave: "YAML сақтау",
    yamlSaving: "YAML жіберілуде...",
    addCategory: "Бағыт қосу",
    addSubcategory: "Ішкі санат қосу",
    addReport: "Есеп қосу",
    addFaq: "FAQ қосу",
    delete: "Жою",
    category: "Бағыт",
    subcategory: "Ішкі санат",
    reports: "Есептер",
    faq: "Жиі сұрақтар",
    sitemap: "Sitemap",
    sitemapSubtitle:
      "Қолмен өзгертуге болады немесе backend endpoints арқылы URL/HTML-ден markdown генерациялауға болады.",
    sitemapRu: "Sitemap RU",
    sitemapKz: "Sitemap KZ",
    fromUrl: "URL бойынша sitemap генерациялау",
    fromHtml: "HTML-ден sitemap генерациялау",
    locale: "Локаль",
    urlPlaceholder: "https://example.com/page",
    chooseFile: "HTML-файл таңдау",
    noFile: "Файл таңдалмады",
    generate: "Генерациялау",
    generating: "Генерациялануда...",
    yamlTitle: "YAML арқылы импорт",
    yamlSubtitle:
      "Егер командада дайын YAML конфигурациясы болса, оны осы жерге қойып, толық сақтауға болады.",
    yamlPlaceholder: "YAML конфигурациясын осы жерге қойыңыз",
    metaTitle: "Конфигурация күйі",
    lastUpdated: "Соңғы жаңарту",
    categoriesCount: "Бағыттар",
    faqCount: "FAQ саны",
    reportsCount: "Есептер саны",
    schemaNote:
      "Дерек көзі: /settings/app-config, сақтау: /settings/app-config және /settings/app-config/yaml.",
    successSaved: "Баптаулар сәтті сақталды.",
    successYamlSaved: "YAML сәтті қолданылды.",
    successSitemapGenerated: "Sitemap сәтті жасалып, формаға қойылды.",
    loadError:
      "Серверден баптауларды жүктеу мүмкін болмады. Бэкендте AppConfig бар-жоғын тексеріңіз.",
    saveError: "Баптауларды сақтау мүмкін болмады.",
    exportError: "JSON конфигін жүктеу мүмкін болмады.",
    yamlError: "YAML қолдану мүмкін болмады.",
    sitemapError: "Sitemap генерациялау мүмкін болмады.",
    emptyCategories:
      "Бағыттар әлі қосылмаған. «Бағыт қосу» батырмасынан бастауға болады.",
    question: "Сұрақ",
    answer: "Жауап",
    name: "Атауы",
    report: "Есеп",
    ru: "РУ",
    kz: "ҚАЗ",
    en: "ENG",
    rawJsonTitle: "Ағымдағы құрылым",
    rawJsonSubtitle:
      "Ағымдағы конфигурация /settings/app-config endpoint-іне қалай жіберілетінін көрсетеді.",
  },
};

const createLocalized = (value = {}) => ({
  ru: value.ru ?? "",
  kz: value.kz ?? "",
  en: value.en ?? "",
});

const createFaq = (item = {}) => ({
  question: createLocalized(item.question),
  answer: createLocalized(item.answer),
});

const createSubcategory = (subcategory = {}) => ({
  name: createLocalized(subcategory.name),
  reports: Array.isArray(subcategory.reports)
    ? subcategory.reports.map((report) => createLocalized(report))
    : [],
});

const createCategory = (category = {}) => ({
  name: createLocalized(category.name),
  subcategories: Array.isArray(category.subcategories)
    ? category.subcategories.map((subcategory) => createSubcategory(subcategory))
    : [],
  faq: Array.isArray(category.faq)
    ? category.faq.map((item) => createFaq(item))
    : [],
});

const normalizeConfig = (config = {}) => ({
  categories: Array.isArray(config.categories)
    ? config.categories.map((category) => createCategory(category))
    : [],
  sitemap: {
    ru: config.sitemap?.ru ?? "",
    kz: config.sitemap?.kz ?? "",
  },
  updated_at: config.updated_at ?? "",
});

const formatDateTime = (value, locale) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const FaqSettings = ({ credentials }) => {
  const { i18n } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();
  const langKey = i18n.language === "kz" ? "kz" : "ru";
  const text = TEXT[langKey];
  const htmlInputRef = useRef(null);

  const [config, setConfig] = useState(() => normalizeConfig());
  const [yamlText, setYamlText] = useState("");
  const [urlToParse, setUrlToParse] = useState("");
  const [sitemapLocale, setSitemapLocale] = useState("ru");
  const [htmlFile, setHtmlFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isYamlSaving, setIsYamlSaving] = useState(false);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);

  const authHeaders = useMemo(() => {
    const encodedCredentials = btoa(
      `${credentials.login}:${credentials.password}`,
    );

    return {
      Authorization: `Basic ${encodedCredentials}`,
    };
  }, [credentials.login, credentials.password]);

  const updateConfig = (updater) => {
    setConfig((previous) => {
      const next = structuredClone(previous);
      updater(next);
      return next;
    });
  };

  const loadConfig = async () => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.get("/settings/app-config", {
        headers: authHeaders,
      });
      const normalized = normalizeConfig(response.data);
      setConfig(normalized);
      setYamlText("");
    } catch (error) {
      console.error("Failed to load app config:", error);
      setStatus({ type: "error", message: text.loadError });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const payload = useMemo(
    () => ({
      categories: config.categories,
      sitemap: config.sitemap,
    }),
    [config.categories, config.sitemap],
  );

  const totalFaq = useMemo(
    () =>
      config.categories.reduce(
        (total, category) => total + (category.faq?.length ?? 0),
        0,
      ),
    [config.categories],
  );

  const totalReports = useMemo(
    () =>
      config.categories.reduce(
        (total, category) =>
          total +
          (category.subcategories ?? []).reduce(
            (innerTotal, subcategory) =>
              innerTotal + (subcategory.reports?.length ?? 0),
            0,
          ),
        0,
      ),
    [config.categories],
  );

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.put("/settings/app-config", payload, {
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
      });
      setConfig(normalizeConfig(response.data));
      setStatus({ type: "success", message: text.successSaved });
    } catch (error) {
      console.error("Failed to save app config:", error);
      setStatus({ type: "error", message: text.saveError });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setStatus({ type: "", message: "" });

    try {
      const response = await api.get("/settings/app-config/export", {
        headers: authHeaders,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "app-config.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export app config:", error);
      setStatus({ type: "error", message: text.exportError });
    }
  };

  const handleSaveYaml = async () => {
    if (!yamlText.trim()) {
      return;
    }

    setIsYamlSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.put("/settings/app-config/yaml", yamlText, {
        headers: {
          ...authHeaders,
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
      setConfig(normalizeConfig(response.data));
      setStatus({ type: "success", message: text.successYamlSaved });
    } catch (error) {
      console.error("Failed to save app config via yaml:", error);
      setStatus({ type: "error", message: text.yamlError });
    } finally {
      setIsYamlSaving(false);
    }
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
          locale: sitemapLocale,
        },
        {
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
        },
      );

      updateConfig((draft) => {
        draft.sitemap[sitemapLocale] = response.data.markdown ?? "";
      });
      setStatus({ type: "success", message: text.successSitemapGenerated });
    } catch (error) {
      console.error("Failed to generate sitemap from url:", error);
      setStatus({ type: "error", message: text.sitemapError });
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
          locale: sitemapLocale,
        },
      });

      updateConfig((draft) => {
        draft.sitemap[sitemapLocale] = response.data.markdown ?? "";
      });
      setStatus({ type: "success", message: text.successSitemapGenerated });
    } catch (error) {
      console.error("Failed to generate sitemap from html:", error);
      setStatus({ type: "error", message: text.sitemapError });
    } finally {
      setIsGeneratingHtml(false);
    }
  };

  const setLocalizedValue = (path, locale, value) => {
    updateConfig((draft) => {
      let target = draft;
      for (const segment of path) {
        target = target[segment];
      }
      target[locale] = value;
    });
  };

  const addCategory = () => {
    updateConfig((draft) => {
      draft.categories.push(createCategory());
    });
  };

  const deleteCategory = (categoryIndex) => {
    updateConfig((draft) => {
      draft.categories.splice(categoryIndex, 1);
    });
  };

  const addSubcategory = (categoryIndex) => {
    updateConfig((draft) => {
      draft.categories[categoryIndex].subcategories.push(createSubcategory());
    });
  };

  const deleteSubcategory = (categoryIndex, subcategoryIndex) => {
    updateConfig((draft) => {
      draft.categories[categoryIndex].subcategories.splice(subcategoryIndex, 1);
    });
  };

  const addReport = (categoryIndex, subcategoryIndex) => {
    updateConfig((draft) => {
      draft.categories[categoryIndex].subcategories[subcategoryIndex].reports.push(
        createLocalized(),
      );
    });
  };

  const deleteReport = (categoryIndex, subcategoryIndex, reportIndex) => {
    updateConfig((draft) => {
      draft.categories[categoryIndex].subcategories[subcategoryIndex].reports.splice(
        reportIndex,
        1,
      );
    });
  };

  const addFaq = (categoryIndex) => {
    updateConfig((draft) => {
      draft.categories[categoryIndex].faq.push(createFaq());
    });
  };

  const deleteFaq = (categoryIndex, faqIndex) => {
    updateConfig((draft) => {
      draft.categories[categoryIndex].faq.splice(faqIndex, 1);
    });
  };

  if (isLoading) {
    return (
      <div className="faq-settings">
        <div className="faq-settings-loader">{text.reload}</div>
      </div>
    );
  }

  return (
    <div className="faq-settings">
      <div className="faq-settings__header">
        <div>
          <h2 className="faq-settings__title">{text.pageTitle}</h2>
          <p className="faq-settings__subtitle">{text.pageSubtitle}</p>
        </div>
        <div className="faq-settings__actions">
          <Button type="button" className="faq-settings__action" onClick={loadConfig}>
            {text.reload}
          </Button>
          <Button type="button" className="faq-settings__action" onClick={handleExport}>
            {text.export}
          </Button>
          <Button
            type="button"
            className="faq-settings__action faq-settings__action_primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? text.saving : text.save}
          </Button>
        </div>
      </div>

      {status.message && (
        <div className={`faq-settings__status faq-settings__status_${status.type}`}>
          {status.message}
        </div>
      )}

      <section className="faq-settings__panel faq-settings__meta">
        <div className="faq-settings__panel-header">
          <h3 className="faq-settings__panel-title">{text.metaTitle}</h3>
          <button
            type="button"
            className="faq-settings__add-button"
            onClick={addCategory}
          >
            {text.addCategory}
          </button>
        </div>
        <div className="faq-settings__meta-grid">
          <div className="faq-settings__meta-card">
            <span>{text.lastUpdated}</span>
            <strong>{formatDateTime(config.updated_at, langKey === "kz" ? "kk-KZ" : "ru-RU")}</strong>
          </div>
          <div className="faq-settings__meta-card">
            <span>{text.categoriesCount}</span>
            <strong>{config.categories.length}</strong>
          </div>
          <div className="faq-settings__meta-card">
            <span>{text.faqCount}</span>
            <strong>{totalFaq}</strong>
          </div>
          <div className="faq-settings__meta-card">
            <span>{text.reportsCount}</span>
            <strong>{totalReports}</strong>
          </div>
        </div>
        <p className="faq-settings__meta-note">{text.schemaNote}</p>
      </section>

      <section className="faq-settings__stack">
        {config.categories.length ? (
          config.categories.map((category, categoryIndex) => (
            <article className="faq-settings__panel faq-settings__category" key={`category-${categoryIndex}`}>
              <div className="faq-settings__panel-header">
                <h3 className="faq-settings__panel-title">
                  {text.category} {categoryIndex + 1}
                </h3>
                <button
                  type="button"
                  className="faq-settings__remove-button"
                  onClick={() => deleteCategory(categoryIndex)}
                >
                  {text.delete}
                </button>
              </div>

              <div className="faq-settings__localized-grid">
                {LOCALE_KEYS.map((locale) => (
                  <label className="faq-settings__field" key={`category-name-${locale}`}>
                    <span className="faq-settings__field-label">
                      {text.name} {text[locale]}
                    </span>
                    <input
                      type="text"
                      className="faq-settings__input"
                      value={category.name[locale]}
                      onChange={(event) =>
                        setLocalizedValue(
                          ["categories", categoryIndex, "name"],
                          locale,
                          event.target.value,
                        )
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="faq-settings__nested-section">
                <div className="faq-settings__nested-header">
                  <h4>{text.subcategory}</h4>
                  <button
                    type="button"
                    className="faq-settings__add-button"
                    onClick={() => addSubcategory(categoryIndex)}
                  >
                    {text.addSubcategory}
                  </button>
                </div>

                {(category.subcategories ?? []).length ? (
                  category.subcategories.map((subcategory, subcategoryIndex) => (
                    <div className="faq-settings__nested-card" key={`subcategory-${subcategoryIndex}`}>
                      <div className="faq-settings__nested-header">
                        <h5>
                          {text.subcategory} {subcategoryIndex + 1}
                        </h5>
                        <button
                          type="button"
                          className="faq-settings__remove-button faq-settings__remove-button_small"
                          onClick={() => deleteSubcategory(categoryIndex, subcategoryIndex)}
                        >
                          {text.delete}
                        </button>
                      </div>

                      <div className="faq-settings__localized-grid">
                        {LOCALE_KEYS.map((locale) => (
                          <label className="faq-settings__field" key={`subcategory-name-${locale}`}>
                            <span className="faq-settings__field-label">
                              {text.name} {text[locale]}
                            </span>
                            <input
                              type="text"
                              className="faq-settings__input"
                              value={subcategory.name[locale]}
                              onChange={(event) =>
                                setLocalizedValue(
                                  [
                                    "categories",
                                    categoryIndex,
                                    "subcategories",
                                    subcategoryIndex,
                                    "name",
                                  ],
                                  locale,
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>

                      <div className="faq-settings__nested-section">
                        <div className="faq-settings__nested-header">
                          <h5>{text.reports}</h5>
                          <button
                            type="button"
                            className="faq-settings__add-button"
                            onClick={() => addReport(categoryIndex, subcategoryIndex)}
                          >
                            {text.addReport}
                          </button>
                        </div>

                        {(subcategory.reports ?? []).map((report, reportIndex) => (
                          <div className="faq-settings__list-item" key={`report-${reportIndex}`}>
                            <div className="faq-settings__nested-header">
                              <h6>
                                {text.report} {reportIndex + 1}
                              </h6>
                              <button
                                type="button"
                                className="faq-settings__remove-button faq-settings__remove-button_small"
                                onClick={() =>
                                  deleteReport(categoryIndex, subcategoryIndex, reportIndex)
                                }
                              >
                                {text.delete}
                              </button>
                            </div>
                            <div className="faq-settings__localized-grid">
                              {LOCALE_KEYS.map((locale) => (
                                <label className="faq-settings__field" key={`report-${reportIndex}-${locale}`}>
                                  <span className="faq-settings__field-label">
                                    {text.report} {text[locale]}
                                  </span>
                                  <input
                                    type="text"
                                    className="faq-settings__input"
                                    value={report[locale]}
                                    onChange={(event) =>
                                      setLocalizedValue(
                                        [
                                          "categories",
                                          categoryIndex,
                                          "subcategories",
                                          subcategoryIndex,
                                          "reports",
                                          reportIndex,
                                        ],
                                        locale,
                                        event.target.value,
                                      )
                                    }
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="faq-settings__empty-inline">{text.addSubcategory}</div>
                )}
              </div>

              <div className="faq-settings__nested-section">
                <div className="faq-settings__nested-header">
                  <h4>{text.faq}</h4>
                  <button
                    type="button"
                    className="faq-settings__add-button"
                    onClick={() => addFaq(categoryIndex)}
                  >
                    {text.addFaq}
                  </button>
                </div>

                {(category.faq ?? []).length ? (
                  category.faq.map((faqItem, faqIndex) => (
                    <div className="faq-settings__nested-card" key={`faq-${faqIndex}`}>
                      <div className="faq-settings__nested-header">
                        <h5>
                          FAQ {faqIndex + 1}
                        </h5>
                        <button
                          type="button"
                          className="faq-settings__remove-button faq-settings__remove-button_small"
                          onClick={() => deleteFaq(categoryIndex, faqIndex)}
                        >
                          {text.delete}
                        </button>
                      </div>

                      <div className="faq-settings__localized-grid">
                        {LOCALE_KEYS.map((locale) => (
                          <label className="faq-settings__field" key={`faq-question-${faqIndex}-${locale}`}>
                            <span className="faq-settings__field-label">
                              {text.question} {text[locale]}
                            </span>
                            <textarea
                              className="faq-settings__textarea faq-settings__textarea_small"
                              value={faqItem.question[locale]}
                              onChange={(event) =>
                                setLocalizedValue(
                                  [
                                    "categories",
                                    categoryIndex,
                                    "faq",
                                    faqIndex,
                                    "question",
                                  ],
                                  locale,
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>

                      <div className="faq-settings__localized-grid">
                        {LOCALE_KEYS.map((locale) => (
                          <label className="faq-settings__field" key={`faq-answer-${faqIndex}-${locale}`}>
                            <span className="faq-settings__field-label">
                              {text.answer} {text[locale]}
                            </span>
                            <textarea
                              className="faq-settings__textarea"
                              value={faqItem.answer[locale]}
                              onChange={(event) =>
                                setLocalizedValue(
                                  [
                                    "categories",
                                    categoryIndex,
                                    "faq",
                                    faqIndex,
                                    "answer",
                                  ],
                                  locale,
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="faq-settings__empty-inline">{text.addFaq}</div>
                )}
              </div>
            </article>
          ))
        ) : (
          <section className="faq-settings__panel faq-settings__empty-panel">
            <p>{text.emptyCategories}</p>
            <button
              type="button"
              className="faq-settings__add-button"
              onClick={addCategory}
            >
              {text.addCategory}
            </button>
          </section>
        )}
      </section>

      <section className="faq-settings__panel">
        <div className="faq-settings__panel-header">
          <h3 className="faq-settings__panel-title">{text.sitemap}</h3>
        </div>
        <p className="faq-settings__section-note">{text.sitemapSubtitle}</p>

        <div className="faq-settings__generator-grid">
          <div className="faq-settings__generator-card">
            <h4>{text.fromUrl}</h4>
            <label className="faq-settings__field">
              <span className="faq-settings__field-label">{text.locale}</span>
              <select
                className="faq-settings__select"
                value={sitemapLocale}
                onChange={(event) => setSitemapLocale(event.target.value)}
              >
                {SITEMAP_LOCALES.map((locale) => (
                  <option value={locale} key={locale}>
                    {text[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label className="faq-settings__field">
              <span className="faq-settings__field-label">URL</span>
              <input
                type="text"
                className="faq-settings__input"
                value={urlToParse}
                placeholder={text.urlPlaceholder}
                onChange={(event) => setUrlToParse(event.target.value)}
              />
            </label>
            <Button
              type="button"
              className="faq-settings__secondary-button"
              onClick={handleGenerateFromUrl}
              disabled={isGeneratingUrl}
            >
              {isGeneratingUrl ? text.generating : text.generate}
            </Button>
          </div>

          <div className="faq-settings__generator-card">
            <h4>{text.fromHtml}</h4>
            <label className="faq-settings__field">
              <span className="faq-settings__field-label">{text.locale}</span>
              <select
                className="faq-settings__select"
                value={sitemapLocale}
                onChange={(event) => setSitemapLocale(event.target.value)}
              >
                {SITEMAP_LOCALES.map((locale) => (
                  <option value={locale} key={locale}>
                    {text[locale]}
                  </option>
                ))}
              </select>
            </label>

            <input
              ref={htmlInputRef}
              type="file"
              accept=".html,.htm,text/html"
              className="faq-settings__hidden-file"
              onChange={(event) => setHtmlFile(event.target.files?.[0] ?? null)}
            />
            <div className="faq-settings__file-box">
              <span>{htmlFile ? htmlFile.name : text.noFile}</span>
              <button
                type="button"
                className="faq-settings__add-button"
                onClick={() => htmlInputRef.current?.click()}
              >
                {text.chooseFile}
              </button>
            </div>

            <Button
              type="button"
              className="faq-settings__secondary-button"
              onClick={handleGenerateFromHtml}
              disabled={isGeneratingHtml || !htmlFile}
            >
              {isGeneratingHtml ? text.generating : text.generate}
            </Button>
          </div>
        </div>

        <div className="faq-settings__localized-grid faq-settings__localized-grid_wide">
          <label className="faq-settings__field">
            <span className="faq-settings__field-label">{text.sitemapRu}</span>
            <textarea
              className="faq-settings__textarea faq-settings__textarea_tall"
              value={config.sitemap.ru}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.sitemap.ru = event.target.value;
                })
              }
            />
          </label>

          <label className="faq-settings__field">
            <span className="faq-settings__field-label">{text.sitemapKz}</span>
            <textarea
              className="faq-settings__textarea faq-settings__textarea_tall"
              value={config.sitemap.kz}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.sitemap.kz = event.target.value;
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="faq-settings__panel">
        <div className="faq-settings__panel-header">
          <h3 className="faq-settings__panel-title">{text.yamlTitle}</h3>
          <Button
            type="button"
            className="faq-settings__action"
            onClick={handleSaveYaml}
            disabled={isYamlSaving || !yamlText.trim()}
          >
            {isYamlSaving ? text.yamlSaving : text.yamlSave}
          </Button>
        </div>
        <p className="faq-settings__section-note">{text.yamlSubtitle}</p>
        <textarea
          className="faq-settings__textarea faq-settings__textarea_code"
          value={yamlText}
          placeholder={text.yamlPlaceholder}
          onChange={(event) => setYamlText(event.target.value)}
        />
      </section>

      <section className="faq-settings__panel">
        <div className="faq-settings__panel-header">
          <h3 className="faq-settings__panel-title">{text.rawJsonTitle}</h3>
        </div>
        <p className="faq-settings__section-note">{text.rawJsonSubtitle}</p>
        <pre className="faq-settings__json-preview">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </section>
    </div>
  );
};

FaqSettings.propTypes = {
  credentials: PropTypes.shape({
    login: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
};

export default FaqSettings;
