import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import { useTranslation } from "react-i18next";
import chatI18n from "../../../i18n";

export default function BinModal({ isOpen, onClose, onSubmitBin, createMessage }) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const [bin, setBin] = useState("");
   const [error, setError] = useState("");

   const handleConfirm = () => {
      const trimmed = bin.trim();
      if (/^\d{12}$/.test(trimmed)) {
         setError("");
         onSubmitBin(trimmed);
         setBin("");
         onClose();
      } else {
         setError(t("binModal.invalidBin"));
      }
   };

   const handleCancel = () => {
      setBin("");
      setError("");
      onClose();
   };

   return (
      <BaseModal isOpen={isOpen} onClose={handleCancel} title={t("binModal.title")} modalClassName="bin-modal">
         <input
            type="text"
            value={bin}
            onChange={(e) => {
               setBin(e.target.value);
               if (error) setError("");
            }}
            placeholder="БИН"
            className={`registration-input w-full mb-4 ${error ? "border-1 border-red-500 ring-1 ring-red-500" : ""}`}
         />

         {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

         <div className="mt-6 flex justify-end gap-2">
            <button
               type="button"
               className="cancel__button bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
               onClick={handleCancel}
            >
               {t("binModal.cancel")}
            </button>
            <button
               type="button"
               className="confirm__button bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
               onClick={handleConfirm}
            >
               {t("binModal.submit")}
            </button>
         </div>
      </BaseModal>
   );
}
