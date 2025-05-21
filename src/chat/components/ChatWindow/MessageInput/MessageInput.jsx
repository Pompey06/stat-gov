import React, { useContext, useState, useEffect } from "react";
import "./MessageInput.css";
//import newSendIcon from "../../../assets/newSendIcon.svg";
import sendIcon from "../../../assets/send.png";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../../context/ChatContext";
import chatI18n from "../../../i18n";

export default function MessageInput() {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const { inputPrefill, setInputPrefill, createMessage } = useContext(ChatContext);
   const [message, setMessage] = useState(inputPrefill);

   const handleSend = async () => {
      // Если нет сообщения, можно дополнительно сделать проверку, не отправлять пустую строку
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
      // Проверяем, что нажата клавиша Enter
      if (e.key === "Enter") {
         handleSend();
      }
   };

   return (
      <div className="bottom__wrapper">
         <div className="message-input-container">
            <div className="message-input mt-auto font-light bg-white flex items-center gap-2">
               <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown} // Добавили обработчик onKeyDown
                  placeholder={t("messageInput.placeholder")}
                  className="flex-1 p-2 border rounded-lg"
               />
            </div>
            <button onClick={handleSend} className="">
               <img className="send-icon" src={sendIcon} alt={t("messageInput.sendIconAlt")} />
            </button>
         </div>
         <div className="ai__text">{t("messageInput.text")}</div>
      </div>
   );
}
