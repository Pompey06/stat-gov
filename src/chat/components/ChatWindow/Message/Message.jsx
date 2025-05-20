// src/components/Message/Message.jsx

import React, { useState, useContext, useEffect } from "react";
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
   const { t, i18n } = useTranslation(undefined, { i18n: chatI18n });
   const [fileReadyMap, setFileReadyMap] = useState({});
   const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
   });
   const { downloadForm, chats, currentChatId } = useContext(ChatContext);
   const [fileBlobMap, setFileBlobMap] = useState({});
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

   useEffect(() => {
      const att = attachments?.[0];
      if (!att?.order_id) return;

      (async () => {
         try {
            const lang = i18n.language === "қаз" ? "kk" : "ru";
            const response = await api.get("/begunok/report", {
               params: { order_id: att.order_id, lang },
               responseType: "blob",
            });

            if (response.status === 200 && response.data.type === "application/pdf") {
               const blobUrl = URL.createObjectURL(response.data);
               setFileReadyMap((prev) => ({ ...prev, [att.formVersionId]: true }));
               setFileBlobMap((prev) => ({ ...prev, [att.formVersionId]: blobUrl }));
            }
         } catch (err) {
            console.error("Ошибка загрузки отчёта:", err);
         }
      })();
   }, [attachments, api]);

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

   // Находит в стейте чат и его attachments по formVersionId
   const getAttachment = (formVersionId) => {
      const currentChat = chats.find(
         (c) => String(c.id) === String(currentChatId) || (c.id === null && currentChatId === null)
      );
      if (!currentChat) return null;
      const msg = currentChat.messages.find((m) => m.attachments);
      return msg?.attachments?.find((a) => a.formVersionId === formVersionId) || null;
   };

   const handleDownloadClick = (e, att) => {
      e.preventDefault();
      const blobUrl = fileBlobMap[att.formVersionId];
      if (!blobUrl) {
         console.error("Файл ещё не готов");
         return;
      }

      const win = window.open(blobUrl, "_blank");
      if (!win) {
         console.error("Браузер заблокировал всплывающее окно");
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

            {Array.isArray(attachments) && attachments.length > 0 && (
               <div className="file-download-container fade-in">
                  {/* Блоки с текстом от каждого файла */}
                  {attachments.map((att, index) => {
                     const hasAnyText = att.formName || att.formDate || att.formDestination || att.formDescription;

                     return hasAnyText ? (
                        <div key={att.formVersionId} className="mb-4 text-sm text-gray-600">
                           {att.formIndex && (
                              <p>
                                 <strong>{t("binModal.labelIndex")}:</strong> {att.formIndex}
                              </p>
                           )}
                           {att.formName && (
                              <p>
                                 <strong>{t("binModal.labelName")}:</strong> {att.formName}
                              </p>
                           )}
                           {att.formDate && (
                              <p>
                                 <strong>{t("binModal.labelDeadline")}:</strong> {att.formDate}
                              </p>
                           )}
                           {att.formDestination && (
                              <p>
                                 <strong>{t("binModal.labelRecipient")}:</strong> {att.formDestination}
                              </p>
                           )}
                           {att.formDescription && (
                              <p>
                                 <strong>{t("binModal.labelDescription")}:</strong> {att.formDescription}
                              </p>
                           )}
                        </div>
                     ) : null;
                  })}

                  {/* Один файл (первый) */}
                  {(() => {
                     const att = attachments[0];
                     const isReady = fileReadyMap[att.formVersionId];
                     const isLoading = downloadingId === att.formVersionId;

                     return !isReady ? (
                        <div className="file-download-link flex items-center gap-2 text-sm text-gray-500">
                           <img src={downloadIcon} alt="Loading" className="file-icon" />
                           <span>
                              {t("binModal.preparing")}
                              <span className="typing-container file-typing ml-1">
                                 <span className="dot one">.</span>
                                 <span className="dot two">.</span>
                                 <span className="dot three">.</span>
                              </span>
                           </span>
                        </div>
                     ) : (
                        <button
                           className="file-download-link"
                           disabled={isLoading}
                           onClick={(e) => handleDownloadClick(e, att)}
                        >
                           {isLoading ? (
                              <div className="loader" />
                           ) : (
                              <>
                                 <img src={downloadIcon} alt="PDF" className="file-icon" />
                                 <span className="file-name">{t("binModal.fileName")}</span>
                              </>
                           )}
                        </button>
                     );
                  })()}
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
