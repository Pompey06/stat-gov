// src/contexts/ApiContext.jsx
import { createContext, useContext } from 'react';
import axios from 'axios';

// Создаем контекст
const ApiContext = createContext();


// Провайдер, который создает экземпляр axios с базовым URL
// eslint-disable-next-line react/prop-types
export const ContextProvider = ({ children }) => {
  // Создаем экземпляр axios с базовым URL
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  // Здесь можно добавить interceptors для логирования, обработки ошибок и т.д.
  // Например:
  // api.interceptors.response.use(
  //   response => response,
  //   error => Promise.reject(error)
  // );

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

// Хук для удобного доступа к API
export const useApi = () => {
  return useContext(ApiContext);
};

export default ContextProvider;
