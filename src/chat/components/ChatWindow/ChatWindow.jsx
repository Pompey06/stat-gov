import React, { useContext, useState, useEffect, useMemo } from "react";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import BinModal from "../ChatWindow/Modal/BinModal";
import { ChatContext } from "../../context/ChatContext";
import Header from "../Header/Header";
import "./ChatWindow.css";
import chatI18n from "../../i18n";
import { useTranslation } from "react-i18next";
import RegistrationModal from "../ChatWindow/Modal/RegistrationModal.jsx";
import personImage from "../../assets/person.png";
import personVideo from "../../assets/person.webm";
import botImage from "../../assets/bot-avatar.png";

export default function ChatWindow({ isSidebarOpen, toggleSidebar }) {
  const { i18n } = useTranslation(undefined, { i18n: chatI18n });
  const {
    chats,
    currentChatId,
    updateLocale,
    addBotMessage,
    setIsInBinFlow,
    fetchFormsByBin,
    setIsTyping,
    setChats,
  } = useContext(ChatContext);

  const { t } = useTranslation(undefined, { i18n: chatI18n });
  const [isBinModalOpen, setBinModalOpen] = useState(false);
  const currentChat = chats.find((c) => c.id === currentChatId) || chats[0];
  const isEmptyChat = currentChat.isEmpty;
  const { createMessage } = useContext(ChatContext);
  const currentLang = i18n.language;
  const showSpecialButton = import.meta.env.VITE_SHOW_SPECIAL_BUTTON === "true";
  const showAvatar = import.meta.env.VITE_SHOW_AVATAR === "true";
  const useAltGreeting = import.meta.env.VITE_USE_ALT_GREETING === "true";
  const [isRegistrationModalOpen, setRegistrationModalOpen] = useState(false);
  const feedbackFormUrl = "https://forms.gle/dDhLCDBYSQZRMuD87";
  const watermarkText = t("chat.watermarkText");

  const watermarkBackground = useMemo(() => {
    const [firstLine = "", ...restLines] = watermarkText.split(" ");
    const secondLine = restLines.join(" ");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="140" viewBox="0 0 220 140">
        <g transform="translate(56 76) rotate(-35)">
          <rect x="42" y="-28" width="12" height="12" fill="none" stroke="#6d7f98" stroke-width="1" opacity="0.45" transform="rotate(45 48 -22)" />
          <text x="48" y="-19" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#6d7f98" opacity="0.45">!</text>
          <text x="48" y="-2" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6d7f98" opacity="0.4">
            <tspan x="48" dy="0">${firstLine}</tspan>
            ${secondLine ? `<tspan x="48" dy="14">${secondLine}</tspan>` : ""}
          </text>
        </g>
      </svg>
    `;
    return `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}")`;
  }, [watermarkText]);

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

  const handleBinSubmit = async (bin, year) => {
    setBinModalOpen(false);
    setIsInBinFlow(true);

    setChats((prev) =>
      prev.map((chat) => {
        const isCurrent =
          String(chat.id) === String(currentChatId) ||
          (chat.id === null && currentChatId === null);
        return isCurrent ? { ...chat, isBinChat: true } : chat;
      }),
    );

    setChats((prev) =>
      prev.map((chat) => {
        const isCurrent =
          String(chat.id) === String(currentChatId) ||
          (chat.id === null && currentChatId === null);
        if (!isCurrent) return chat;
        return {
          ...chat,
          isEmpty: false,
          messages: chat.messages.filter((msg) => !msg.isButton),
        };
      }),
    );

    addBotMessage(t("binModal.foundForms", { bin }));
    setIsTyping(true);

    try {
      const forms = await fetchFormsByBin(bin, year);

      setChats((prev) =>
        prev.map((chat) => {
          const isCurrent =
            String(chat.id) === String(currentChatId) ||
            (chat.id === null && currentChatId === null);
          if (!isCurrent) return chat;

          const msgs = [...chat.messages];
          const lastIdx = msgs.length - 1;
          msgs[lastIdx] = {
            ...msgs[lastIdx],
            attachments: forms,
            runnerBin: bin,
          };
          return { ...chat, messages: msgs, isBinChat: true };
        }),
      );
    } catch (err) {
      console.error(err);
      addBotMessage("Ошибка при получении перечня форм. Попробуйте позже.");
    } finally {
      setIsTyping(false);
    }
  };

  const renderAltGreetingDescription = () => (
    <div className="chat-greeting-description">
      {t("chat.greetingAltDescription")}
      <a
        className="chat-greeting-description__link"
        href={feedbackFormUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("chat.greetingAltDescriptionLink")}
      </a>
      {t("chat.greetingAltDescriptionAfterLink")}
    </div>
  );

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

            {showSpecialButton && (
              <div className="special-button-container">
                <button
                  className="btn special"
                  onClick={() => setBinModalOpen(true)}
                >
                  {t("binModal.specialFormsButton")}
                </button>
              </div>
            )}

            <MessageList
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />

            <div className="registration-button-container">
              <button
                className="btn special"
                onClick={() => setRegistrationModalOpen(true)}
              >
                {t("feedback.openRegistrationForm")}
              </button>
            </div>

            <BinModal
              isOpen={isBinModalOpen}
              onClose={() => setBinModalOpen(false)}
              onSubmitBin={handleBinSubmit}
              createMessage={createMessage}
            />

            <RegistrationModal
              isOpen={isRegistrationModalOpen}
              onClose={() => setRegistrationModalOpen(false)}
              title={t("feedback.registrationTitle")}
              currentChatId={currentChatId}
              addBotMessage={addBotMessage}
              sendSuccessMessageToChat={false}
            />
          </div>
        ) : (
          <>
            <div className="flex language">
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

            {showSpecialButton && (
              <div className="special-button-container">
                <button
                  className="btn special"
                  onClick={() => setBinModalOpen(true)}
                >
                  {t("binModal.specialFormsButton")}
                </button>
              </div>
            )}

            <MessageList
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />

            <div className="registration-button-container">
              <button
                className="btn special"
                onClick={() => setRegistrationModalOpen(true)}
              >
                {t("feedback.openRegistrationForm")}
              </button>
            </div>

            <BinModal
              isOpen={isBinModalOpen}
              onClose={() => setBinModalOpen(false)}
              onSubmitBin={handleBinSubmit}
              createMessage={createMessage}
            />

            <RegistrationModal
              isOpen={isRegistrationModalOpen}
              onClose={() => setRegistrationModalOpen(false)}
              title={t("feedback.registrationTitle")}
              currentChatId={currentChatId}
              addBotMessage={addBotMessage}
              sendSuccessMessageToChat={false}
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
