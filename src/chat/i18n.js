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

const normalizeLanguageCode = (lang) => {
   const normalizedLanguage = String(lang || "").trim().toLowerCase();

   if (normalizedLanguage === EN_LANGUAGE || normalizedLanguage === "en") {
      return EN_LANGUAGE;
   }

   if (normalizedLanguage === "ru" || normalizedLanguage === RU_LANGUAGE) {
      return RU_LANGUAGE;
   }

   if (
      normalizedLanguage === "kz" ||
      normalizedLanguage === "kk" ||
      normalizedLanguage === KZ_LANGUAGE
   ) {
      return KZ_LANGUAGE;
   }

   return null;
};

const normalizeStoredLanguage = (lang) => {
   return normalizeLanguageCode(lang) || KZ_LANGUAGE;
};

const getLanguageFromPathname = (pathname) => {
   const pathLanguage = pathname.split("/").filter(Boolean)[0];

   return normalizeLanguageCode(pathLanguage);
};

const getLanguageFromUrl = (url) => {
   try {
      const parsedUrl = new URL(url, window.location.origin);
      const queryLanguage = normalizeLanguageCode(
         parsedUrl.searchParams.get("lang"),
      );

      return {
         queryLanguage,
         pathLanguage: getLanguageFromPathname(parsedUrl.pathname),
      };
   } catch {
      return { queryLanguage: null, pathLanguage: null };
   }
};

const getEmbeddedLanguage = () => {
   const urls = [window.location.href];

   try {
      if (window.parent !== window) {
         urls.push(window.parent.location.href);
      }
   } catch {
      // The parent URL is inaccessible when the iframe has another origin.
   }

   if (document.referrer) {
      urls.push(document.referrer);
   }

   const parsedUrls = urls.map(getLanguageFromUrl);

   for (const { queryLanguage } of parsedUrls) {
      if (queryLanguage) return queryLanguage;
   }

   for (const { pathLanguage } of parsedUrls) {
      if (pathLanguage) return pathLanguage;
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
