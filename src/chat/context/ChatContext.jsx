import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
   hasFeedback,
   saveFeedbackState,
   hasBadFeedbackPrompt,
   saveBadFeedbackPromptState,
   getFilePaths,
   saveFilePath,
   getFilePathByBotIndex,
   isChatDeleted,
   markChatAsDeleted,
} from "../utils/feedbackStorage";
import chatI18n from "../i18n";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
   const { t, i18n } = useTranslation(undefined, { i18n: chatI18n });
   const [translationsKz, setTranslationsKz] = useState({});
   const [categories, setCategories] = useState([]);
   const [currentCategory, setCurrentCategory] = useState(null);
   const [currentSubcategory, setCurrentSubcategory] = useState(null);

   const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true, // <-- добавлено
   });

   const createDefaultChat = () => ({
      id: null,
      title: null,
      messages: [
         {
            text: t("chat.greeting"),
            isUser: false,
            isFeedback: false,
            isButton: false,
            isGreeting: true,
         },
      ],
      lastUpdated: new Date().toISOString(), // Новый параметр активности
      isEmpty: true,
      showInitialButtons: true,
      buttonsWereHidden: false,
      buttonsWereShown: false,
   });

   function autoDeleteInactiveChats() {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setChats((prevChats) => {
         // Выделяем дефолтный чат (id === null) отдельно – он не подлежит автоудалению
         const defaultChat = prevChats.find((chat) => chat.id === null);

         // Фильтруем все чаты с id !== null, оставляя только активные (lastUpdated не старше недели)
         const activeNonDefault = prevChats
            .filter((chat) => chat.id !== null)
            .filter((chat) => new Date(chat.lastUpdated) >= weekAgo);

         // Помечаем как удалённые неактивные (только для чатов с id !== null)
         prevChats.forEach((chat) => {
            if (chat.id !== null) {
               const lastUpdatedDate = new Date(chat.lastUpdated);
               if (lastUpdatedDate < weekAgo) {
                  markChatAsDeleted(chat.id);
               }
            }
         });

         // Собираем итоговый массив: если дефолтный чат есть, он всегда остается
         const newChats = defaultChat ? [defaultChat, ...activeNonDefault] : activeNonDefault;

         // Если текущий активный чат удален (или его id нет в новом массиве), переключаемся:
         if (currentChatId && !newChats.some((chat) => String(chat.id) === String(currentChatId))) {
            if (activeNonDefault.length > 0) {
               setCurrentChatId(activeNonDefault[0].id);
            } else if (defaultChat) {
               setCurrentChatId(defaultChat.id);
            }
         }

         console.log("autoDeleteInactiveChats: newChats =", newChats);
         return newChats;
      });
   }

   const [chats, setChats] = useState(() => [createDefaultChat()]);
   const [currentChatId, setCurrentChatId] = useState(null);
   const [isTyping, setIsTyping] = useState(false);
   const [categoryFilter, setCategoryFilter] = useState(null);
   const [locale, setLocale] = useState("ru");

   useEffect(() => {
      setChats((prevChats) =>
         prevChats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((message) =>
               message.text === chat.messages[0].text ? { ...message, text: t("chat.greeting") } : message
            ),
         }))
      );
   }, [i18n.language, t]);

   useEffect(() => {
      const currentLanguage = i18n.language === "қаз" ? "kz" : "ru";
      setLocale(currentLanguage);
   }, [i18n.language]);

   const updateLocale = (lang) => {
      const newLocale = lang === "қаз" ? "kz" : "ru";
      setLocale(newLocale);
      i18n.changeLanguage(lang);
   };

   const fetchChatHistory = async (chatId) => {
      try {
         const response = await api.get(`/conversation/by-id/${chatId}`);

         const formattedMessages = response.data.messages.map((message) => ({
            text: message.text,
            isUser: message.type === "user",
            isFeedback: false,
            isButton: false,
         }));

         let messagesWithFeedback = [];

         const savedFilePaths = getFilePaths(chatId);
         console.log("Saved file paths for chat", chatId, ":", savedFilePaths);

         let botIndex = 0;
         formattedMessages.forEach((message, index) => {
            if (!message.isUser) {
               // Получаем filePaths по индексу бота
               const paths = getFilePathByBotIndex(chatId, botIndex);
               console.log(`Bot message ${botIndex}, paths:`, paths);

               if (paths && paths.length > 0) {
                  message.filePaths = paths;
               }

               // Также проверяем сохраненные пути по индексу сообщения
               if (savedFilePaths[index] && savedFilePaths[index].length > 0) {
                  const existingPaths = message.filePaths || [];
                  const newPaths = Array.isArray(savedFilePaths[index])
                     ? savedFilePaths[index]
                     : [savedFilePaths[index]];

                  message.filePaths = [...new Set([...existingPaths, ...newPaths])];
               }

               botIndex++;
            }

            messagesWithFeedback.push(message);
         });

         if (hasBadFeedbackPrompt(chatId)) {
            messagesWithFeedback.push({
               text: t("feedback.badFeedbackPromptText"),
               isUser: false,
               isFeedback: false,
               badFeedbackPrompt: true,
            });
         }

         // Здесь добавляем флаг isAssistantResponse для подходящих сообщений
         messagesWithFeedback = messagesWithFeedback.map((message) => {
            // Если сообщение не от пользователя, не является фидбеком,
            // не имеет кастомных флагов (например, для регистрации)
            if (!message.isUser && !message.isFeedback && !message.badFeedbackPrompt && !message.isCustomMessage) {
               return { ...message, isAssistantResponse: true };
            }
            return message;
         });

         return {
            ...response.data,
            messages: messagesWithFeedback,
         };
      } catch (error) {
         console.error("Error fetching chat history:", error);
         throw error;
      }
   };

   const fetchMyChats = async () => {
      try {
         const response = await api.get(`/conversation/my`);
         return response.data;
      } catch (error) {
         console.error("Error fetching my chats:", error);
         throw error;
      }
   };

   useEffect(() => {
      const loadAndCleanChats = async () => {
         try {
            const myChats = await fetchMyChats();
            const filteredChats = myChats.filter((chat) => !isChatDeleted(chat.id));

            setChats((prevChats) => {
               const defaultChat = prevChats.find((c) => c.id === null);
               return [
                  defaultChat,
                  ...filteredChats.map((chat) => ({
                     ...createDefaultChat(),
                     id: chat.id,
                     title: chat.title,
                     isEmpty: false,
                  })),
               ];
            });
            // После загрузки чатов запускаем автоматическое удаление неактивных
            autoDeleteInactiveChats();
         } catch (error) {
            console.error("Error loading existing chats:", error);
         }
      };

      loadAndCleanChats();
   }, []);

   const fetchInitialMessages = async () => {
      // Проверяем, есть ли у нас уже загруженные категории
      if (categories.length > 0) {
         updateChatWithExistingCategories();
         return;
      }

      try {
         const res = await api.get(`/assistant/categories`);
         const fetchedCategories = res.data.categories;
         setCategories(fetchedCategories);
         setTranslationsKz(res.data.translations_kz || {});

         updateChatWithCategories(fetchedCategories);
      } catch (error) {
         console.error("Ошибка при загрузке начальных сообщений:", error);
      }
   };

   function deleteChat(chatId) {
      // Помечаем чат как удалённый в localStorage
      markChatAsDeleted(chatId);

      setChats((prevChats) => {
         // Фильтруем чаты, удаляя чат с данным chatId
         const newChats = prevChats.filter((chat) => String(chat.id) !== String(chatId));

         // Если удалённый чат был активным
         if (String(currentChatId) === String(chatId)) {
            if (newChats.length > 0) {
               // Переключаемся на самый новый чат (последний элемент массива)
               setCurrentChatId(newChats[newChats.length - 1].id);
            } else {
               // Если удалён последний чат, создаем новый пустой чат
               const newChat = createDefaultChat();
               newChats.push(newChat);
               setCurrentChatId(newChat.id);
            }
         }

         return newChats;
      });
   }

   const updateChatWithCategories = (fetchedCategories) => {
      setChats((prev) =>
         prev.map((chat) => {
            if (
               chat.isEmpty &&
               (String(chat.id) === String(currentChatId) || (chat.id === null && currentChatId === null))
            ) {
               return {
                  ...chat,
                  messages: [
                     chat.messages[0],
                     ...fetchedCategories.slice(0, 4).map((cat) => ({
                        text: locale === "ru" ? cat.name : translationsKz[cat.name] || cat.name,
                        isUser: true,
                        isFeedback: false,
                        isButton: true,
                        category: cat,
                     })),
                  ],
                  buttonsWereShown: true,
               };
            }
            return chat;
         })
      );
   };

   const updateChatWithExistingCategories = () => {
      setChats((prev) =>
         prev.map((chat) => {
            if (
               chat.isEmpty &&
               (String(chat.id) === String(currentChatId) || (chat.id === null && currentChatId === null))
            ) {
               const categoryButtons = categories.slice(0, 4).map((cat) => ({
                  text: locale === "ru" ? cat.name : translationsKz[cat.name] || cat.name,
                  isUser: true,
                  isFeedback: false,
                  isButton: true,
                  name: cat.name,
                  category: cat,
                  subcategories: cat.subcategories,
                  faq: cat.faq,
               }));

               return {
                  ...chat,
                  messages: [chat.messages[0], ...categoryButtons],
                  buttonsWereShown: true,
               };
            }
            return chat;
         })
      );
   };

   useEffect(() => {
      if (currentChatId === null) {
         if (currentSubcategory) {
            // Если есть выбранная подкатегория, показываем её reports
            handleButtonClick({
               ...currentSubcategory,
               subcategory: true,
               category: currentCategory,
            });
         } else if (currentCategory) {
            // Если есть только категория, показываем её содержимое
            handleButtonClick(currentCategory);
         } else if (categories.length > 0) {
            // Если ничего не выбрано, показываем начальные категории
            updateChatWithExistingCategories();
         }
      }
   }, [i18n.language]);

   // Обновляем useEffect для отслеживания переключения чатов
   useEffect(() => {
      const currentChat = chats.find(
         (c) => String(c.id) === String(currentChatId) || (c.id === null && currentChatId === null)
      );

      // Загружаем кнопки только если чат пустой и кнопки ещё не были загружены
      if (currentChat?.isEmpty && !currentChat.buttonsWereShown) {
         fetchInitialMessages();
      }
   }, [currentChatId]);

   const createNewChat = () => {
      setCurrentCategory(null);
      setCurrentSubcategory(null);
      setCategoryFilter(null);
      // Находим текущий чат
      const currentChat = chats.find((c) => String(c.id) === String(currentChatId));

      // Если мы в пустом чате - перезагружаем его состояние
      if (currentChat?.isEmpty) {
         setChats((prev) =>
            prev.map((chat) => {
               if (chat.isEmpty) {
                  return {
                     ...createDefaultChat(),
                     id: null,
                     isEmpty: true,
                     buttonsWereShown: false,
                  };
               }
               return chat;
            })
         );
         fetchInitialMessages(); // Добавляем явный вызов
         return;
      }

      // Находим существующий пустой чат
      const emptyChat = chats.find((c) => c.isEmpty);

      // Если есть пустой чат - переключаемся на него и перезагружаем кнопки
      if (emptyChat) {
         setCurrentChatId(null);
         setChats((prev) =>
            prev.map((chat) => {
               if (chat.isEmpty) {
                  return {
                     ...createDefaultChat(),
                     id: null,
                     isEmpty: true,
                     buttonsWereShown: false,
                  };
               }
               return chat;
            })
         );
         fetchInitialMessages(); // Добавляем явный вызов
         return;
      }

      // Если нет пустого чата - создаём новый
      const newChat = createDefaultChat();
      setChats((prev) => [...prev, newChat]);
      setCurrentChatId(null);
      fetchInitialMessages(); // Добавляем явный вызов
   };

   const switchChat = async (chatId) => {
      setCurrentCategory(null);
      setCurrentSubcategory(null);
      setCategoryFilter(null);
      if (String(chatId) === String(currentChatId)) {
         return;
      }

      try {
         if (chatId !== null) {
            const chatHistory = await fetchChatHistory(chatId);

            setChats((prevChats) =>
               prevChats.map((chat) => {
                  if (String(chat.id) === String(chatId)) {
                     return {
                        ...chat,
                        messages: [
                           // Сохраняем приветственное сообщение
                           chat.messages[0],
                           ...chatHistory.messages,
                        ],
                        title: chatHistory.title,
                        isEmpty: false,
                        showInitialButtons: false,
                        buttonsWereHidden: true,
                     };
                  }
                  return chat;
               })
            );
         }

         setCurrentChatId(chatId);
      } catch (error) {
         console.error("Error switching chat:", error);
      }
   };

   async function createMessage(text, isFeedback = false, additionalParams = {}) {
      if (!text) return;

      const currentChat = chats.find(
         (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
      );

      // Формируем параметры запроса
      const params = {
         prompt: text,
         locale,
         category: currentCategory?.name || null,
         subcategory: null, // Временно всегда null
         subcategory_report: null, // Временно всегда null
      };

      if (currentChat && currentChat.id) {
         params.conversation_id = currentChat.id;
      }

      setIsTyping(true);

      try {
         // Добавляем сообщение пользователя
         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  return {
                     ...chat,
                     isEmpty: false, // Устанавливаем, что чат больше не пустой
                     lastUpdated: new Date().toISOString(),
                     messages: [
                        ...chat.messages.filter((message) => !message.isButton),
                        {
                           text,
                           isUser: true,
                           isFeedback,
                        },
                     ],
                  };
               }
               return chat;
            })
         );

         const formatBotResponse = (text) => {
            // Не заменяем \n на <br />, а просто добавляем флаг
            return {
               text: text,
               hasLineBreaks: text.includes("\n"),
            };
         };

         // Отправляем запрос с новыми параметрами
         const res = await api.post(`/assistant/ask`, null, { params });

         // Получаем данные из ответа
         const conversationId = res.data.conversation_id;
         const conversationTitle = res.data.conversation_title;

         if (!currentChatId) {
            setCurrentChatId(conversationId);
         }

         const filePaths = res.data.paths || [];

         const formattedResponse = formatBotResponse(res.data.content);

         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const chatId = chat.id || conversationId;
                  const newBotMessageIndex = chat.messages.length;

                  let botCount = 0;
                  chat.messages.forEach((msg) => {
                     if (!msg.isUser && !msg.isFeedback) botCount++;
                  });
                  // Сохраняем filePath в localStorage, если он есть
                  if (filePaths.length > 0) {
                     filePaths.forEach((path, index) => {
                        saveFilePath(chatId, botCount, path);
                     });
                  }

                  const messages = [
                     ...chat.messages,
                     {
                        text: formattedResponse.text,
                        isUser: false,
                        isFeedback: false,
                        filePaths: filePaths,
                        hasLineBreaks: formattedResponse.hasLineBreaks,
                        isAssistantResponse: true,
                     },
                  ];

                  //if (!hasFeedback(chatId, newBotMessageIndex)) {
                  //   messages.push({
                  //      text: t("feedback.requestFeedback"),
                  //      isUser: false,
                  //      isFeedback: true,
                  //   });
                  //}

                  return {
                     ...chat,
                     id: chatId,
                     title: chat.title || conversationTitle,
                     isEmpty: false,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     messages,
                  };
               }
               return chat;
            })
         );
      } catch (error) {
         console.error("Детали ошибки:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            params: error.config?.params,
            url: error.config?.url,
         });

         const errorMessage = {
            text: t("chatError.errorMessage"),
            isUser: false,
            isFeedback,
         };

         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  return {
                     ...chat,
                     messages: [...chat.messages, errorMessage],
                  };
               }
               return chat;
            })
         );
      } finally {
         setIsTyping(false);
      }
   }

   const handleButtonClick = (selectedItem) => {
      console.log("Selected item:", selectedItem);

      // Set the current category
      const categoryData = selectedItem.category || selectedItem;
      setCategoryFilter(categoryData.name);
      setCurrentCategory(categoryData);

      // Show FAQ questions immediately after selecting a category
      if (categoryData.faq && categoryData.faq.length > 0) {
         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const faqButtons = categoryData.faq.map((faq) => ({
                     text:
                        locale === "ru"
                           ? faq.question
                           : (translationsKz && translationsKz[faq.question]) || faq.question,
                     isUser: true,
                     isFeedback: false,
                     isButton: true,
                     isFaq: true,
                     faqData: faq,
                  }));

                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     messages: [chat.messages[0], ...faqButtons],
                  };
               }
               return chat;
            })
         );
      } else {
         // If no FAQ is available, just hide the buttons
         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     // Keep only the welcome message, remove all buttons
                     messages: [chat.messages[0]],
                  };
               }
               return chat;
            })
         );
      }

      /* 
      // TEMPORARILY COMMENTED OUT - Subcategory handling
      if (selectedItem?.subcategories || selectedItem?.category?.subcategories) {
         const categoryData = selectedItem.category || selectedItem;
         setCategoryFilter(categoryData.name);
         setCurrentCategory(categoryData);

         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const subcategoryButtons = categoryData.subcategories.map((subcat) => ({
                     text:
                        locale === "ru" ? subcat.name : (translationsKz && translationsKz[subcat.name]) || subcat.name,
                     isUser: true,
                     isFeedback: false,
                     isButton: true,
                     isSubcategory: true,
                     name: subcat.name,
                     reports: subcat.reports,
                  }));

                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     messages: [chat.messages[0], ...subcategoryButtons],
                  };
               }
               return chat;
            })
         );
         return;
      }

      // TEMPORARILY COMMENTED OUT - Subcategory reports handling
      if (selectedItem?.isSubcategory && selectedItem?.reports) {
         setCurrentSubcategory(selectedItem);
         setCategoryFilter(selectedItem.name);

         setChats((prev) =>
            prev.map((chat) => {
               if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                  const reportButtons = selectedItem.reports.map((report) => ({
                     text: locale === "ru" ? report : (translationsKz && translationsKz[report]) || report,
                     isUser: true,
                     isFeedback: false,
                     isButton: true,
                     isReport: true,
                     reportText: report,
                  }));

                  return {
                     ...chat,
                     showInitialButtons: false,
                     buttonsWereHidden: true,
                     messages: [chat.messages[0], ...reportButtons],
                  };
               }
               return chat;
            })
         );
         return;
      }

      // TEMPORARILY COMMENTED OUT - Report handling
      if (selectedItem?.isReport) {
         if (currentCategory?.faq) {
            setChats((prev) =>
               prev.map((chat) => {
                  if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
                     const faqButtons = currentCategory.faq.map((faq) => ({
                        text:
                           locale === "ru"
                              ? faq.question
                              : (translationsKz && translationsKz[faq.question]) || faq.question,
                        isUser: true,
                        isFeedback: false,
                        isButton: true,
                        isFaq: true,
                        faqData: faq,
                        selectedReport: selectedItem.reportText,
                     }));

                     return {
                        ...chat,
                        showInitialButtons: false,
                        buttonsWereHidden: true,
                        messages: [chat.messages[0], ...faqButtons],
                     };
                  }
                  return chat;
               })
            );
         }
         return;
      }
      */

      // Handle FAQ question selection
      if (selectedItem?.isFaq) {
         createMessage(selectedItem.text, false, {
            category: currentCategory?.name,
            subcategory: null,
            subcategory_report: null,
         });
         return;
      }
   };

   const removeFeedbackMessage = (messageIndex) => {
      setChats((prevChats) =>
         prevChats.map((chat) => {
            if (chat.id === currentChatId || (chat.id === null && currentChatId === null)) {
               return {
                  ...chat,
                  messages: chat.messages.filter((msg, index) => {
                     // Если это сообщение фидбека для конкретного индекса - удаляем его
                     if (msg.isFeedback) {
                        const botMessageIndex = getBotMessageIndex(index, chat.messages);
                        return botMessageIndex !== messageIndex;
                     }
                     return true;
                  }),
               };
            }
            return chat;
         })
      );
   };

   const getBotMessageIndex = (currentIndex) => {
      const currentChat = chats.find(
         (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
      );

      if (!currentChat) return null;

      const messages = currentChat.messages;

      if (!messages[currentIndex]?.isFeedback) {
         return null;
      }

      // Пропускаем первое приветственное сообщение
      let messageCount = -1; // Начинаем с -1, чтобы первая пара начиналась с 0

      for (let i = 1; i < currentIndex; i++) {
         // Начинаем с 1, пропуская приветствие
         const message = messages[i];

         // Пропускаем фидбек сообщения
         if (message.isFeedback) {
            continue;
         }

         messageCount++;
      }

      // Возвращаем индекс бота (каждый второй индекс)
      return Math.floor(messageCount / 2) * 2 + 1;
   };

   const sendFeedback = async (rate, text, messageIndex) => {
      try {
         const currentChat = chats.find(
            (c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0])
         );
         if (!currentChat) throw new Error("Chat not found");

         const response = await api.post(`/conversation/by-id/${currentChat.id}/add-feedback`, {
            message_index: messageIndex,
            rate: rate,
            text: text,
         });

         // Сохраняем информацию об отправленном фидбеке
         saveFeedbackState(currentChat.id, messageIndex);

         // Удаляем сообщение с фидбеком из чата
         setTimeout(() => {
            removeFeedbackMessage(messageIndex);
         }, 0);

         // Если пользователь отправил плохой отзыв, добавляем сообщение для регистрации
         if (rate === "bad") {
            saveBadFeedbackPromptState(currentChat.id);
            setChats((prevChats) =>
               prevChats.map((chat) => {
                  if (String(chat.id) === String(currentChatId) || (chat.id === null && currentChatId === null)) {
                     return {
                        ...chat,
                        messages: [
                           ...chat.messages,
                           {
                              text: t("feedback.badFeedbackPromptText"), // "Для регистрации заполните форму ниже"
                              isUser: false,
                              isFeedback: false,
                              badFeedbackPrompt: true,
                              isCustomMessage: true,
                           },
                        ],
                     };
                  }
                  return chat;
               })
            );
         }

         return response.data;
      } catch (error) {
         console.error("Error sending feedback:", error);
         throw error;
      }
   };

   const addBotMessage = (text) => {
      setChats((prev) =>
         prev.map((chat) => {
            if (String(chat.id) === String(currentChatId) || (chat.id === null && chat === prev[0])) {
               return {
                  ...chat,
                  messages: [
                     ...chat.messages,
                     {
                        text,
                        isUser: false,
                        isFeedback: false,
                     },
                  ],
               };
            }
            return chat;
         })
      );
   };

   //const updateChatLastUpdated = (chatId, newDate) => {
   //   setChats((prevChats) =>
   //      prevChats.map((chat) => (String(chat.id) === String(chatId) ? { ...chat, lastUpdated: newDate } : chat))
   //   );
   //};

   //if (typeof window !== "undefined") {
   //   window.updateChatLastUpdated = updateChatLastUpdated;
   //}

   //и ещё для проверки удаления неактивных чатов нужно autoDeleteInactiveChats передать в sidebar и раскоментировать вызов внутри handleNewChat

   return (
      <ChatContext.Provider
         value={{
            chats,
            currentChatId,
            isTyping,
            createNewChat,
            switchChat,
            createMessage,
            handleButtonClick,
            sendFeedback,
            getBotMessageIndex,
            removeFeedbackMessage,
            showInitialButtons:
               chats.find((c) => String(c.id) === String(currentChatId) || (c.id === null && c === chats[0]))
                  ?.showInitialButtons || false,
            updateLocale,
            deleteChat,
            addBotMessage,
         }}
      >
         {children}
      </ChatContext.Provider>
   );
};

export { ChatContext, ChatProvider };
