import React, { useContext } from "react";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import { ChatContext } from "../../context/ChatContext";
import Header from "../Header/Header";
import "./ChatWindow.css";

export default function ChatWindow({ isSidebarOpen, toggleSidebar }) {
   //const { chats, currentChatId } = useContext(ChatContext);

   // Находим текущий чат или дефолтный (нулевой)
   //const currentChat = chats.find((c) => c.id === currentChatId) || chats[0];
   //const isEmptyChat = currentChat.isEmpty && currentChat.messages.length <= 5;

   // Если чат пустой (нет реальных сообщений от пользователя)
   //if (isEmptyChat) {
   //   return (
   //      <div className="chat-window chat-window-start flex flex-col h-full items-center justify-center">
   //         <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

   //         <MessageInput />

   //         <MessageList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
   //      </div>
   //   );
   //}

   // Иначе рендерим «стандартную» верстку
   return (
      <div className="chat-window flex flex-col h-full">
         <MessageList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
         <MessageInput />
      </div>
   );
}
