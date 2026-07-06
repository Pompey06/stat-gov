import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { parse, stringify } from "yaml";
import Button from "../Button/Button";
import YamlEditor from "../YamlEditor/YamlEditor";
import { useApi } from "../Context/Context";
import useAuthHeaders from "../../hooks/useAuthHeaders";
import adminI18n from "../../i18n";
import { buildCategoriesYamlSchema, bundledCategoriesYamlSchema } from "../../utils/appConfigSchema";
import { validateYamlDocument } from "../../utils/yamlSchemaLinter";
import "./FaqSettings.css";

const TEXT = {
  ru: {
    pageTitle: "Категории и FAQ",
    pageSubtitle:
      "Категории и отчёты — кнопки в начале чата для выбора темы. FAQ — если бот не знает ответ, предлагает примеры вопросов.",
    save: "Сохранить",
    saving: "Сохранение...",
    reload: "Обновить с сервера",
    loading: "Загрузка...",
    successSaved: "Конфигурация успешно сохранена.",
    loadError:
      "Не удалось загрузить настройки с сервера. Проверьте, существует ли AppConfig на бэкенде.",
    saveError: "Не удалось сохранить конфигурацию.",
    unsavedChanges: "Есть несохранённые изменения.",
  },
  kz: {
    pageTitle: "Санаттар мен FAQ",
    pageSubtitle:
      "Санаттар мен есептер — чаттың басында таңдауға арналған батырмалар. FAQ — бот жауап білмесе, сұрақ мысалдарын ұсынады.",
    save: "Сақтау",
    saving: "Сақталуда...",
    reload: "Серверден жаңарту",
    loading: "Жүктелуде...",
    successSaved: "Конфигурация сәтті сақталды.",
    loadError:
      "Серверден баптауларды жүктеу мүмкін болмады. Бэкендте AppConfig бар-жоғын тексеріңіз.",
    saveError: "Конфигурацияны сақтау мүмкін болмады.",
    unsavedChanges: "Сақталмаған өзгерістер бар.",
  },
};

const normalizeLocalized = (value = {}) => ({
  ru: value?.ru ?? "",
  kz: value?.kz ?? "",
  en: value?.en ?? "",
});

const normalizeFaq = (item = {}) => ({
  question: normalizeLocalized(item.question),
  answer: normalizeLocalized(item.answer),
});

const normalizeSubcategory = (subcategory = {}) => ({
  name: normalizeLocalized(subcategory.name),
  reports: Array.isArray(subcategory.reports)
    ? subcategory.reports.map((report) => normalizeLocalized(report))
    : [],
});

const normalizeCategory = (category = {}) => ({
  name: normalizeLocalized(category.name),
  subcategories: Array.isArray(category.subcategories)
    ? category.subcategories.map((subcategory) => normalizeSubcategory(subcategory))
    : [],
  faq: Array.isArray(category.faq)
    ? category.faq.map((item) => normalizeFaq(item))
    : [],
});

const normalizeCategories = (categories = []) =>
  Array.isArray(categories) ? categories.map((category) => normalizeCategory(category)) : [];

const categoriesToYaml = (categories) =>
  stringify({ categories: normalizeCategories(categories) }, { lineWidth: 0 });

const FaqSettings = ({ credentials }) => {
  const { i18n } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();
  const authHeaders = useAuthHeaders(credentials);
  const langKey = i18n.language === "kz" ? "kz" : "ru";
  const text = TEXT[langKey];

  const sitemapRef = useRef({ ru: "", kz: "" });
  const savedYamlRef = useRef("");
  const yamlSchemaRef = useRef(bundledCategoriesYamlSchema);

  const [yamlText, setYamlText] = useState("");
  const [yamlSchema, setYamlSchema] = useState(bundledCategoriesYamlSchema);
  const [validationErrors, setValidationErrors] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = yamlText !== savedYamlRef.current;
  const hasValidationErrors = validationErrors.length > 0;

  const applyYaml = useCallback((text, schema = yamlSchemaRef.current) => {
    setYamlText(text);
    setValidationErrors(validateYamlDocument(text, schema));
  }, []);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const [configResponse, schemaResponse] = await Promise.all([
        api.get("/settings/app-config", { headers: authHeaders }),
        api.get("/settings/schema", { headers: authHeaders }).catch(() => null),
      ]);

      if (schemaResponse?.data) {
        const nextSchema = buildCategoriesYamlSchema(schemaResponse.data);
        yamlSchemaRef.current = nextSchema;
        setYamlSchema(nextSchema);
      }

      const categories = normalizeCategories(configResponse.data?.categories);
      const nextYaml = categoriesToYaml(categories);

      sitemapRef.current = {
        ru: configResponse.data?.sitemap?.ru ?? "",
        kz: configResponse.data?.sitemap?.kz ?? "",
      };
      savedYamlRef.current = nextYaml;
      applyYaml(nextYaml);
    } catch (error) {
      console.error("Failed to load app config:", error);
      setStatus({ type: "error", message: text.loadError });
    } finally {
      setIsLoading(false);
    }
  }, [api, applyYaml, authHeaders, text.loadError]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    const errors = validateYamlDocument(yamlText, yamlSchemaRef.current);

    if (errors.length) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const document = parse(yamlText);
      const categories = normalizeCategories(document.categories);
      const payload = stringify(
        {
          categories,
          sitemap: sitemapRef.current,
        },
        { lineWidth: 0 },
      );

      const response = await api.put("/settings/app-config/yaml", payload, {
        headers: {
          ...authHeaders,
          "Content-Type": "text/plain; charset=utf-8",
        },
      });

      const nextYaml = categoriesToYaml(response.data?.categories);

      sitemapRef.current = {
        ru: response.data?.sitemap?.ru ?? sitemapRef.current.ru,
        kz: response.data?.sitemap?.kz ?? sitemapRef.current.kz,
      };
      savedYamlRef.current = nextYaml;
      applyYaml(nextYaml);
      setStatus({ type: "success", message: text.successSaved });
    } catch (error) {
      console.error("Failed to save app config via yaml:", error);
      setStatus({ type: "error", message: text.saveError });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="faq-settings">
        <div className="faq-settings-loader">{text.loading}</div>
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
          <Button
            type="button"
            className="faq-settings__action faq-settings__action_primary"
            onClick={handleSave}
            disabled={isSaving || hasValidationErrors || !isDirty}
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

      {isDirty && !status.message && (
        <div className="faq-settings__status faq-settings__status_info">
          {text.unsavedChanges}
        </div>
      )}

      <section className="faq-settings__panel faq-settings__editor-panel">
        <YamlEditor
          value={yamlText}
          onChange={applyYaml}
          schema={yamlSchema}
          errors={validationErrors}
        />
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
