import React, { useState, useContext, useCallback } from "react";
import { ChatContext } from "../../../context/ChatContext";
import FeedbackModal from "../Modal/FeedbackModal";
import "./Feedbackmessage.css";
import badIcon from "../../../assets/bad.svg";
//import badIconHover from "../../../assets/bad-white.svg";
import goodIcon from "../../../assets/good.svg";
//import goodIconHover from "../../../assets/good-white.svg";
import { useTranslation } from "react-i18next";
import { hasFeedback } from "../../../utils/feedbackStorage";
import chatI18n from "../../../i18n";

export default function FeedbackMessage({ messageIndex }) {
   const { currentChatId, sendFeedback } = useContext(ChatContext);
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const [modalType, setModalType] = useState(null);
   //const [hoveredButton, setHoveredButton] = useState(null);
   const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);

   const feedbackExists = hasFeedback(currentChatId, messageIndex);

   const openModal = (type) => {
      setSelectedMessageIndex(messageIndex);
      setModalType(type);
   };

   const closeModal = () => {
      setModalType(null);
      setSelectedMessageIndex(null);
   };

   const handleGoodFeedback = async () => {
      try {
         await sendFeedback("good", "", messageIndex);
      } catch (error) {
         console.error("Ошибка при отправке хорошего отзыва:", error);
      }
   };

   const handleFeedbackSubmit = useCallback(
      async (text) => {
         try {
            await sendFeedback(modalType, text, messageIndex);
            closeModal();
         } catch (error) {
            console.error("Error submitting feedback:", error);
         }
      },
      [sendFeedback, modalType, messageIndex]
   );

   return (
      <div className="feedback-message message mb-8 bg-white flex font-light flex-col items-start">
         {!feedbackExists && (
            <>
               {/*<p className="text-black text-[12px] mb-2">{t("feedback.requestFeedback")}</p>*/}

               <div className="flex gap-[6px] feedback-message__btns">
                  <button
                     type="button"
                     className="feedback-button items-center flex gap-[8px] bg-transparent text-black"
                     style={{ touchAction: "manipulation" }}
                     onClick={handleGoodFeedback} // 👍 отправляем сразу
                  >
                     <img src={goodIcon} alt={t("feedback.goodAlt")} />
                  </button>

                  <button
                     type="button"
                     className="feedback-button items-center flex gap-[8px] bg-transparent text-black"
                     style={{ touchAction: "manipulation" }}
                     onClick={() => openModal("bad")} // 👎 остаётся с модалкой
                  >
                     <img src={badIcon} alt={t("feedback.badAlt")} />
                  </button>
               </div>

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
            </>
         )}
      </div>
   );
}
