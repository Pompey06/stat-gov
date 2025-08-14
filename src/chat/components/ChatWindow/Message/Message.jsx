// src/components/Message/Message.jsx

import axios from "axios";
import copy from "copy-to-clipboard";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import checkIcon from "../../../assets/checkmark.svg";
import copyIcon from "../../../assets/copy.svg";
import downloadIcon from "../../../assets/pdf.svg";
import soundIcon from "../../../assets/sound.svg";
import stopIcon from "../../../assets/stop.svg"; // ⬅️ NEW
import personImage from "../../../assets/person.png";
import { ChatContext } from "../../../context/ChatContext";
import chatI18n from "../../../i18n";
import FeedbackMessage from "../FeeadbackMessage/FeedbackMessage";
import "./Message.css";

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

  // tooltips
  const [hideCopyTooltip, setHideCopyTooltip] = useState(true);
  const [hideSoundTooltip, setHideSoundTooltip] = useState(true);

  // TTS
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const abortRef = useRef(null);

  const showAvatar = import.meta.env.VITE_SHOW_AVATAR === "true";

  const allFilePaths = React.useMemo(() => {
    if (filePaths && Array.isArray(filePaths)) {
      return filePaths.filter((p) => typeof p === "string");
    } else if (filePath) {
      return typeof filePath === "string"
        ? [filePath]
        : Array.isArray(filePath)
        ? filePath.filter((p) => typeof p === "string")
        : [];
    }
    return [];
  }, [filePath, filePaths]);

  const handleDownload = async (e, path) => {
    e.preventDefault();
    if (!path || typeof path !== "string") return;
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

        if (
          response.status === 200 &&
          response.data.type === "application/pdf"
        ) {
          const blobUrl = URL.createObjectURL(response.data);
          setFileReadyMap((prev) => ({ ...prev, [att.formVersionId]: true }));
          setFileBlobMap((prev) => ({ ...prev, [att.formVersionId]: blobUrl }));
        }
      } catch (err) {
        console.error("Ошибка загрузки отчёта:", err);
      }
    })();
  }, [attachments]);

  const getFileName = (path) => {
    if (!path || typeof path !== "string") return "file";
    try {
      return path.split("/").pop() || "file";
    } catch {
      return "file";
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    setHideCopyTooltip(true);

    if (navigator.clipboard?.writeText) {
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
          }
        });
    } else {
      const ok = copy(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const getAttachment = (formVersionId) => {
    const currentChat = chats.find(
      (c) =>
        String(c.id) === String(currentChatId) ||
        (c.id === null && currentChatId === null),
    );
    if (!currentChat) return null;
    const msg = currentChat.messages.find((m) => m.attachments);
    return (
      msg?.attachments?.find((a) => a.formVersionId === formVersionId) || null
    );
  };

  const handleDownloadClick = (e, att) => {
    e.preventDefault();
    const blobUrl = fileBlobMap[att.formVersionId];
    if (!blobUrl) return;
    const win = window.open(blobUrl, "_blank");
    if (!win) console.error("Браузер заблокировал всплывающее окно");
  };

  // ====== TTS ======
  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playFromUrl = (url) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setIsAudioPlaying(false);
    audio.onpause = () => setIsAudioPlaying(false);
    audio.onplay = () => setIsAudioPlaying(true);
    audio.play().catch((err) => {
      console.error("Ошибка воспроизведения аудио:", err);
      setIsAudioPlaying(false);
    });
  };

  const handleSoundClick = async (e) => {
    e.stopPropagation();
    setHideSoundTooltip(true);

    // уже загружено: если играем — ничего не делаем (стоп отдельной кнопкой),
    // если не играем — запускаем из кеша
    if (audioUrl && audioRef.current) {
      if (!isAudioPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Ошибка воспроизведения:", err);
        });
      }
      return;
    }

    if (isAudioLoading) return;
    setIsAudioLoading(true);

    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await api.post("/audio/tts", null, {
        params: { text },
        responseType: "blob",
        signal: abortRef.current.signal,
      });

      const blob = new Blob([res.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      playFromUrl(url);
    } catch (err) {
      if (axios.isCancel?.(err)) {
        console.warn("TTS запрос отменён");
      } else {
        console.error("Ошибка TTS:", err);
      }
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleStopClick = (e) => {
    e.stopPropagation();
    setHideSoundTooltip(true);
    // Полный сброс: остановить, освободить URL, очистить состояния
    cleanupAudio();
  };
  // ==============

  // Простой SVG-лоудер (анимация без CSS), цвет #0068bf
  const LoaderIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 50 50"
      role="img"
      aria-label="loading"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#0068bf"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="31.4 188.4"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );

  return (
    <div
      className={`message mb-6 flex font-light ${
        isUser
          ? "user text-right self-end text-white"
          : `self-start relative ${!isGreeting ? "bot-message-wrapper" : ""}`
      } ${
        isButton
          ? "cursor-pointer hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
          : ""
      }`}
      onClick={isButton ? onClick : undefined}
    >
      {!isUser && showAvatar && (
        <img src={personImage} alt="Bot" className="bot-avatar" />
      )}

      <div className={`${isUser ? "" : "bubble"} flex flex-col message__text`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                className="message-link"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
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
                  <a
                    href="#"
                    onClick={(e) => handleDownload(e, path)}
                    className="file-download-link"
                  >
                    <img
                      src={downloadIcon}
                      alt="Download file"
                      className="file-icon"
                    />
                    <span className="file-name">{getFileName(path)}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(attachments) && attachments.length > 0 && (
          <div className="file-download-container fade-in">
            {attachments.map((att) => (
              <div
                key={att.formVersionId}
                className="mb-4 text-sm text-gray-600"
              >
                <p>
                  <strong>{t("binModal.labelIndex")}:</strong> {att.formIndex}
                </p>
                {att.formName && (
                  <p>
                    <strong>{t("binModal.labelName")}:</strong> {att.formName}
                  </p>
                )}
                {att.formDate && (
                  <p>
                    <strong>{t("binModal.labelDeadline")}:</strong>{" "}
                    {att.formDate}
                  </p>
                )}
                {att.formDestination && (
                  <p>
                    <strong>{t("binModal.labelRecipient")}:</strong>{" "}
                    {att.formDestination}
                  </p>
                )}
                {att.formDescription && (
                  <p>
                    <strong>{t("binModal.labelDescription")}:</strong>{" "}
                    {att.formDescription}
                  </p>
                )}
              </div>
            ))}

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
                      <span className="file-name">
                        {t("binModal.fileName")}
                      </span>
                    </>
                  )}
                </button>
              );
            })()}
          </div>
        )}

        {/* Кнопки действий */}
        {!isUser &&
          !isGreeting &&
          !isCustomMessage &&
          isAssistantResponse &&
          !streaming &&
          Number.isInteger(botMessageIndex) && (
            <div className="buttons__wrapper fade-in">
              {/* Копировать */}
              <button
                type="button"
                className={`copy-button flex items-center gap-1 text-sm text-gray-500 transition-colors ${
                  hideCopyTooltip ? "tooltip-hide" : ""
                }`}
                style={{ touchAction: "manipulation", position: "relative" }}
                aria-label={t("copyButton.copy")}
                onMouseEnter={() => setHideCopyTooltip(false)}
                onMouseLeave={() => setHideCopyTooltip(true)}
                onClick={(e) => {
                  handleCopy(e);
                  setHideCopyTooltip(true);
                }}
                onTouchEnd={(e) => {
                  handleCopy(e);
                  setHideCopyTooltip(true);
                }}
              >
                {copied ? (
                  <img src={checkIcon} alt="Check" className="icon-check" />
                ) : (
                  <img src={copyIcon} alt="Copy" className="icon-xs" />
                )}
                <span className="tooltip">{t("copyButton.copy")}</span>
              </button>

              {/* Лайк/дизлайк */}
              <FeedbackMessage messageIndex={botMessageIndex} />

              {/* Прочесть вслух / Лоудер / Стоп */}
              <button
                type="button"
                className={`copy-button sound-button flex items-center gap-1 text-sm text-gray-500 transition-colors ${
                  hideSoundTooltip ? "tooltip-hide" : ""
                }`}
                style={{ touchAction: "manipulation", position: "relative" }}
                aria-label={
                  isAudioLoading
                    ? t("soundButton.loading", "Подготовка…")
                    : isAudioPlaying
                    ? t("soundButton.stop", "Остановить")
                    : t("soundButton.readAloud")
                }
                onMouseEnter={() => setHideSoundTooltip(false)}
                onMouseLeave={() => setHideSoundTooltip(true)}
                onClick={isAudioPlaying ? handleStopClick : handleSoundClick}
                onTouchEnd={isAudioPlaying ? handleStopClick : handleSoundClick}
                disabled={isAudioLoading}
              >
                {isAudioLoading ? (
                  <LoaderIcon />
                ) : isAudioPlaying ? (
                  <img src={stopIcon} alt="Stop" className="icon-xs" />
                ) : (
                  <img src={soundIcon} alt="Sound" className="icon-xs" />
                )}
                <span className="tooltip">
                  {isAudioLoading
                    ? t("soundButton.loading", "Подготовка…")
                    : isAudioPlaying
                    ? t("soundButton.stop", "Остановить")
                    : t("soundButton.readAloud")}
                </span>
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
