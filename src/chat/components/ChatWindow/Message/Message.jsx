import React, { useState } from "react";
import axios from "axios";
import downloadIcon from "../../../assets/pdf.svg";
import "./Message.css";
import { useTranslation } from "react-i18next";
import chatI18n from "../../../i18n";
import FeedbackMessage from "../FeeadbackMessage/FeedbackMessage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import copyIcon from "../../../assets/copy.svg";
import checkIcon from "../../../assets/checkmark.svg";

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
   streaming,
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

   //function renderTextWithLineBreaks(text) {
   //   if (!text) return null;
   //   return text.split("\n").map((line, index, array) => (
   //      <React.Fragment key={index}>
   //         {linkifyText(line)}
   //         {index < array.length - 1 && <br />}
   //      </React.Fragment>
   //   ));
   //}

   //function linkifyText(text) {
   //   if (!text) return null;
   //   const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s]+?)([),.?!]+)?(\s|$)/g;
   //   const elements = [];
   //   let lastIndex = 0;
   //   let match;
   //   while ((match = combinedRegex.exec(text)) !== null) {
   //      if (match.index > lastIndex) {
   //         elements.push(text.substring(lastIndex, match.index));
   //      }
   //      if (match[1]) {
   //         const linkText = match[2];
   //         const url = match[3];
   //         elements.push(
   //            <a
   //               key={`md-${match.index}`}
   //               href={url}
   //               target="_blank"
   //               rel="noopener noreferrer"
   //               className="message-link"
   //            >
   //               {linkText}
   //            </a>
   //         );
   //      } else {
   //         const url = match[4];
   //         const trailing = match[5] || "";
   //         const space = match[6] || "";
   //         elements.push(
   //            <a
   //               key={`url-${match.index}`}
   //               href={url}
   //               target="_blank"
   //               rel="noopener noreferrer"
   //               className="message-link"
   //            >
   //               {url}
   //            </a>
   //         );
   //         elements.push(trailing + space);
   //      }
   //      lastIndex = combinedRegex.lastIndex;
   //   }
   //   if (lastIndex < text.length) {
   //      elements.push(text.substring(lastIndex));
   //   }
   //   return elements;
   //}

   //const hasLineBreaks = !isUser && text && text.includes("\n");

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

         <div>
            <ReactMarkdown
               remarkPlugins={[remarkGfm, remarkBreaks]}
               components={{
                  // Все <a> рендерим с нашим классом, чтобы сработал .message-link из CSS
                  a: ({ href, children, ...props }) => (
                     <a href={href} className="message-link" {...props}>
                        {children}
                     </a>
                  ),
               }}
            >
               {text}
            </ReactMarkdown>
            {/*{hasLineBreaks ? renderTextWithLineBreaks(text) : linkifyText(text)}*/}
            {!streaming && allFilePaths.length > 0 && (
               <div className="mt-2 fade-in">
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
