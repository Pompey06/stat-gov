import React, { useContext, useState, useEffect } from "react";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import { ChatContext } from "../../context/ChatContext";
import Header from "../Header/Header";
import "./ChatWindow.css";
import chatI18n from "../../i18n";
import { useTranslation } from "react-i18next";
import botImage from "../../assets/bot-avatar.png";

const RU_LANGUAGE = "\u0440\u0443\u0441";
const KZ_LANGUAGE = "\u049b\u0430\u0437";
const EN_LANGUAGE = "eng";
const normalizeChatLanguage = (lang) =>
  lang === "en" ? EN_LANGUAGE : lang;

export default function ChatWindow({ isSidebarOpen, toggleSidebar }) {
  const { i18n } = useTranslation(undefined, { i18n: chatI18n });
  const {
    chats,
    currentChatId,
    updateLocale,
  } = useContext(ChatContext);

  const { t } = useTranslation(undefined, { i18n: chatI18n });
  const currentChat = chats.find((c) => c.id === currentChatId) || chats[0];
  const isEmptyChat = currentChat.isEmpty;
  const currentLang = normalizeChatLanguage(i18n.language);
  const showAvatar = import.meta.env.VITE_SHOW_AVATAR === "true";
  const useAltGreeting = import.meta.env.VITE_USE_ALT_GREETING === "true";
  const languageOptions = [KZ_LANGUAGE, RU_LANGUAGE, EN_LANGUAGE];

  const handleLanguageChange = (lang) => {
    updateLocale(lang);
  };

  // Хук для отслеживания ширины экрана ≤ 700px
  const [isSmall, setIsSmall] = useState(
    () => window.matchMedia("(max-width: 700px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const handler = (e) => setIsSmall(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isEmptyChat) {
    return (
      <div className="chat-window chat-window--watermark chat-window-start flex flex-col h-full items-center justify-center">
        {/* <div
          className="chat-window__watermark"
          style={{ backgroundImage: watermarkBackground }}
          aria-hidden="true"
        /> */}
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {isSmall ? (
          <div className="responsive-wrapper">
            {/* <div className="flex language">
              <button
                className={`language__button rounded ${
                  currentLang === "қаз"
                    ? "bg-blue text-white"
                    : "bg-gray color-blue"
                }`}
                onClick={() => handleLanguageChange("қаз")}
              >
                қаз
              </button>
              <button
                className={`language__button rounded ${
                  currentLang === "рус"
                    ? "bg-blue text-white"
                    : "bg-gray color-blue"
                }`}
                onClick={() => handleLanguageChange("рус")}
              >
                рус
              </button>
            </div> */}

            <div
              className={
                `person__wrapper` +
                (useAltGreeting ? ` person__wrapper--alt` : ``)
              }
            >
              {showAvatar && (
                // <video
                //   src={personVideo}
                //   className="person"
                //   autoPlay
                //   loop
                //   muted
                //   playsInline
                // />
                <img src={botImage} alt="person" className="person" />
              )}

              <div
                className={
                  `chat-window-start__content` +
                  (useAltGreeting ? ` chat-window-start__content--alt` : ``)
                }
              >
                {useAltGreeting ? (
                  <>
                    <div className="chat-greeting-title">
                      {t("chat.greetingAltTitle")}
                    </div>
                    {/* {renderAltGreetingDescription()} */}
                  </>
                ) : (
                  t("chat.greeting")
                )}
              </div>
            </div>

            <MessageInput />

            <MessageList
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />

          </div>
        ) : (
          <>
            <div className="flex language">
              {languageOptions.map((lang) => (
                <button
                  key={lang}
                  className={`language__button rounded ${
                    currentLang === lang
                      ? "bg-blue text-white"
                      : "bg-gray color-blue"
                  }`}
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="person__wrapper">
              {showAvatar && (
                // <video
                //   src={personVideo}
                //   className="person"
                //   autoPlay
                //   loop
                //   muted
                //   playsInline
                // />
                <img src={botImage} alt="person" className="person" />
              )}

              <div
                className={
                  `chat-window-start__content` +
                  (useAltGreeting ? ` chat-window-start__content--alt` : ``)
                }
              >
                {useAltGreeting ? (
                  <>
                    <div className="chat-greeting-title">
                      {t("chat.greetingAltTitle")}
                    </div>
                    {/* {renderAltGreetingDescription()} */}
                  </>
                ) : (
                  t("chat.greeting")
                )}
              </div>
            </div>

            <MessageInput />

            <MessageList
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />

          </>
        )}
      </div>
    );
  }

  return (
    <div className="chat-window chat-window--watermark flex flex-col h-full">
      {/* <div
        className="chat-window__watermark"
        style={{ backgroundImage: watermarkBackground }}
        aria-hidden="true"
      /> */}
      <MessageList
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <MessageInput />
    </div>
  );
}
