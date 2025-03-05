import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
   ru: {
      translation: {
         sidebar: {
            databaseUpdate: "Обновить базу данных",
            feedbackExport: "Выгрузка обратной связи",
         },
         databaseUpdate: {
            oldDbTitle: "Выгрузить старую базу данных",
            oldDbSubtitle: "Выгрузить старые пары вопрос-ответ в csv (или xlsx)",
            oldDbFileFieldText: "Выбрать файл",
            newQATitle: "Добавить новые вопросы и ответы",
            newQASubtitle: "Реализовать подгрузку новой пары вопрос-ответ в csv (или xlsx)",
            newQAFileFieldText: "Выбрать файл",
            uploadButtonText: "Загрузить",
            exportButtonText: "Выгрузить",
            lastUpdate: "Последнее обновление",
         },
         feedbackExport: {
            title: "Выгрузка списка чатов и отзывов",
            subtitle: "Выберите период для выгрузки обратной связи",
            startDateTitle: "Дата с:",
            endDateTitle: "по:",
            datePlaceholder: "Выбор даты",
            downloadButton: "Скачать CSV",
         },
      },
   },
   kz: {
      translation: {
         sidebar: {
            databaseUpdate: "Мәліметтер базасын жаңарту",
            feedbackExport: "Кері байланыс жүктеу",
         },
         databaseUpdate: {
            oldDbTitle: "Ескі мәліметтер базасын шығару",
            oldDbSubtitle: "csv (немесе xlsx) форматында ескі сұрақ-жауап жұптарын шығару",
            oldDbFileFieldText: "Файлды таңдау",
            newQATitle: "Жаңа сұрақтар мен жауаптарды қосу",
            newQASubtitle: "csv (немесе xlsx) форматында жаңа сұрақ-жауап жұптарын жүктеу",
            newQAFileFieldText: "Файлды таңдау",
            uploadButtonText: "Жүктеу",
            exportButtonText: "Шығару",
            lastUpdate: "Соңғы жаңарту",
         },
         feedbackExport: {
            title: "Чаттар мен пікірлер тізімін шығару",
            subtitle: "Кері байланыс шығару үшін кезеңді таңдаңыз",
            startDateTitle: "Басталу күні:",
            endDateTitle: "Аяқталу күні:",
            datePlaceholder: "Күнді таңдау",
            downloadButton: "CSV жүктеу",
         },
      },
   },
};

const adminI18n = i18n.createInstance();
adminI18n.use(initReactI18next).init({
   resources,
   lng: "ru", // язык по умолчанию
   fallbackLng: "ru",
   interpolation: {
      escapeValue: false, // React сам экранирует значения
   },
});

export default adminI18n;
