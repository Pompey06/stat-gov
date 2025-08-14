import React, { useContext, useState, useEffect, useRef } from "react";
import "./MessageInput.css";
import sendIcon from "../../../assets/send.png";
import microphoneIcon from "../../../assets/microphone.svg";
import stopIcon from "../../../assets/stop.svg"; // для состояния "идёт запись"
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../../context/ChatContext";
import chatI18n from "../../../i18n";
import axios from "axios";

export default function MessageInput() {
  const { t } = useTranslation(undefined, { i18n: chatI18n });
  const { inputPrefill, setInputPrefill, createMessage } =
    useContext(ChatContext);
  const [message, setMessage] = useState(inputPrefill);
  const useAltGreeting = import.meta.env.VITE_USE_ALT_GREETING === "true";

  // mic tooltips/states
  const [hideMicTooltip, setHideMicTooltip] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // media
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // axios (как в проекте)
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
  });

  const handleSend = async () => {
    if (!message.trim()) return;
    createMessage(message);
    setInputPrefill("");
    setMessage("");
  };

  useEffect(() => {
    setMessage(inputPrefill);
  }, [inputPrefill]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // Подбор формата записи: пытаемся mp3 → webm → ogg → wav
  const pickSupportedMime = () => {
    const candidates = [
      { mime: "audio/mpeg", ext: "mp3" },
      { mime: "audio/webm;codecs=opus", ext: "webm" },
      { mime: "audio/ogg;codecs=opus", ext: "ogg" },
      { mime: "audio/wav", ext: "wav" },
    ];
    for (const c of candidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(c.mime)) {
        return c;
      }
    }
    // fallback — пусть MediaRecorder сам решит
    return { mime: "", ext: "webm" };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const { mime, ext } = pickSupportedMime();
      const recorder = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined,
      );
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        try {
          setIsRecording(false);
          setIsUploading(true);
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          const filename = `record.${ext}`;
          const fd = new FormData();
          // имя поля из swagger: "audio_file"
          fd.append("audio_file", blob, filename);

          const res = await api.post("/audio/stt", fd, {
            headers: { "Content-Type": "multipart/form-data" },
            responseType: "text", // сервер отвечает text/plain
            transformResponse: [(data) => data], // не парсим как JSON
          });

          const textFromStt =
            typeof res.data === "string" ? res.data : String(res.data || "");
          // Вставляем распознанный текст в инпут (прибавляем к текущему, если там что-то уже есть)
          setMessage((prev) => (prev ? prev + " " : "") + textFromStt.trim());
        } catch (err) {
          console.error("STT upload error:", err);
        } finally {
          setIsUploading(false);
          // останавливаем треки
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          mediaRecorderRef.current = null;
          chunksRef.current = [];
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone permission or init error:", err);
      alert(t("messageInput.micPermissionDenied"));
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      // На случай неконсистентного состояния
      setIsRecording(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      chunksRef.current = [];
    }
  };

  const handleMicClick = () => {
    if (isUploading) return; // защита от повторных
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bottom__wrapper">
      <div className="message-input-container">
        <div className="message-input mt-auto font-light bg-white flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("messageInput.placeholder")}
            className="flex-1 p-2 border rounded-lg"
          />
        </div>

        {/* Микрофон: тултип и hover как у "прочесть вслух", но с твоим классом icon-s */}
        <button
          type="button"
          className={`copy-button flex items-center gap-1 text-sm text-gray-500 transition-colors ${
            hideMicTooltip ? "tooltip-hide" : ""
          }`}
          style={{ touchAction: "manipulation", position: "relative" }}
          aria-label={
            isUploading
              ? t("messageInput.micUploading")
              : isRecording
              ? t("messageInput.micRecording")
              : t("messageInput.micTooltip")
          }
          onMouseEnter={() => setHideMicTooltip(false)}
          onMouseLeave={() => setHideMicTooltip(true)}
          onClick={(e) => {
            e.preventDefault();
            handleMicClick();
            setHideMicTooltip(true);
          }}
          onTouchEnd={(e) => {
            handleMicClick();
            setHideMicTooltip(true);
          }}
          disabled={isUploading}
        >
          {isUploading ? (
            // простой SVG‑лоудер в #0068bf
            <svg
              width="18"
              height="18"
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
          ) : isRecording ? (
            <img
              src={stopIcon}
              alt={t("messageInput.micRecording")}
              className="icon-s"
            />
          ) : (
            <img
              src={microphoneIcon}
              alt={t("messageInput.micTooltip")}
              className="icon-s"
            />
          )}
          <span className="tooltip">
            {isUploading
              ? t("messageInput.micUploading")
              : isRecording
              ? t("messageInput.micRecording")
              : t("messageInput.micTooltip")}
          </span>
        </button>

        {/* Кнопка отправки */}
        <button onClick={handleSend} className="">
          <img
            className="send-icon"
            src={sendIcon}
            alt={t("messageInput.sendIconAlt")}
          />
        </button>
      </div>

      <div className={`ai__text` + (useAltGreeting ? ` ai__text--alt` : ``)}>
        {t(useAltGreeting ? "messageInput.textAlt" : "messageInput.text")}
      </div>
    </div>
  );
}
