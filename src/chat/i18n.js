import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем переводы
import translationRu from "./locales/ru.json";
import translationKz from "./locales/kz.json";
import translationEn from "./locales/en.json";

const RU_LANGUAGE = "\u0440\u0443\u0441";
const KZ_LANGUAGE = "\u049b\u0430\u0437";
const EN_LANGUAGE = "eng";
const supportedLanguages = [RU_LANGUAGE, KZ_LANGUAGE];
const storedLocale = localStorage.getItem("locale");

const normalizeStoredLanguage = (lang) => {
  if (lang === EN_LANGUAGE || lang === "en") return RU_LANGUAGE;
  if (lang === "ru" || lang === RU_LANGUAGE) return RU_LANGUAGE;
  if (lang === "kz" || lang === "kk" || lang === KZ_LANGUAGE) {
    return KZ_LANGUAGE;
  }
  return KZ_LANGUAGE;
};

const initialLanguage = normalizeStoredLanguage(storedLocale);

if (storedLocale && !supportedLanguages.includes(storedLocale)) {
  localStorage.setItem("locale", initialLanguage);
}

// Конфигурация i18n
const chatI18n = i18n.createInstance();
chatI18n.use(initReactI18next).init({
  resources: {
    [RU_LANGUAGE]: { translation: translationRu },
    [KZ_LANGUAGE]: { translation: translationKz },
    [EN_LANGUAGE]: { translation: translationEn },
  },
  lng: initialLanguage,
  fallbackLng: initialLanguage,
  interpolation: {
    escapeValue: false, // React уже экранирует строки
  },
});

export default chatI18n;
