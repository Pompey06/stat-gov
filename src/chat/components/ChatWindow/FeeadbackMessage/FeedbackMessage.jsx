// src/components/FeedbackMessage/FeedbackMessage.jsx

import React, { useState, useContext, useCallback } from "react";
import { ChatContext } from "../../../context/ChatContext";
import FeedbackModal from "../Modal/FeedbackModal";
import "./FeedbackMessage.css";

import badIcon from "../../../assets/bad.svg";
import goodIcon from "../../../assets/good.svg";
import goodIconFilled from "../../../assets/filled_like.svg";
import badIconFilled from "../../../assets/filled_dislike.svg";

import { useTranslation } from "react-i18next";
import chatI18n from "../../../i18n";

export default function FeedbackMessage({ messageIndex }) {
   const { currentChatId, sendFeedback } = useContext(ChatContext);
   const { t } = useTranslation(undefined, { i18n: chatI18n });

   // Состояние «лайка» и «дизлайка»
   const [isLiked, setIsLiked] = useState(false);
   const [isDisliked, setIsDisliked] = useState(false);

   // Состояния для тултипов
   const [hideGoodTooltip, setHideGoodTooltip] = useState(true);
   const [hideBadTooltip, setHideBadTooltip] = useState(true);

   // Какая модалка открыта (“good” или “bad”)
   const [modalType, setModalType] = useState(null);
   const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);

   const openModal = (type) => {
      setSelectedMessageIndex(messageIndex);
      setModalType(type);
   };

   const closeModal = () => {
      setModalType(null);
      setSelectedMessageIndex(null);
   };

   // Обработчик для «лайка»
   const handleGoodFeedback = async () => {
      if (isLiked) {
         // Уже залайкано — ничего не делаем
         return;
      }
      try {
         setIsLiked(true);
         setHideGoodTooltip(true);
         await sendFeedback("good", "", messageIndex);
      } catch (error) {
         console.error("Ошибка при отправке хорошего отзыва:", error);
         // При необходимости: setIsLiked(false);
      }
   };

   // Обработчик сабмита «дизлайка» (из модалки)
   const handleFeedbackSubmit = useCallback(
      async (text) => {
         if (isDisliked) {
            // Уже дизлайкано — игнорируем
            return;
         }
         try {
            await sendFeedback("bad", text, messageIndex);
            setIsDisliked(true);
            setHideBadTooltip(true);
            closeModal();
         } catch (error) {
            console.error("Ошибка при отправке плохого отзыва:", error);
         }
      },
      [sendFeedback, messageIndex, isDisliked]
   );

   return (
      <div className="feedback-message message mb-8 bg-white flex font-light flex-col items-start">
         <div className="flex gap-[4px] feedback-message__btns">
            {/* ======== Кнопка «Лайк» ======== */}
            {!isDisliked && (
               <button
                  type="button"
                  className={`
              feedback-button 
              items-center 
              flex 
              gap-[8px] 
              bg-transparent 
              text-black 
              ${hideGoodTooltip ? "tooltip-hide" : ""} 
              ${isLiked ? "feedback-button--disabled" : ""}
            `}
                  style={{ touchAction: "manipulation", position: "relative" }}
                  aria-label={t("feedback.goodAlt")}
                  onMouseEnter={() => setHideGoodTooltip(false)}
                  onMouseLeave={() => setHideGoodTooltip(true)}
                  onClick={handleGoodFeedback}
               >
                  {isLiked ? (
                     <img src={goodIconFilled} alt={t("feedback.goodAlt")} />
                  ) : (
                     <img src={goodIcon} alt={t("feedback.goodAlt")} />
                  )}
                  <span className="tooltip">{t("feedback.goodAlt")}</span>
               </button>
            )}

            {/* ======== Кнопка «Дизлайк» ======== */}
            {!isLiked && (
               <button
                  type="button"
                  className={`
              feedback-button 
              items-center 
              flex 
              gap-[8px] 
              bg-transparent 
              text-black 
              ${hideBadTooltip ? "tooltip-hide" : ""} 
              ${isDisliked ? "feedback-button--disabled" : ""}
            `}
                  style={{ touchAction: "manipulation", position: "relative" }}
                  aria-label={t("feedback.badAlt")}
                  onMouseEnter={() => setHideBadTooltip(false)}
                  onMouseLeave={() => setHideBadTooltip(true)}
                  onClick={() => {
                     if (!isDisliked) {
                        openModal("bad");
                     }
                  }}
               >
                  {isDisliked ? (
                     <img src={badIconFilled} alt={t("feedback.badAlt")} />
                  ) : (
                     <img src={badIcon} alt={t("feedback.badAlt")} />
                  )}
                  <span className="tooltip">{t("feedback.badAlt")}</span>
               </button>
            )}
         </div>

         {/* ======== Модалки ======== */}
         <FeedbackModal
            isOpen={modalType === "good"}
            onClose={closeModal}
            title={t("feedback.goodModalTitle")}
            description={t("feedback.goodModalDescription")}
            onSubmit={handleFeedbackSubmit}
            feedbackType="good"
            messageIndex={selectedMessageIndex}
         />

         <FeedbackModal
            isOpen={modalType === "bad"}
            onClose={closeModal}
            title={t("feedback.badModalTitle")}
            description={t("feedback.badModalDescription")}
            onSubmit={handleFeedbackSubmit}
            feedbackType="bad"
            messageIndex={selectedMessageIndex}
         />
      </div>
   );
}
