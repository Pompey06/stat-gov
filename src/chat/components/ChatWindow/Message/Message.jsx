import React, { useState } from "react";
import axios from "axios";
import downloadIcon from "../../../assets/pdf.svg";
import "./Message.css";
import { useTranslation } from "react-i18next";
import chatI18n from "../../../i18n";
import FeedbackMessage from "../FeeadbackMessage/FeedbackMessage";

export default function Message({
   text,
   isUser,
   isButton,
   onClick,
   filePath,
   filePaths,
   isGreeting,
   botMessageIndex,
   isHtml,
   isCustomMessage = false,
   isAssistantResponse = false, // новый флаг для ответов от assistant/ask
}) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
   });

   const allFilePaths = React.useMemo(() => {
      if (filePaths && Array.isArray(filePaths)) {
         return filePaths.filter((path) => typeof path === "string");
      } else if (filePath) {
         return typeof filePath === "string"
            ? [filePath]
            : Array.isArray(filePath)
            ? filePath.filter((path) => typeof path === "string")
            : [];
      }
      return [];
   }, [filePath, filePaths]);

   function renderTextWithLineBreaks(text) {
      if (!text) return null;
      return text.split("\n").map((line, index, array) => (
         <React.Fragment key={index}>
            {linkifyText(line)}
            {index < array.length - 1 && <br />}
         </React.Fragment>
      ));
   }

   function linkifyText(text) {
      if (!text) return null;
      const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s]+?)([),.?!]+)?(\s|$)/g;
      const elements = [];
      let lastIndex = 0;
      let match;
      while ((match = combinedRegex.exec(text)) !== null) {
         if (match.index > lastIndex) {
            elements.push(text.substring(lastIndex, match.index));
         }
         if (match[1]) {
            const linkText = match[2];
            const url = match[3];
            elements.push(
               <a
                  key={`md-${match.index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message-link"
               >
                  {linkText}
               </a>
            );
         } else {
            const url = match[4];
            const trailing = match[5] || "";
            const space = match[6] || "";
            elements.push(
               <a
                  key={`url-${match.index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message-link"
               >
                  {url}
               </a>
            );
            elements.push(trailing + space);
         }
         lastIndex = combinedRegex.lastIndex;
      }
      if (lastIndex < text.length) {
         elements.push(text.substring(lastIndex));
      }
      return elements;
   }

   const hasLineBreaks = !isUser && text && text.includes("\n");

   const handleDownload = async (e, path) => {
      e.preventDefault();
      if (!path || typeof path !== "string") {
         console.error("Invalid file path:", path);
         return;
      }
      try {
         const response = await api.get(`/knowledge/get-file`, {
            params: { path: path },
            responseType: "blob",
         });
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement("a");
         link.href = url;
         const fileName = path.split("/").pop() || "file";
         link.setAttribute("download", fileName);
         document.body.appendChild(link);
         link.click();
         link.remove();
      } catch (error) {
         console.error("Ошибка загрузки файла:", error);
      }
   };

   const getFileName = (path) => {
      if (!path || typeof path !== "string") return "file";
      try {
         return path.split("/").pop() || "file";
      } catch (error) {
         console.error("Error getting file name:", error);
         return "file";
      }
   };

   const [copied, setCopied] = useState(false);
   const handleCopy = (e) => {
      e.stopPropagation();
      navigator.clipboard
         .writeText(text)
         .then(() => {
            setCopied(true);
            console.log("Текст скопирован в буфер обмена");
            setTimeout(() => {
               setCopied(false);
            }, 1500);
         })
         .catch((err) => {
            console.error("Ошибка при копировании текста:", err);
         });
   };

   return (
      <div
         className={`message mb-6 bg-white flex font-light ${
            isUser
               ? "user text-right self-end text-white"
               : `text-left ai text-black self-start relative ${!isGreeting ? "bot-response" : ""}`
         } ${
            isButton
               ? "cursor-pointer hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
               : ""
         }`}
         onClick={isButton ? onClick : undefined}
      >
         {/* Рендерим копировать-кнопку и FeedbackMessage только для сообщений с ответом бота от assistant/ask */}
         {!isUser && !isGreeting && !isCustomMessage && isAssistantResponse && Number.isInteger(botMessageIndex) && (
            <button
               className="copy-button absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-200 transition-colors"
               onClick={handleCopy}
               title={t("copyButton.copy")}
            >
               {copied ? (
                  <>
                     <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon-check"
                     >
                        <path
                           d="M20.285 6.709a1 1 0 00-1.414 0L9 16.58l-3.871-3.87a1 1 0 10-1.414 1.414l4.578 4.578a1 1 0 001.414 0l10.578-10.578a1 1 0 000-1.414z"
                           fill="currentColor"
                        />
                     </svg>
                     <span>{t("copyButton.copied")}</span>
                  </>
               ) : (
                  <>
                     <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon-xs"
                     >
                        <path
                           fillRule="evenodd"
                           clipRule="evenodd"
                           d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                           fill="currentColor"
                        ></path>
                     </svg>
                     <span>{t("copyButton.copy")}</span>
                  </>
               )}
            </button>
         )}
         <div>
            {hasLineBreaks ? renderTextWithLineBreaks(text) : linkifyText(text)}
            {allFilePaths.length > 0 && (
               <div className="mt-2">
                  <div className="sources-label">{t("chat.sources")}</div>
                  <div className="file-download-container">
                     {allFilePaths.map((path, index) => {
                        if (!path || typeof path !== "string") return null;
                        const fileName = getFileName(path);
                        return (
                           <div key={index} className="file-item">
                              <a href="#" onClick={(e) => handleDownload(e, path)} className="file-download-link">
                                 <img src={downloadIcon} alt="Download file" className="file-icon" />
                                 <span className="file-name">{fileName}</span>
                              </a>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
         {/* Рендерим FeedbackMessage только для ответов бота, созданных через assistant/ask */}
         {!isUser && !isGreeting && !isCustomMessage && isAssistantResponse && Number.isInteger(botMessageIndex) && (
            <FeedbackMessage messageIndex={botMessageIndex} />
         )}
      </div>
   );
}
