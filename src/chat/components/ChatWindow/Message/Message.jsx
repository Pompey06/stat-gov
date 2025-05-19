// src/components/Message/Message.jsx

import React, { useState, useContext } from "react";
import axios from "axios";
import downloadIcon from "../../../assets/pdf.svg";
import "./Message.css";
import { useTranslation } from "react-i18next";
import chatI18n from "../../../i18n";
import FeedbackMessage from "../FeeadbackMessage/FeedbackMessage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import copy from "copy-to-clipboard";
import copyIcon from "../../../assets/copy.svg";
import checkIcon from "../../../assets/checkmark.svg";
import { ChatContext } from "../../../context/ChatContext";

export default function Message({
   text,
   isUser,
   isButton,
   onClick,
   filePath,
   filePaths,
   isGreeting,
   botMessageIndex,
   streaming,
   attachments,
   runnerBin,
   isCustomMessage = false,
   isAssistantResponse = false,
}) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
   });
   const { downloadForm } = useContext(ChatContext);
   const [downloadingId, setDownloadingId] = useState(null);
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

   const handleDownload = async (e, path) => {
      e.preventDefault();
      if (!path || typeof path !== "string") {
         console.error("Invalid file path:", path);
         return;
      }
      try {
         const response = await api.get(`/knowledge/get-file`, {
            params: { path },
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
         navigator.clipboard
            .writeText(text)
            .then(() => {
               setCopied(true);
               setTimeout(() => setCopied(false), 1500);
            })
            .catch(() => {
               const ok = copy(text);
               if (ok) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
               } else {
                  console.error("Не удалось скопировать текст");
               }
            });
      } else {
         const ok = copy(text);
         if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
         } else {
            console.error("Не удалось скопировать текст");
         }
      }
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
         <div>
            <ReactMarkdown
               remarkPlugins={[remarkGfm, remarkBreaks]}
               components={{
                  a: ({ href, children, ...props }) => (
                     <a href={href} className="message-link" {...props}>
                        {children}
                     </a>
                  ),
               }}
            >
               {text}
            </ReactMarkdown>
            {!streaming && allFilePaths.length > 0 && (
               <div className="mt-2 fade-in">
                  <div className="file-download-container">
                     {allFilePaths.map((path, index) => (
                        <div key={index} className="file-item">
                           <a href="#" onClick={(e) => handleDownload(e, path)} className="file-download-link">
                              <img src={downloadIcon} alt="Download file" className="file-icon" />
                              <span className="file-name">{getFileName(path)}</span>
                           </a>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {attachments && attachments.length > 0 && (
               <div className="file-download-container fade-in">
                  {attachments.map((att) => (
                     <div key={att.formVersionId} className="file-item">
                        {/* Показываем этот контейнер лишь когда хотя бы одно поле непустое */}
                        {(att.formDate || att.formDestination || att.formDescription) && (
                           <div className="mb-1 text-sm text-gray-600">
                              {att.formDate && (
                                 <p>
                                    <strong>{t("binModal.labelDeadline")}:&nbsp;</strong>
                                    {att.formDate}
                                 </p>
                              )}
                              {att.formDestination && (
                                 <p>
                                    <strong>{t("binModal.labelRecipient")}:&nbsp;</strong>
                                    {att.formDestination}
                                 </p>
                              )}
                              {att.formDescription && (
                                 <p>
                                    <strong>{t("binModal.labelDescription")}:&nbsp;</strong>
                                    {att.formDescription}
                                 </p>
                              )}
                           </div>
                        )}

                        {/* Кнопка скачивания остаётся всегда */}
                        <button
                           className="file-download-link"
                           disabled={downloadingId === att.formVersionId}
                           onClick={async (e) => {
                              e.preventDefault();
                              setDownloadingId(att.formVersionId);
                              try {
                                 await downloadForm(runnerBin, att.formVersionId);
                              } catch (err) {
                                 console.error(err);
                              } finally {
                                 setDownloadingId(null);
                              }
                           }}
                        >
                           {downloadingId === att.formVersionId ? (
                              <div className="loader" />
                           ) : (
                              <>
                                 <img src={downloadIcon} alt="PDF" className="file-icon" />
                                 <span className="file-name">
                                    {att.formIndex} {att.formName}
                                 </span>
                              </>
                           )}
                        </button>
                     </div>
                  ))}
               </div>
            )}
         </div>
         <div className={`buttons__wrapper ${!streaming ? "fade-in" : ""}`}>
            {!isUser &&
               !isGreeting &&
               !isCustomMessage &&
               isAssistantResponse &&
               !streaming &&
               Number.isInteger(botMessageIndex) && (
                  <>
                     <button
                        type="button"
                        className="copy-button flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-200 transition-colors"
                        onClick={handleCopy}
                        onTouchEnd={handleCopy}
                        title={t("copyButton.copy")}
                        style={{ touchAction: "manipulation" }}
                     >
                        {copied ? (
                           <img src={checkIcon} alt="Check" className="icon-check" />
                        ) : (
                           <img src={copyIcon} alt="Copy" className="icon-xs" />
                        )}
                     </button>
                     <FeedbackMessage messageIndex={botMessageIndex} />
                  </>
               )}
         </div>
      </div>
   );
}
