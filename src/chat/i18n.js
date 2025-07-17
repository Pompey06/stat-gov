import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем переводы
import translationRu from "./locales/ru.json";
import translationKz from "./locales/kz.json";

// Конфигурация i18n
const chatI18n = i18n.createInstance();
chatI18n.use(initReactI18next).init({
  resources: {
    рус: { translation: translationRu },
    қаз: { translation: translationKz },
  },
  lng: localStorage.getItem("locale") || "қаз",
  fallbackLng: localStorage.getItem("locale") || "қаз",
  interpolation: {
    escapeValue: false, // React уже экранирует строки
  },
});

export default chatI18n;
