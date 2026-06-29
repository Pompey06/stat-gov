// Sidebar.jsx

import "./Sidebar.css";
import React, { useState, useEffect, useContext } from "react";
import newBurgerIcon from "../../assets/newBurgerIcon.svg";
import logo from "../../assets/logo.png";
import newPlusIcon from "../../assets/newPlusIcon.svg";
import SidebarButton from "../SidebarButton/SidebarButton";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../context/ChatContext";
import chatI18n from "../../i18n";
import DeleteChatModal from "../ChatWindow/Modal/DeleteChatModal";
import SearchChatsModal from "./SearchChatsModal";

export default function Sidebar({
   isSidebarOpen,
   toggleSidebar,
   showSpecialButton,
   onOpenSpecialForms,
   onOpenRegistration,
}) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
   const [chatToDelete, setChatToDelete] = useState(null);
   const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

   const { chats, currentChatId, createNewChat, switchChat, deleteChat } =
      useContext(ChatContext);

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth < 700);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   const handleNewChat = () => {
      createNewChat();
      if (isMobile) toggleSidebar();
   };

   const handleSpecialFormsClick = () => {
      onOpenSpecialForms();
      if (isMobile) toggleSidebar();
   };

   const handleRegistrationClick = () => {
      onOpenRegistration();
      if (isMobile) toggleSidebar();
   };

   const handleSearchClick = () => {
      setIsSearchModalOpen(true);
   };

   const handleCloseSearchModal = () => {
      setIsSearchModalOpen(false);
   };

   const openDeleteModal = (chatId) => setChatToDelete(chatId);
   const closeDeleteModal = () => setChatToDelete(null);
   const confirmDeleteChat = () => {
      if (chatToDelete) deleteChat(chatToDelete);
   };

   const handleSwitchChat = (chatId) => {
      switchChat(chatId);
      if (isMobile) toggleSidebar();
   };

   const formatChatDate = (dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (d1, d2) =>
         d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();

      if (isSameDay(date, today)) return t("sidebar.today");
      if (isSameDay(date, yesterday)) return t("sidebar.yesterday");

      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
   };

   const sortedChats = chats
      .filter((chat) => chat.id !== null)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

   const groupedChats = sortedChats.reduce((groups, chat) => {
      const key = formatChatDate(chat.lastUpdated);
      if (!groups[key]) groups[key] = [];
      groups[key].push(chat);
      return groups;
   }, {});

   const renderChatButton = (chat) => (
      <SidebarButton
         key={chat.id}
         text={chat.title || t("sidebar.newChat")}
         icon={
            <svg
               xmlns="http://www.w3.org/2000/svg"
               className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors"
               viewBox="0 0 482.428 482.429"
               fill="currentColor"
               onClick={(event) => {
                  event.stopPropagation();
                  openDeleteModal(chat.id);
               }}
            >
               <path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828C436.274,82.527,411.551,57.799,381.163,57.799z" />
            </svg>
         }
         onClick={() => handleSwitchChat(chat.id)}
         className={`py-2 px-4 rounded-md ${
            chat.id === currentChatId
               ? "bg-gray-300 text-black _active"
               : "bg-white text-gray-600"
         }`}
      />
   );

   return (
      <div
         className={`sidebar overflow-hidden flex xl:p-8 flex-col ${
            isSidebarOpen
               ? "sidebar--close p-8"
               : "xl:min-w-96 p-3 py-[32px] min-w-[248px]"
         }`}
      >
         <div className="sidebar__top flex justify-between items-start gap-2.5">
            <img src={logo} alt="logo" className="sidebar__logo" />
            <p className="logo__text">{t("logo.text")}</p>
            <img
               onClick={toggleSidebar}
               src={newBurgerIcon}
               className="sidebar__icon self-end cursor-pointer"
               alt={t("sidebar.close")}
            />
         </div>

         <div className="sidebar__actions flex flex-col gap-2.5 mt-16">
            <SidebarButton
               key="new-chat"
               text={t("sidebar.newChat")}
               icon={
                  <img
                     src={newPlusIcon}
                     alt={t("sidebar.newChat")}
                     className="w-5 h-5"
                  />
               }
               onClick={handleNewChat}
               className="bg-white sidebar__button--primary"
            />

            {showSpecialButton && (
               <SidebarButton
                  key="special-forms"
                  text={t("binModal.specialFormsButton")}
                  icon={
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                     >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M8 13h8" />
                        <path d="M8 17h8" />
                        <path d="M8 9h2" />
                     </svg>
                  }
                  onClick={handleSpecialFormsClick}
                  className="bg-white sidebar__button--primary"
               />
            )}

            <SidebarButton
               key="registration"
               text={t("feedback.openRegistrationForm")}
               icon={
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     className="w-5 h-5"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     aria-hidden="true"
                  >
                     <path d="M12 20h9" />
                     <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
               }
               onClick={handleRegistrationClick}
               className="bg-white sidebar__button--primary"
            />

            <SidebarButton
               key="search-chats"
               text={t("sidebar.searchPlaceholder")}
               icon={
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     className="w-5 h-5"
                     viewBox="0 0 24 24"
                     fill="currentColor"
                     aria-hidden="true"
                  >
                     <path d="M10 2a8 8 0 1 0 4.906 14.32l4.387 4.387 1.414-1.414-4.387-4.387A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12a6 6 0 0 1 0-12Z" />
                  </svg>
               }
               onClick={handleSearchClick}
               className="bg-white sidebar__button--primary"
            />
         </div>

         <div className="sidebar__history flex flex-col gap-2.5 mt-8">
            {Object.keys(groupedChats)
               .sort((a, b) => {
                  const maxA = Math.max(
                     ...groupedChats[a].map((chat) => new Date(chat.lastUpdated)),
                  );
                  const maxB = Math.max(
                     ...groupedChats[b].map((chat) => new Date(chat.lastUpdated)),
                  );
                  return maxB - maxA;
               })
               .map((groupKey) => (
                  <div key={groupKey} className="flex flex-col gap-[10px]">
                     <div className="sidebar__group-heading text-sm font-bold">
                        {groupKey}
                     </div>
                     {groupedChats[groupKey].map(renderChatButton)}
                  </div>
               ))}
         </div>

         <DeleteChatModal
            isOpen={!!chatToDelete}
            onClose={closeDeleteModal}
            onConfirm={confirmDeleteChat}
         />

         <SearchChatsModal
            isOpen={isSearchModalOpen}
            onClose={handleCloseSearchModal}
         />

         <div className="mt-4 sidebar__warning p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm leading-tight rounded-r shadow-sm">
            {t("sidebar.warning")}
         </div>
      </div>
   );
}
