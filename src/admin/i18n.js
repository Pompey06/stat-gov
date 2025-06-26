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
        oldDbSubtitle: "Полностью выгрузить базу данных в xlsx",
        oldDbFileFieldText: "Выбрать файл",
        newQATitle: "Обновить базу данных",
        newQASubtitle: "Загрузить полностью обновленную базу данных в xlsx",
        newQAFileFieldText: "Выбрать файл",
        uploadButtonText: "Загрузить",
        exportButtonText: "Выгрузить",
        lastUpdate: "Последнее обновление",
        uploadCompleteMessage:
          "Загрузка завершена, данные обновляются. Пожалуйста, подождите — это может занять от 2 до 5 минут.",
        uploadErrorMessage: "Извините, произошла ошибка. Попробуйте ещё раз.",
        createdInstructions: "Создано инструкций: <1>{{count}}</1>",
        deletedInstructions: "Удалено инструкций: <1>{{count}}</1>",
        createdQAPairs: "Создано пар «вопрос–ответ»: <1>{{count}}</1>",
        deletedQAPairs: "Удалено пар «вопрос–ответ»: <1>{{count}}</1>",
        qaUpdated: "Обновлено пар «вопрос–ответ»: <1>{{count}}</1>",
      },
      feedbackExport: {
        title: "Выгрузка списка чатов и отзывов",
        subtitle: "Выберите период для выгрузки обратной связи",
        startDateTitle: "Дата с:",
        endDateTitle: "по:",
        datePlaceholder: "Выбор даты",
        downloadButton: "Скачать xlsx",
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
        oldDbSubtitle: "Мәліметтер базасын толық xlsx форматында шығару",
        oldDbFileFieldText: "Файлды таңдау",
        newQATitle: "Мәліметтер базасын жаңарту",
        newQASubtitle:
          "Мәліметтер базасының толық жаңартылған нұсқасын xlsx форматында жүктеу",
        newQAFileFieldText: "Файлды таңдау",
        uploadButtonText: "Жүктеу",
        exportButtonText: "Шығару",
        lastUpdate: "Соңғы жаңарту",
        uploadCompleteMessage:
          "Жүктеу аяқталды, деректер жаңартылуда. Өтінеміз, күте тұрыңыз — бұл 2-ден 5 минутқа дейін созылуы мүмкін.",
        uploadErrorMessage: "Кешіріңіз, қате орын алды. Қайтадан көріңізші.",
        createdInstructions: "Жасалған нұсқаулар: <1>{{count}}</1>",
        deletedInstructions: "Жойылған нұсқаулар: <1>{{count}}</1>",
        createdQAPairs: "Қосылған «сұрақ–жауап» жұптары: <1>{{count}}</1>",
        deletedQAPairs: "Жойылған «сұрақ–жауап» жұптары: <1>{{count}}</1>",
        qaUpdated: "Жаңартылған «сұрақ–жауап» жұптары: <1>{{count}}</1>",
      },
      feedbackExport: {
        title: "Чаттар мен пікірлер тізімін шығару",
        subtitle: "Кері байланыс шығару үшін кезеңді таңдаңыз",
        startDateTitle: "Басталу күні:",
        endDateTitle: "Аяқталу күні:",
        datePlaceholder: "Күнді таңдау",
        downloadButton: "xlsx жүктеу",
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
