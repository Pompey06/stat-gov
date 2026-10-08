import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import FaqEditor from "../FaqEditor/FaqEditor";
import CategoryEditor from "../CategoryEditor/CategoryEditor";
import { useApi } from "../Context/Context";
import useAuthHeaders from "../../hooks/useAuthHeaders";
import adminI18n from "../../i18n";
import "./FaqSettings.css";

const TEXT = {
  ru: {
    pageTitle: "Категории и FAQ",
    pageSubtitle:
      "Часто задаваемые вопросы показываются на стартовом экране чата. Категории — кнопки выбора темы, у каждой может быть свой FAQ.",
    save: "Сохранить",
    saving: "Сохранение...",
    reload: "Обновить с сервера",
    loading: "Загрузка...",
    successSaved: "Конфигурация успешно сохранена.",
    loadError:
      "Не удалось загрузить настройки с сервера. Проверьте, существует ли AppConfig на бэкенде.",
    saveError: "Не удалось сохранить конфигурацию.",
    unsavedChanges: "Есть несохранённые изменения.",
    frequentQuestionsTitle: "Часто задаваемые вопросы",
    categoriesTitle: "Категории",
    question: "Вопрос",
    answer: "Ответ",
    subquestions: "Вложенные вопросы",
    addQuestion: "+ Добавить вопрос",
    addSubquestion: "+ Добавить вложенный вопрос",
    deleteQuestion: "Удалить вопрос",
    confirmDeleteQuestion: "Удалить этот вопрос вместе со всеми вложенными?",
    noQuestions: "Пока нет вопросов.",
    categoryName: "Название категории",
    subcategories: "Подкатегории",
    subcategoryName: "Название подкатегории",
    reports: "Отчёты",
    categoryFaq: "FAQ категории",
  },
  kz: {
    pageTitle: "Санаттар мен FAQ",
    pageSubtitle:
      "Жиі қойылатын сұрақтар чаттың бастапқы экранында көрсетіледі. Санаттар — тақырып таңдау батырмалары, әр санаттың өз FAQ-ы болуы мүмкін.",
    save: "Сақтау",
    saving: "Сақталуда...",
    reload: "Серверден жаңарту",
    loading: "Жүктелуде...",
    successSaved: "Конфигурация сәтті сақталды.",
    loadError:
      "Серверден баптауларды жүктеу мүмкін болмады. Бэкендте AppConfig бар-жоғын тексеріңіз.",
    saveError: "Конфигурацияны сақтау мүмкін болмады.",
    unsavedChanges: "Сақталмаған өзгерістер бар.",
    frequentQuestionsTitle: "Жиі қойылатын сұрақтар",
    categoriesTitle: "Санаттар",
    question: "Сұрақ",
    answer: "Жауап",
    subquestions: "Қосалқы сұрақтар",
    addQuestion: "+ Сұрақ қосу",
    addSubquestion: "+ Қосалқы сұрақ қосу",
    deleteQuestion: "Сұрақты жою",
    confirmDeleteQuestion: "Бұл сұрақты барлық қосалқы сұрақтарымен бірге жою керек пе?",
    noQuestions: "Әзірге сұрақтар жоқ.",
    categoryName: "Санат атауы",
    subcategories: "Санатшалар",
    subcategoryName: "Санатша атауы",
    reports: "Есептер",
    categoryFaq: "Санат FAQ",
  },
};

const normalizeLocalized = (value = {}) => ({
  ru: value?.ru ?? "",
  kz: value?.kz ?? "",
  en: value?.en ?? "",
});

const normalizeFaqItem = (item = {}) => ({
  question: normalizeLocalized(item.question),
  answer: normalizeLocalized(item.answer),
  subquestions: Array.isArray(item.subquestions) ? item.subquestions.map(normalizeFaqItem) : [],
});

const normalizeFaqList = (items = []) =>
  Array.isArray(items) ? items.map(normalizeFaqItem) : [];

const normalizeSubcategory = (subcategory = {}) => ({
  name: normalizeLocalized(subcategory.name),
  reports: Array.isArray(subcategory.reports) ? subcategory.reports.map(normalizeLocalized) : [],
});

const normalizeCategory = (category = {}) => ({
  name: normalizeLocalized(category.name),
  subcategories: Array.isArray(category.subcategories)
    ? category.subcategories.map(normalizeSubcategory)
    : [],
  faq: normalizeFaqList(category.faq),
});

const normalizeCategories = (categories = []) =>
  Array.isArray(categories) ? categories.map(normalizeCategory) : [];

const snapshot = (frequentQuestions, categories) =>
  JSON.stringify({ frequentQuestions, categories });

const FaqSettings = ({ credentials }) => {
  const { i18n } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();
  const authHeaders = useAuthHeaders(credentials);
  const langKey = i18n.language === "kz" ? "kz" : "ru";
  const text = TEXT[langKey];

  // sitemap is not editable on this page, but PUT /settings/app-config
  // replaces the whole AppConfig, so it must always be sent back unchanged.
  const sitemapRef = useRef({ ru: "", kz: "" });
  const savedSnapshotRef = useRef("");

  const [frequentQuestions, setFrequentQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = snapshot(frequentQuestions, categories) !== savedSnapshotRef.current;

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.get("/settings/app-config", { headers: authHeaders });

      const nextFrequentQuestions = normalizeFaqList(response.data?.frequent_questions);
      const nextCategories = normalizeCategories(response.data?.categories);

      sitemapRef.current = {
        ru: response.data?.sitemap?.ru ?? "",
        kz: response.data?.sitemap?.kz ?? "",
      };

      setFrequentQuestions(nextFrequentQuestions);
      setCategories(nextCategories);
      savedSnapshotRef.current = snapshot(nextFrequentQuestions, nextCategories);
    } catch (error) {
      console.error("Failed to load app config:", error);
      setStatus({ type: "error", message: text.loadError });
    } finally {
      setIsLoading(false);
    }
    // text.loadError intentionally omitted: it would re-trigger the load
    // effect on every language switch, which is not desired here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, authHeaders]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        frequent_questions: normalizeFaqList(frequentQuestions),
        categories: normalizeCategories(categories),
        sitemap: sitemapRef.current,
      };

      const response = await api.put("/settings/app-config", payload, {
        headers: authHeaders,
      });

      const nextFrequentQuestions = normalizeFaqList(response.data?.frequent_questions);
      const nextCategories = normalizeCategories(response.data?.categories);

      sitemapRef.current = {
        ru: response.data?.sitemap?.ru ?? sitemapRef.current.ru,
        kz: response.data?.sitemap?.kz ?? sitemapRef.current.kz,
      };

      setFrequentQuestions(nextFrequentQuestions);
      setCategories(nextCategories);
      savedSnapshotRef.current = snapshot(nextFrequentQuestions, nextCategories);
      setStatus({ type: "success", message: text.successSaved });
    } catch (error) {
      console.error("Failed to save app config:", error);
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
            disabled={isSaving || !isDirty}
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

      <section className="faq-settings__panel">
        <h3 className="faq-settings__section-title">{text.frequentQuestionsTitle}</h3>
        <FaqEditor items={frequentQuestions} onChange={setFrequentQuestions} texts={text} depth={0} />
      </section>

      <section className="faq-settings__panel">
        <h3 className="faq-settings__section-title">{text.categoriesTitle}</h3>
        {categories.map((category, index) => (
          <CategoryEditor
            key={index}
            category={category}
            onChange={(next) => {
              const nextCategories = categories.slice();
              nextCategories[index] = next;
              setCategories(nextCategories);
            }}
            texts={text}
          />
        ))}
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
