import "./Sidebar.css";
import React, { useState, useEffect, useContext } from "react";
import newBurgerIcon from "../../assets/newBurgerIcon.svg";
import logo from "../../assets/logo.png";
import newPlusIcon from "../../assets/newPlusIcon.svg";
import newPreviousChat from "../../assets/previousChat.svg";
import SidebarButton from "../SidebarButton/SidebarButton";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../context/ChatContext";
import chatI18n from "../../i18n";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
   const { chats, currentChatId, createNewChat, switchChat } = useContext(ChatContext);

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth < 700);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   const handleNewChat = () => {
      createNewChat();
      if (isMobile) {
         toggleSidebar();
      }
   };

   const handleSwitchChat = (chatId) => {
      switchChat(chatId);
      if (isMobile) {
         toggleSidebar();
      }
   };

   return (
      <div
         className={`sidebar overflow-hidden flex xl:p-8 flex-col ${
            isSidebarOpen ? "sidebar--close p-8" : "xl:min-w-96 p-3 py-[32px] min-w-[248px]"
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

         {/* Убираем условие рендеринга, теперь управляем через CSS */}
         <div className="sidebar__buttons flex justify-start flex-col gap-2.5 mt-16">
            {[
               {
                  id: "new-chat",
                  text: t("sidebar.newChat"),
                  icon: <img src={newPlusIcon} alt={t("sidebar.newChat")} className="w-5 h-5" />,
                  onClick: handleNewChat,
                  className: "bg-white",
               },
               ...chats
                  .slice()
                  .reverse()
                  .map((chat, index) => ({
                     id: chat.id,
                     text: chat.title || t("sidebar.newChat"),
                     // Вместо newPreviousChat вставляем SVG-код корзины
                     icon: (
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           className="w-[18px] h-[18px] text-gray-600 hover:text-red-500 transition-colors"
                           viewBox="0 0 482.428 482.429"
                           fill="currentColor"
                        >
                           <g>
                              <g>
                                 <path
                                    d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098
                              c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117
                              h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828
                              C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879
                              C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096
                              c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266
                              c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979
                              V115.744z"
                                 />
                                 <path
                                    d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07
                              c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"
                                 />
                                 <path
                                    d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07
                              c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"
                                 />
                                 <path
                                    d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07
                              c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"
                                 />
                              </g>
                           </g>
                        </svg>
                     ),
                     onClick: () => handleSwitchChat(chat.id),
                     className: `py-2 px-4 rounded-md ${
                        chat.id === currentChatId ? "bg-gray-300 text-black _active" : "bg-white text-gray-600"
                     }`,
                  })),
            ].map((button) => (
               <SidebarButton
                  key={button.id}
                  text={button.text}
                  icon={button.icon}
                  onClick={button.onClick}
                  className={button.className}
               />
            ))}
         </div>

         <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm leading-tight rounded-r shadow-sm">
            {t("sidebar.warning")}
         </div>
      </div>
   );
}
