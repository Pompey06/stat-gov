// src/components/BadFeedbackRegistrationMessage/BadFeedbackRegistrationMessage.jsx

import React, { useState, useContext } from "react";
import RegistrationModal from "../Modal/RegistrationModal";
import { useTranslation } from "react-i18next";
import "./BadFeedbackRegistrationMessage.css";
import { ChatContext } from "../../../context/ChatContext";
import chatI18n from "../../../i18n";
import personImage from "../../../assets/person.png";

export default function BadFeedbackRegistrationMessage({ currentChatId }) {
   const { addBotMessage } = useContext(ChatContext);
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const showAvatar = import.meta.env.VITE_SHOW_AVATAR === "true";

   const openModal = () => {
      setIsModalOpen(true);
   };
   const closeModal = () => {
      setIsModalOpen(false);
   };

   const handleSubmit = (formData) => {
      // Здесь можно обработать данные формы (например, отправить их на API)
      closeModal();
   };

   return (
      <div className="message mb-8 flex font-light self-start">
         {/* 1) Аватарка бота слева (за пределами «пузыря») */}
         {showAvatar && <img src={personImage} alt="" className="bot-avatar" />}

         {/* 2) «Пузырь» с текстом и кнопкой (используем прежний класс .ai) */}
         <div className="bubble ai bg-white text-left">
            <p className="bad-feedback-text">{t("feedback.badFeedbackPromptText")}</p>
            <button className="bad-feedback-button" onClick={openModal}>
               {t("feedback.openRegistrationForm")}
            </button>
            <RegistrationModal
               isOpen={isModalOpen}
               onClose={closeModal}
               title="Регистрация заявки"
               description={t("feedback.registrationFormDescription")}
               onSubmit={handleSubmit}
               feedbackType="badRegistration"
               currentChatId={currentChatId}
               addBotMessage={addBotMessage}
            />
         </div>
      </div>
   );
}
