// src/hooks/useAuth.js
import { useApi } from "../components/Context/Context";

export const useAuth = () => {
   const api = useApi();

   /**
    * Функция для проверки логина администратора.
    * @param {string} login - Логин (например, "admin").
    * @param {string} password - Пароль (например, "HmADJuDisELD").
    * @returns {Promise<boolean>} - Возвращает true, если авторизация успешна, иначе false.
    */
   const checkAdmin = async (login, password) => {
      // Формируем строку "login:password" и кодируем её в base64.
      const encodedCredentials = btoa(`${login}:${password}`);
      try {
         // Отправляем GET-запрос на /check-admin с заголовком Authorization
         const response = await api.get("/check-admin", {
            headers: {
               Authorization: `Basic ${encodedCredentials}`,
            },
         });
         // Предполагаем, что сервер возвращает в response.data булево значение (true/false)
         return response.data;
      } catch (error) {
         console.error("Ошибка проверки администратора:", error);
         return false;
      }
   };

   return { checkAdmin };
};
