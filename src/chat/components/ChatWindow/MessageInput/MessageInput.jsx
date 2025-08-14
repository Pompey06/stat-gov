import React, { useContext, useState, useEffect } from "react";
import "./MessageInput.css";
import sendIcon from "../../../assets/send.png";
import microphoneIcon from "../../../assets/microphone.svg";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../../context/ChatContext";
import chatI18n from "../../../i18n";

export default function MessageInput() {
  const { t } = useTranslation(undefined, { i18n: chatI18n });
  const { inputPrefill, setInputPrefill, createMessage } =
    useContext(ChatContext);
  const [message, setMessage] = useState(inputPrefill);
  const useAltGreeting = import.meta.env.VITE_USE_ALT_GREETING === "true";

  // состояние для тултипа микрофона
  const [hideMicTooltip, setHideMicTooltip] = useState(true);

  const handleSend = async () => {
    if (!message.trim()) return;
    createMessage(message);
    setInputPrefill("");
    console.log(t("messageInput.sentMessage"), message);
    setMessage("");
  };

  useEffect(() => {
    setMessage(inputPrefill);
  }, [inputPrefill]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleMicClick = () => {
    console.log("🎤 Dictation feature triggered");
    // тут потом можно добавить реальную логику записи голоса
  };

  return (
    <div className="bottom__wrapper">
      <div className="message-input-container">
        <div className="message-input mt-auto font-light bg-white flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("messageInput.placeholder")}
            className="flex-1 p-2 border rounded-lg"
          />
        </div>

        {/* Кнопка микрофона */}
        <button
          type="button"
          className={`copy-button flex items-center gap-1 text-sm text-gray-500 transition-colors ${
            hideMicTooltip ? "tooltip-hide" : ""
          }`}
          style={{ touchAction: "manipulation", position: "relative" }}
          aria-label={t("messageInput.micTooltip")}
          onMouseEnter={() => setHideMicTooltip(false)}
          onMouseLeave={() => setHideMicTooltip(true)}
          onClick={(e) => {
            e.preventDefault();
            handleMicClick();
            setHideMicTooltip(true);
          }}
          onTouchEnd={(e) => {
            handleMicClick();
            setHideMicTooltip(true);
          }}
        >
          <img
            src={microphoneIcon}
            alt={t("messageInput.micTooltip")}
            className="icon-s"
          />
          <span className="tooltip">{t("messageInput.micTooltip")}</span>
        </button>

        {/* Кнопка отправки */}
        <button onClick={handleSend} className="">
          <img
            className="send-icon"
            src={sendIcon}
            alt={t("messageInput.sendIconAlt")}
          />
        </button>
      </div>

      <div className={`ai__text` + (useAltGreeting ? ` ai__text--alt` : ``)}>
        {t(useAltGreeting ? "messageInput.textAlt" : "messageInput.text")}
      </div>
    </div>
  );
}
