import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Message from "../Message/Message";
import FeedbackMessage from "../FeeadbackMessage/FeedbackMessage";
import BadFeedbackRegistrationMessage from "../BadFeedbackRegistrationMessage/BadFeedbackRegistrationMessage";
import Header from "../../Header/Header";
import Sidebar from "../../Sidebar/Sidebar";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../../context/ChatContext";
import "./MessageList.css";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import chatI18n from "../../../i18n";

function FormsIcon() {
   return (
      <svg
         width="36"
         height="36"
         viewBox="0 0 36 36"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <rect x="7" y="4.5" width="22" height="27" rx="4" stroke="currentColor" strokeWidth="1.8" />
         <path d="M13 12H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M13 17.5H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M13 23H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M10.5 11.5L11.6 12.7L13 10.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
         <path d="M10.5 17L11.6 18.2L13 16.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
         <path d="M10.5 22.5L11.6 23.7L13 21.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   );
}

function StatsSearchIcon() {
   return (
      <svg
         width="36"
         height="36"
         viewBox="0 0 36 36"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <circle cx="15.5" cy="15.5" r="9.5" stroke="currentColor" strokeWidth="1.8" />
         <path d="M22.5 22.5L30 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M11.5 19V15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M15.5 19V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M19.5 19V13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M9.5 19H21.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
   );
}

function OkedSearchIcon() {
   return (
      <svg
         width="36"
         height="36"
         viewBox="0 0 36 36"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <path
            d="M10 5.5H21L26 10.5V28.5C26 30.1569 24.6569 31.5 23 31.5H10C8.34315 31.5 7 30.1569 7 28.5V8.5C7 6.84315 8.34315 5.5 10 5.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
         />
         <path d="M21 5.5V10.5H26" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
         <path d="M11.5 15H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <path d="M11.5 19H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <circle cx="23.5" cy="23.5" r="4.5" stroke="currentColor" strokeWidth="1.8" />
         <path d="M27 27L30 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
   );
}

function SupportIcon() {
   return (
      <svg
         width="36"
         height="36"
         viewBox="0 0 36 36"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <path
            d="M10 18V15.5C10 11.0817 13.5817 7.5 18 7.5C22.4183 7.5 26 11.0817 26 15.5V18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
         />
         <rect x="7" y="17" width="5.5" height="9.5" rx="2.75" stroke="currentColor" strokeWidth="1.8" />
         <rect x="23.5" y="17" width="5.5" height="9.5" rx="2.75" stroke="currentColor" strokeWidth="1.8" />
         <path d="M12.5 24.5C13.9 26.7 15.8 27.8 18.5 27.8H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
         <rect x="21.5" y="26.3" width="6" height="3.7" rx="1.85" stroke="currentColor" strokeWidth="1.6" />
      </svg>
   );
}

function getDirectionIcon(text, index) {
   if (index === 0) {
      return <FormsIcon />;
   }

   if (index === 1) {
      return <StatsSearchIcon />;
   }

   if (index === 2) {
      return <OkedSearchIcon />;
   }

   if (index === 3) {
      return <SupportIcon />;
   }

   const normalizedText = String(text || "").toLocaleLowerCase();

   if (
      normalizedText.includes("форм") ||
      normalizedText.includes("нысан") ||
      normalizedText.includes("submit")
   ) {
      return <FormsIcon />;
   }

   if (
      normalizedText.includes("окэд") ||
      normalizedText.includes("эсжжә") ||
      normalizedText.includes("oked")
   ) {
      return <OkedSearchIcon />;
   }

   if (
      normalizedText.includes("поддерж") ||
      normalizedText.includes("қолдау") ||
      normalizedText.includes("support")
   ) {
      return <SupportIcon />;
   }

   return <StatsSearchIcon />;
}

export default function MessageList({ isSidebarOpen, toggleSidebar }) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const {
      chats,
      currentChatId,
      getBotMessageIndex,
      isTyping,
      handleButtonClick,
      showInitialButtons,
      chatSearchFocus,
      clearChatSearchFocus,
   } = useContext(ChatContext);

   const currentChat = useMemo(
      () =>
         chats.find(
            (chat) =>
               (currentChatId === null && chat.id === null) ||
               chat.id === currentChatId,
         ),
      [chats, currentChatId],
   );

   const messages = useMemo(() => currentChat?.messages || [], [currentChat]);

   const scrollTargetRef = useRef(null);
   useEffect(() => {
      if (scrollTargetRef.current) {
         scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
      }
   }, [messages]);

   useEffect(() => {
      if (!chatSearchFocus) return;
      if (String(chatSearchFocus.chatId) !== String(currentChatId)) return;

      const targetId = `chat-message-${String(currentChatId)}-${chatSearchFocus.renderedMessageIndex}`;
      const targetNode = document.getElementById(targetId);

      if (!targetNode) return;

      targetNode.scrollIntoView({ behavior: "smooth", block: "center" });
      targetNode.classList.remove("message--search-hit");
      void targetNode.offsetWidth;
      targetNode.classList.add("message--search-hit");

      const timeoutId = window.setTimeout(() => {
         targetNode.classList.remove("message--search-hit");
         clearChatSearchFocus();
      }, 2200);

      return () => window.clearTimeout(timeoutId);
   }, [messages, currentChatId, chatSearchFocus, clearChatSearchFocus]);

   const useWindowWidth = () => {
      const [windowWidth, setWindowWidth] = useState(window.innerWidth);
      useEffect(() => {
         const handleResize = () => setWindowWidth(window.innerWidth);
         window.addEventListener("resize", handleResize);
         return () => window.removeEventListener("resize", handleResize);
      }, []);
      return windowWidth;
   };

   const windowWidth = useWindowWidth();

   const initialDirectionButtons = useMemo(
      () =>
         showInitialButtons
            ? messages.filter(
                 (message, index) =>
                    index > 0 &&
                    message.isButton &&
                    !message.isSubcategory &&
                    !message.isReport &&
                    !message.isFaq,
              )
            : [],
      [messages, showInitialButtons],
   );

   const showInitialDirections =
      Boolean(currentChat?.isEmpty) && initialDirectionButtons.length > 0;

   let botCount = 0;
   const renderedMessages = messages.map((message, index) => {
      if (
         showInitialButtons &&
         index > 0 &&
         message.isButton &&
         !message.isSubcategory &&
         !message.isReport &&
         !message.isFaq
      ) {
         return null;
      }

      if (message.isGreeting && currentChat.isEmpty) {
         return null;
      }

      if (message.isFeedback) {
         const botMessageIndex = getBotMessageIndex(index);
         return (
            <FeedbackMessage
               key={index}
               text={message.text}
               messageIndex={botMessageIndex}
            />
         );
      }

      if (message.badFeedbackPrompt) {
         return (
            <BadFeedbackRegistrationMessage
               key={index}
               currentChatId={currentChatId}
            />
         );
      }

      let feedbackIndex;
      if (!message.isUser && !message.isGreeting) {
         botCount += 1;
         feedbackIndex = botCount * 2 - 1;
      }

      return (
         <Message
            key={index}
            text={message.text}
            isUser={message.isUser}
            isButton={message.isButton}
            onClick={
               message.isButton ? () => handleButtonClick(message) : undefined
            }
            filePath={message.filePath}
            filePaths={message.filePaths}
            isGreeting={message.isGreeting}
            botMessageIndex={feedbackIndex}
            isHtml={!message.isUser}
            isCustomMessage={message.isCustomMessage}
            isAssistantResponse={message.isAssistantResponse || false}
            streaming={message.streaming || false}
            attachments={message.attachments}
            runnerBin={message.runnerBin}
            messageDomId={`chat-message-${String(currentChatId)}-${index}`}
         >
            {index === 0 &&
               messages.some((msg) => msg.isButton && msg.isSubcategory) && (
                  <div className="suggestion-text mt-4">
                     {t("chat.interestingSuggestion")}
                  </div>
               )}
            {index === 0 &&
               messages.some((msg) => msg.isButton && msg.isReport) && (
                  <div className="suggestion-text mt-4">
                     {t("chat.interestingSuggestion")}
                  </div>
               )}
            {index === 0 &&
               messages.some((msg) => msg.isButton && msg.isFaq) && (
                  <div className="suggestion-text mt-4">
                     {t("chat.interestingSuggestion")}
                  </div>
               )}
         </Message>
      );
   });

   return (
      <div className="relative">
         <Header
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
         />
         {windowWidth < 700 && (
            <Sidebar
               isSidebarOpen={isSidebarOpen}
               toggleSidebar={toggleSidebar}
            />
         )}
         <div className="overflow-y-auto message-list-wrap">
            <div className="message-list justify-end flex flex-col">
               {showInitialDirections && (
                  <div className="message-list__directions message-list__directions--standalone">
                     <div className="direction-cards" role="list">
                        {initialDirectionButtons.map((button, buttonIndex) => (
                           <button
                              key={`${button.text}-${buttonIndex}`}
                              type="button"
                              className="direction-card"
                              onClick={() => handleButtonClick(button)}
                           >
                              <span className="direction-card__icon">
                                 {getDirectionIcon(button.text, buttonIndex)}
                              </span>
                              <span className="direction-card__label">
                                 {button.text}
                              </span>
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {renderedMessages}
               {isTyping && (
                  <TypingIndicator text={t("chatTyping.typingMessage")} />
               )}
               <div ref={scrollTargetRef}></div>
            </div>
         </div>
      </div>
   );
}
