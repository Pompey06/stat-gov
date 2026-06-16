import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем переводы
import translationRu from "./locales/ru.json";
import translationKz from "./locales/kz.json";
import translationEn from "./locales/en.json";

const supportedLanguages = ["рус", "қаз", "eng"];
const storedLocale = localStorage.getItem("locale");
const initialLanguage = supportedLanguages.includes(storedLocale)
  ? storedLocale
  : "қаз";

// Конфигурация i18n
const chatI18n = i18n.createInstance();
chatI18n.use(initReactI18next).init({
  resources: {
    рус: { translation: translationRu },
    қаз: { translation: translationKz },
    eng: { translation: translationEn },
  },
  lng: initialLanguage,
  fallbackLng: initialLanguage,
  interpolation: {
    escapeValue: false, // React уже экранирует строки
  },
});

export default chatI18n;
