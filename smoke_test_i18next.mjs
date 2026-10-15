// Smoke test for i18next 24->26 / react-i18next 15->17.
// Mirrors src/chat/i18n.js init pattern (without the browser-only URL/localStorage bits).
import i18n from "i18next";
import translationRu from "./src/chat/locales/ru.json" with { type: "json" };
import translationKz from "./src/chat/locales/kz.json" with { type: "json" };
import translationEn from "./src/chat/locales/en.json" with { type: "json" };

const RU = "рус";
const KZ = "қаз";
const EN = "eng";

const instance = i18n.createInstance();
await instance.init({
  resources: {
    [RU]: { translation: translationRu },
    [KZ]: { translation: translationKz },
    [EN]: { translation: translationEn },
  },
  lng: RU,
  fallbackLng: RU,
  supportedLngs: [RU, KZ, EN],
  interpolation: { escapeValue: false },
});

console.log("OK: i18next.createInstance().init() succeeded, version:", i18n.default?.version ?? "n/a");

const sampleKeys = ["messages.feedbackPrompt", "frequentQuestions.title", "logo.text", "chat.suggestionText", "sidebar.close"];
for (const key of sampleKeys) {
  const ru = instance.t(key);
  await instance.changeLanguage(KZ);
  const kz = instance.t(key);
  await instance.changeLanguage(RU);
  console.log(`  key="${key}" ru="${String(ru).slice(0, 40)}" kz="${String(kz).slice(0, 40)}"`);
}

console.log("ALL I18NEXT SMOKE CHECKS COMPLETED");
