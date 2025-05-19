import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import { useTranslation } from "react-i18next";
import chatI18n from "../../../i18n";

export default function BinModal({ isOpen, onClose, onSubmitBin, createMessage }) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const currentYear = new Date().getFullYear();
   const years = [currentYear - 2, currentYear - 1, currentYear];

   const [bin, setBin] = useState("");
   const [year, setYear] = useState(currentYear);
   const [error, setError] = useState("");

   const handleConfirm = () => {
      const trimmed = bin.trim();
      if (/^\d{12}$/.test(trimmed)) {
         setError("");
         onSubmitBin(trimmed, year); // ← передаём и bin, и год
         setBin("");
         setYear(currentYear);
         onClose();
      } else {
         setError(t("binModal.invalidBin"));
      }
   };

   const handleCancel = () => {
      setBin("");
      setYear(currentYear);
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
            className={`registration-input w-full mb-2 ${error ? "border-2 border-red-500 ring-2 ring-red-500" : ""}`}
         />

         <div className="relative w-full mb-4">
            <select
               value={year}
               onChange={(e) => setYear(Number(e.target.value))}
               className={`registration-input w-full pr-6 ${
                  error ? "border-2 border-red-500 ring-2 ring-red-500" : ""
               }`}
            >
               {years.map((y) => (
                  <option key={y} value={y}>
                     {y}
                  </option>
               ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path
                     d="M1 1L6 6L11 1"
                     stroke="#4B5563"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </svg>
            </span>
         </div>

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
