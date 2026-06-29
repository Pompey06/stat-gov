import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: {
    translation: {
      sidebar: {
        databaseUpdate: "Обновить базу данных",
        feedbackExport: "Выгрузка обратной связи",
        analytics: "Аналитика",
      },
      databaseUpdate: {
        oldDbTitle: "Выгрузить старую базу данных",
        oldDbSubtitle: "Полностью выгрузить базу данных в xlsx",
        oldDbFileFieldText: "Выбрать файл",
        newQATitle: "Обновить базу данных",
        newQASubtitle:
          "Загрузить полностью обновленную базу данных в xlsx",
        newQAFileFieldText: "Выбрать файл",
        uploadButtonText: "Загрузить",
        exportButtonText: "Выгрузить",
        lastUpdate: "Последнее обновление",
        uploadCompleteMessage:
          "Загрузка завершена, данные обновляются. Пожалуйста, подождите: это может занять от 2 до 5 минут.",
        uploadErrorMessage:
          "Извините, произошла ошибка. Попробуйте еще раз.",
        createdInstructions: "Создано инструкций: <1>{{count}}</1>",
        deletedInstructions: "Удалено инструкций: <1>{{count}}</1>",
        createdQAPairs:
          "Создано пар «вопрос-ответ»: <1>{{count}}</1>",
        deletedQAPairs:
          "Удалено пар «вопрос-ответ»: <1>{{count}}</1>",
        qaUpdated: "Обновлено пар «вопрос-ответ»: <1>{{count}}</1>",
      },
      feedbackExport: {
        title: "Выгрузка списка чатов и отзывов",
        subtitle: "Выберите период для выгрузки обратной связи",
        startDateTitle: "Дата с:",
        endDateTitle: "по:",
        datePlaceholder: "Выбор даты",
        downloadButton: "Скачать xlsx",
      },
      analytics: {
        title: "Аналитика и мониторинг",
        subtitle:
          "Сводка по обращениям, качеству ответов и стабильности работы ИИ-помощника за выбранный период.",
        refresh: "Обновить данные",
        partialError:
          "Часть аналитических данных не загрузилась. Доступные блоки показаны ниже.",
        filters: {
          from: "Дата с:",
          to: "по:",
          bucket: "Группировка",
          hour: "По часам",
          day: "По дням",
          datePlaceholder: "Выбор даты",
        },
        cards: {
          requests: "Обработано запросов",
          conversations: "Всего чатов",
          feedbackGood: "Хорошие оценки",
          feedbackBad: "Плохие оценки",
          notFound: "Не найдено информации",
          cancelled: "Остановленные ответы",
          unanswered: "Остались без ответа",
        },
        chart: {
          title: "Нагрузка и стабильность по времени",
          subtitle:
            "График показывает, как менялся объем ответов, количество ошибок и случаев, когда информация не была найдена.",
          requests: "Ответы",
          errors: "Ошибки",
          notFound: "Не найдено",
          empty: "За выбранный период данных для графика пока нет.",
        },
        insights: {
          title: "Ключевые наблюдения",
          peakLoad: "Пиковая нагрузка",
          peakErrors: "Пик ошибок",
          feedbackTotal: "Всего оценок",
        },
        langfuse: {
          title: "Langfuse",
          connected: "Параметры подключения получены с бэкенда.",
          empty: "Интеграция не настроена или не вернула данные.",
          path: "Ссылка",
          login: "Логин",
          password: "Пароль",
          open: "Открыть Langfuse",
          show: "Показать",
          hide: "Скрыть",
        },
      },
    },
  },
  kz: {
    translation: {
      sidebar: {
        databaseUpdate: "Мәліметтер базасын жаңарту",
        feedbackExport: "Кері байланыс жүктеу",
        analytics: "Талдау",
      },
      databaseUpdate: {
        oldDbTitle: "Ескі мәліметтер базасын шығару",
        oldDbSubtitle:
          "Мәліметтер базасын толық xlsx форматында шығару",
        oldDbFileFieldText: "Файлды таңдау",
        newQATitle: "Мәліметтер базасын жаңарту",
        newQASubtitle:
          "Толық жаңартылған мәліметтер базасын xlsx форматында жүктеу",
        newQAFileFieldText: "Файлды таңдау",
        uploadButtonText: "Жүктеу",
        exportButtonText: "Шығару",
        lastUpdate: "Соңғы жаңарту",
        uploadCompleteMessage:
          "Жүктеу аяқталды, деректер жаңартылып жатыр. Өтінеміз, күте тұрыңыз: бұл 2-ден 5 минутқа дейін созылуы мүмкін.",
        uploadErrorMessage:
          "Кешіріңіз, қате орын алды. Қайтадан көріңіз.",
        createdInstructions: "Жасалған нұсқаулар: <1>{{count}}</1>",
        deletedInstructions: "Жойылған нұсқаулар: <1>{{count}}</1>",
        createdQAPairs:
          "Қосылған «сұрақ-жауап» жұптары: <1>{{count}}</1>",
        deletedQAPairs:
          "Жойылған «сұрақ-жауап» жұптары: <1>{{count}}</1>",
        qaUpdated: "Жаңартылған «сұрақ-жауап» жұптары: <1>{{count}}</1>",
      },
      feedbackExport: {
        title: "Чаттар мен пікірлер тізімін шығару",
        subtitle: "Кері байланысты шығару үшін кезеңді таңдаңыз",
        startDateTitle: "Басталу күні:",
        endDateTitle: "Аяқталу күні:",
        datePlaceholder: "Күнді таңдау",
        downloadButton: "xlsx жүктеу",
      },
      analytics: {
        title: "Талдау және мониторинг",
        subtitle:
          "Таңдалған кезең бойынша сұраныстар, жауап сапасы және ИИ-көмекшінің тұрақтылығы туралы қысқаша мәлімет.",
        refresh: "Деректерді жаңарту",
        partialError:
          "Аналитиканың бір бөлігі жүктелмеді. Қол жетімді блоктар төменде көрсетілді.",
        filters: {
          from: "Басталу күні:",
          to: "Аяқталу күні:",
          bucket: "Топтау",
          hour: "Сағат бойынша",
          day: "Күн бойынша",
          datePlaceholder: "Күнді таңдау",
        },
        cards: {
          requests: "Өңделген сұраныстар",
          conversations: "Барлық чаттар",
          feedbackGood: "Жақсы бағалар",
          feedbackBad: "Жаман бағалар",
          notFound: "Ақпарат табылмады",
          cancelled: "Тоқтатылған жауаптар",
          unanswered: "Жауапсыз қалғандар",
        },
        chart: {
          title: "Уақыт бойынша жүктеме және тұрақтылық",
          subtitle:
            "График жауаптар санының, қателердің және ақпарат табылмаған жағдайлардың қалай өзгергенін көрсетеді.",
          requests: "Жауаптар",
          errors: "Қателер",
          notFound: "Табылмады",
          empty: "Таңдалған кезең үшін график деректері әзірге жоқ.",
        },
        insights: {
          title: "Негізгі байқаулар",
          peakLoad: "Ең жоғары жүктеме",
          peakErrors: "Қателер шыңы",
          feedbackTotal: "Бағалардың жалпы саны",
        },
        langfuse: {
          title: "Langfuse",
          connected: "Қосылу параметрлері бэкендтен алынды.",
          empty: "Интеграция бапталмаған немесе дерек қайтармады.",
          path: "Сілтеме",
          login: "Логин",
          password: "Құпиясөз",
          open: "Langfuse ашу",
          show: "Көрсету",
          hide: "Жасыру",
        },
      },
    },
  },
};

const adminI18n = i18n.createInstance();
adminI18n.use(initReactI18next).init({
  resources,
  lng: "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default adminI18n;
