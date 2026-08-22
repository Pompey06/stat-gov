import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем переводы
import translationRu from "./locales/ru.json";
import translationKz from "./locales/kz.json";
import translationEn from "./locales/en.json";

const RU_LANGUAGE = "\u0440\u0443\u0441";
const KZ_LANGUAGE = "\u049b\u0430\u0437";
const EN_LANGUAGE = "eng";
const supportedLanguages = [RU_LANGUAGE, KZ_LANGUAGE, EN_LANGUAGE];
const storedLocale = localStorage.getItem("locale");

const normalizeStoredLanguage = (lang) => {
   if (lang === EN_LANGUAGE || lang === "en") return EN_LANGUAGE;
   if (lang === "ru" || lang === RU_LANGUAGE) return RU_LANGUAGE;
   if (lang === "kz" || lang === "kk" || lang === KZ_LANGUAGE) {
      return KZ_LANGUAGE;
   }
   return KZ_LANGUAGE;
};

const getLanguageFromPathname = (pathname) => {
   const pathLanguage = pathname.split("/").filter(Boolean)[0];

   if (pathLanguage === "ru") return RU_LANGUAGE;
   if (pathLanguage === "en") return EN_LANGUAGE;
   if (pathLanguage === "kz" || pathLanguage === "kk") return KZ_LANGUAGE;
   if (!pathLanguage) return KZ_LANGUAGE;

   return null;
};

const getEmbeddedLanguage = () => {
   try {
      const parentLanguage = getLanguageFromPathname(window.parent.location.pathname);
      if (parentLanguage) return parentLanguage;
   } catch {
      // The parent URL is inaccessible when the iframe has another origin.
   }

   if (document.referrer) {
      try {
         return getLanguageFromPathname(new URL(document.referrer).pathname);
      } catch {
         return null;
      }
   }

   return null;
};

const embeddedLanguage = getEmbeddedLanguage();
const initialLanguage = embeddedLanguage || normalizeStoredLanguage(storedLocale);

if (embeddedLanguage && storedLocale !== embeddedLanguage) {
   localStorage.setItem("locale", embeddedLanguage);
}

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
   fallbackLng: RU_LANGUAGE,
   supportedLngs: supportedLanguages,
   interpolation: {
      escapeValue: false, // React уже экранирует строки
   },
});

export default chatI18n;
