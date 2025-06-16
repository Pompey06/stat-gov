# StatGov — фронтенд-приложение чата

1. Установка зависимостей:  
   `npm install`

2. Запуск проекта:  
   `npm run dev`

После запуска приложение будет доступно по адресу:  
`http://localhost:5173`

В корне проекта необходимо создать файл `.env` со следующим содержимым:

VITE_API_URL=http://your-api-url/api
VITE_SHOW_SPECIAL_BUTTON=true/false
VITE_SHOW_AVATAR=true/false

-  `VITE_API_URL` — строка (string), базовый адрес API, к которому отправляются запросы (например, `http://example.com/api`).
-  `VITE_SHOW_SPECIAL_BUTTON` — boolean переменная (true/false), отвечает за отображение специальной "бин"-кнопки на стартовом экране.
-  `VITE_SHOW_AVATAR` — boolean переменная (true/false), отвечает за отображение аватара как на стартовом экране, так и в сообщениях чата.
