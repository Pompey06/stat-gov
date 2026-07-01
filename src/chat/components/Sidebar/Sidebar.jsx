import React, { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import chatI18n from "../../i18n";
import { ChatContext } from "../../context/ChatContext";
import SidebarButton from "../SidebarButton/SidebarButton";
import SearchChatsModal from "./SearchChatsModal";
import DeleteChatModal from "../ChatWindow/Modal/DeleteChatModal";
import logo from "../../assets/logo.png";
import newBurgerIcon from "../../assets/newBurgerIcon.svg";
import newPlusIcon from "../../assets/newPlusIcon.svg";
import "./Sidebar.css";

const PINNED_CHATS_STORAGE_KEY = "chatSidebarPinnedIds";

const getStoredPinnedChats = () => {
   if (typeof window === "undefined") {
      return [];
   }

   try {
      const rawValue = window.localStorage.getItem(PINNED_CHATS_STORAGE_KEY);
      const parsedValue = rawValue ? JSON.parse(rawValue) : [];
      return Array.isArray(parsedValue)
         ? parsedValue.map((value) => String(value))
         : [];
   } catch (error) {
      console.error("Failed to read pinned chats:", error);
      return [];
   }
};

function SearchIcon({ className = "" }) {
   return (
      <svg
         className={className}
         width="18"
         height="18"
         viewBox="0 0 18 18"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <path
            d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M15.75 15.75L12.4875 12.4875"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

function PenIcon({ className = "" }) {
   return (
      <svg
         className={className}
         width="18"
         height="18"
         viewBox="0 0 18 18"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <path
            d="M11.8947 2.72741C12.1018 2.52026 12.3832 2.4039 12.6762 2.4039C12.9691 2.4039 13.2506 2.52026 13.4577 2.72741L15.2726 4.54232C15.4797 4.74946 15.5961 5.03091 15.5961 5.32385C15.5961 5.61679 15.4797 5.89824 15.2726 6.10538L6.15691 15.221L2.25 15.75L2.77896 11.8431L11.8947 2.72741Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M10.5 4.125L13.875 7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

function DocumentIcon({ className = "" }) {
   return (
      <svg
         className={className}
         width="18"
         height="18"
         viewBox="0 0 18 18"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <path
            d="M5.25 2.25H9.75L13.5 6V15C13.5 15.4142 13.1642 15.75 12.75 15.75H5.25C4.83579 15.75 4.5 15.4142 4.5 15V3C4.5 2.58579 4.83579 2.25 5.25 2.25Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9.75 2.25V6H13.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M6.75 9H11.25"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
         />
         <path
            d="M6.75 11.625H11.25"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
         />
      </svg>
   );
}

function TrashIcon({ className = "" }) {
   return (
      <svg
         className={className}
         width="16"
         height="16"
         viewBox="0 0 16 16"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <path
            d="M2.5 4H13.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
         />
         <path
            d="M6.5 2.5H9.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
         />
         <path
            d="M4 4L4.6 12.1C4.66 12.92 5.34 13.55 6.16 13.55H9.84C10.66 13.55 11.34 12.92 11.4 12.1L12 4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M6.75 6.5V11"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
         />
         <path
            d="M9.25 6.5V11"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
         />
      </svg>
   );
}

function PinIcon({ className = "" }) {
   return (
      <svg
         className={className}
         width="16"
         height="16"
         viewBox="0 0 16 16"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <path
            d="M10.8334 2.66675L13.3334 5.16675L10.8334 6.00008V9.16675L8.50008 11.5001V13.3334L7.50008 12.3334L6.50008 13.3334V11.5001L4.16675 9.16675V6.00008L1.66675 5.16675L4.16675 2.66675H10.8334Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

function DotsIcon({ className = "" }) {
   return (
      <svg
         className={className}
         width="16"
         height="16"
         viewBox="0 0 16 16"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <circle cx="3" cy="8" r="1.25" fill="currentColor" />
         <circle cx="8" cy="8" r="1.25" fill="currentColor" />
         <circle cx="13" cy="8" r="1.25" fill="currentColor" />
      </svg>
   );
}

export default function Sidebar({
   isSidebarOpen,
   toggleSidebar,
   showSpecialButton,
   onOpenSpecialForms,
   onOpenRegistration,
}) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const {
      chats,
      currentChatId,
      createNewChat,
      switchChat,
      deleteChat,
      deleteAllChats,
   } = useContext(ChatContext);

   const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
   const [menuChatId, setMenuChatId] = useState(null);
   const [pinnedChatIds, setPinnedChatIds] = useState(getStoredPinnedChats);
   const [deleteState, setDeleteState] = useState({
      isOpen: false,
      mode: "single",
      chatId: null,
   });

   useEffect(() => {
      if (typeof window === "undefined") {
         return;
      }

      window.localStorage.setItem(
         PINNED_CHATS_STORAGE_KEY,
         JSON.stringify(pinnedChatIds),
      );
   }, [pinnedChatIds]);

   const historyChats = useMemo(
      () =>
         chats
            .filter((chat) => chat.id !== null)
            .sort(
               (left, right) =>
                  new Date(right.lastUpdated || 0) -
                  new Date(left.lastUpdated || 0),
            ),
      [chats],
   );

   useEffect(() => {
      const availableIds = new Set(historyChats.map((chat) => String(chat.id)));

      setPinnedChatIds((prev) => {
         const next = prev.filter((chatId) => availableIds.has(chatId));
         return next.length === prev.length ? prev : next;
      });
   }, [historyChats]);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (!event.target.closest(".sidebar__chat-menu-wrapper")) {
            setMenuChatId(null);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const closeSidebarOnMobile = () => {
      if (
         typeof window !== "undefined" &&
         window.matchMedia("(max-width: 700px)").matches &&
         isSidebarOpen
      ) {
         toggleSidebar();
      }
   };

   const handleNewChat = () => {
      createNewChat();
      setMenuChatId(null);
      closeSidebarOnMobile();
   };

   const handleSwitchChat = async (chatId) => {
      setMenuChatId(null);
      await switchChat(chatId);
      closeSidebarOnMobile();
   };

   const handleTogglePin = (chatId) => {
      const normalizedId = String(chatId);

      setPinnedChatIds((prev) =>
         prev.includes(normalizedId)
            ? prev.filter((id) => id !== normalizedId)
            : [normalizedId, ...prev],
      );

      setMenuChatId(null);
   };

   const handleOpenDeleteChat = (chatId) => {
      setDeleteState({
         isOpen: true,
         mode: "single",
         chatId,
      });
      setMenuChatId(null);
   };

   const handleOpenDeleteAllChats = () => {
      setDeleteState({
         isOpen: true,
         mode: "all",
         chatId: null,
      });
      setMenuChatId(null);
   };

   const handleCloseDeleteModal = () => {
      setDeleteState({
         isOpen: false,
         mode: "single",
         chatId: null,
      });
   };

   const handleConfirmDelete = async () => {
      if (deleteState.mode === "all") {
         await deleteAllChats();
         setPinnedChatIds([]);
         return;
      }

      if (deleteState.chatId == null) {
         return;
      }

      await deleteChat(deleteState.chatId);
      setPinnedChatIds((prev) =>
         prev.filter((chatId) => chatId !== String(deleteState.chatId)),
      );
   };

   const pinnedChats = pinnedChatIds
      .map((pinnedId) =>
         historyChats.find((chat) => String(chat.id) === String(pinnedId)),
      )
      .filter(Boolean);

   const regularChats = historyChats.filter(
      (chat) => !pinnedChatIds.includes(String(chat.id)),
   );

   const renderChatItem = (chat) => {
      const normalizedId = String(chat.id);
      const isPinned = pinnedChatIds.includes(normalizedId);
      const isActive = String(currentChatId) === normalizedId;

      return (
         <div
            key={normalizedId}
            className={`sidebar__chat-item ${
               isActive ? "sidebar__chat-item--active" : ""
            }`}
         >
            <button
               type="button"
               className="sidebar__chat-main"
               onClick={() => handleSwitchChat(chat.id)}
            >
               <span className="sidebar__chat-title">
                  {chat.title || t("sidebar.previousRequest")}
               </span>
            </button>

            <div className="sidebar__chat-menu-wrapper">
               <button
                  type="button"
                  className="sidebar__chat-menu-trigger"
                  aria-label={t("sidebar.chatActions")}
                  title={t("sidebar.chatActions")}
                  onClick={(event) => {
                     event.stopPropagation();
                     setMenuChatId((prev) =>
                        prev === normalizedId ? null : normalizedId,
                     );
                  }}
               >
                  <DotsIcon />
               </button>

               {menuChatId === normalizedId && (
                  <div className="sidebar__chat-menu">
                     <button
                        type="button"
                        className="sidebar__chat-menu-button"
                        onClick={() => handleTogglePin(chat.id)}
                     >
                        <PinIcon />
                        <span>
                           {isPinned
                              ? t("sidebar.unpinChat")
                              : t("sidebar.pinChat")}
                        </span>
                     </button>

                     <button
                        type="button"
                        className="sidebar__chat-menu-button sidebar__chat-menu-button--danger"
                        onClick={() => handleOpenDeleteChat(chat.id)}
                     >
                        <TrashIcon />
                        <span>{t("deleteChatModal.confirm")}</span>
                     </button>
                  </div>
               )}
            </div>
         </div>
      );
   };

   return (
      <>
         <aside
            className={`sidebar flex h-full flex-col px-[26px] pb-7 pt-7 ${
               isSidebarOpen ? "sidebar--close" : ""
            }`}
         >
            <div className="sidebar__top mb-10 flex justify-between gap-3">
               <div className="sidebar__logo flex items-start gap-3">
                  <img
                     src={logo}
                     alt="QazStat"
                     className="max-h-[58px] w-auto object-contain"
                  />
                  <div className="logo__text max-w-[180px]">
                     {t("logo.text")}
                  </div>
               </div>

               <img
                  src={newBurgerIcon}
                  alt={t("sidebar.close")}
                  className="sidebar__icon"
                  onClick={toggleSidebar}
               />
            </div>

            <div className="sidebar__actions">
               <SidebarButton
                  text={t("sidebar.newChat")}
                  icon={
                     <img
                        src={newPlusIcon}
                        alt=""
                        className="sidebar__button-icon"
                     />
                  }
                  className="sidebar__button--primary"
                  onClick={handleNewChat}
               />

               {showSpecialButton && (
                  <SidebarButton
                     text={t("binModal.specialFormsButton")}
                     icon={<DocumentIcon className="sidebar__button-svg-icon" />}
                     className="sidebar__button--primary mt-2"
                     onClick={onOpenSpecialForms}
                  />
               )}

               <SidebarButton
                  text={t("feedback.openRegistrationForm")}
                  icon={<PenIcon className="sidebar__button-svg-icon" />}
                  className="sidebar__button--primary mt-2"
                  onClick={onOpenRegistration}
               />

               <SidebarButton
                  text={t("sidebar.searchTitle")}
                  icon={<SearchIcon className="sidebar__button-svg-icon" />}
                  className="sidebar__button--primary mt-2"
                  onClick={() => {
                     setMenuChatId(null);
                     setIsSearchModalOpen(true);
                  }}
               />

               <SidebarButton
                  text={t("sidebar.clearHistory")}
                  icon={<TrashIcon className="sidebar__button-svg-icon" />}
                  className="sidebar__button--danger mt-2"
                  onClick={handleOpenDeleteAllChats}
               />
            </div>

            <div className="sidebar__bottom">
               <div className="sidebar__history">
                  {pinnedChats.length > 0 && (
                     <section className="sidebar__section">
                        <div className="sidebar__section-title">
                           {t("sidebar.pinnedChats")}
                        </div>
                        <div className="sidebar__chat-list">
                           {pinnedChats.map(renderChatItem)}
                        </div>
                     </section>
                  )}

                  <section className="sidebar__section">
                     <div className="sidebar__section-title">
                        {t("sidebar.recentRequests")}
                     </div>

                     {regularChats.length > 0 ? (
                        <div className="sidebar__chat-list">
                           {regularChats.map(renderChatItem)}
                        </div>
                     ) : (
                        <div className="sidebar__history-empty">
                           {t("sidebar.searchEmpty")}
                        </div>
                     )}
                  </section>
               </div>

               <div className="sidebar__warning rounded-[8px] border border-[#E7D9A8] bg-[#FFF9E8] px-4 py-3 text-[14px] leading-[1.3] text-[#BC6A00]">
                  {t("sidebar.warning")}
               </div>
            </div>
         </aside>

         <SearchChatsModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
         />

         <DeleteChatModal
            isOpen={deleteState.isOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            title={
               deleteState.mode === "all"
                  ? t("deleteChatModal.clearAllTitle")
                  : t("deleteChatModal.title")
            }
            message={
               deleteState.mode === "all"
                  ? t("deleteChatModal.clearAllMessage")
                  : t("deleteChatModal.message")
            }
            confirmText={
               deleteState.mode === "all"
                  ? t("deleteChatModal.clearAllConfirm")
                  : t("deleteChatModal.confirm")
            }
         />
      </>
   );
}
