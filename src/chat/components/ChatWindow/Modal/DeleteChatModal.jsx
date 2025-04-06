// DeleteChatModal.jsx
import React from "react";
import { BaseModal } from "./BaseModal";
import { useTranslation } from "react-i18next";

export default function DeleteChatModal({ isOpen, onClose, onConfirm }) {
   const { t } = useTranslation();

   const handleConfirm = () => {
      onConfirm();
      onClose();
   };

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={t("deleteChatModal.title")}
         modalClassName="delete-chat-modal"
      >
         <p className="font-light text-base/6 mb-3">{t("deleteChatModal.message")}</p>
         <div className="mt-6 flex justify-end gap-2">
            <button
               type="button"
               className="cancel__button bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
               onClick={onClose}
            >
               {t("deleteChatModal.cancel")}
            </button>
            <button
               type="button"
               className="confirm__button bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
               onClick={handleConfirm}
            >
               {t("deleteChatModal.confirm")}
            </button>
         </div>
      </BaseModal>
   );
}
