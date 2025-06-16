# StatGov — фронтенд-приложение чата

## Установка зависимостей

```bash
npm install
```

## Запуск проекта

```bash
npm run dev
```

После запуска приложение будет доступно по адресу:  
[http://localhost:5173](http://localhost:5173)

---

## Создание `.env` файла

В корне проекта необходимо создать файл `.env` со следующим содержимым:

```env
VITE_API_URL=http://your-api-url/api
VITE_SHOW_SPECIAL_BUTTON=true/false
VITE_SHOW_AVATAR=true/false
```

**Описание переменных:**

-  `VITE_API_URL` — строка (string), базовый адрес API, к которому отправляются запросы (например, `http://example.com/api`);
-  `VITE_SHOW_SPECIAL_BUTTON` — boolean переменная (`true` или `false`), включает или отключает отображение специальной "бин"-кнопки на стартовом экране;
-  `VITE_SHOW_AVATAR` — boolean переменная (`true` или `false`), отвечает за отображение аватара как на стартовом экране, так и в сообщениях чата.

---
