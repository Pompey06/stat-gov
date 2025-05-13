// Внутри ChatWindow.jsx, замените блок с кнопкой переключения языка на точную копию из Sidebar:

import React, { useContext } from "react";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import { ChatContext } from "../../context/ChatContext";
import Header from "../Header/Header";
import "./ChatWindow.css";
import chatI18n from "../../i18n";
import { useTranslation } from "react-i18next";

export default function ChatWindow({ isSidebarOpen, toggleSidebar }) {
   const { i18n } = useTranslation(undefined, { i18n: chatI18n });
   const { chats, currentChatId, locale, updateLocale } = useContext(ChatContext);
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const currentChat = chats.find((c) => c.id === currentChatId) || chats[0];
   const isEmptyChat = currentChat.isEmpty && currentChat.messages.length <= 5;

   const currentLang = i18n.language;

   const handleLanguageChange = (lang) => {
      updateLocale(lang);
   };

   if (isEmptyChat) {
      return (
         <div className="chat-window chat-window-start flex flex-col h-full items-center justify-center">
            <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex language">
               <button
                  className={`language__button rounded ${
                     currentLang === "қаз" ? "bg-blue text-white" : "bg-gray color-blue"
                  }`}
                  onClick={() => handleLanguageChange("қаз")}
               >
                  қаз
               </button>
               <button
                  className={`language__button rounded ${
                     currentLang === "русc" ? "bg-blue text-white" : "bg-gray color-blue"
                  }`}
                  onClick={() => handleLanguageChange("русc")}
               >
                  русc
               </button>
            </div>

            <div className="chat-window-start__content">{t("chat.greeting")}</div>

            <MessageInput />

            <MessageList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
         </div>
      );
   }

   return (
      <div className="chat-window flex flex-col h-full">
         <MessageList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
         <MessageInput />
      </div>
   );
}
