import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import microphoneIcon from "../../../assets/microphone.svg";
import sendIcon from "../../../assets/send.png";
import stopIcon from "../../../assets/stop.svg";
import { ChatContext } from "../../../context/ChatContext";
import chatI18n from "../../../i18n";
import "./MessageInput.css";

export default function MessageInput() {
  const { t } = useTranslation(undefined, { i18n: chatI18n });
  const {
    inputPrefill,
    setInputPrefill,
    createMessage,
    isTyping,
    cancelAssistantResponse,
  } = useContext(ChatContext);
  const [message, setMessage] = useState(inputPrefill);
  const useAltGreeting = import.meta.env.VITE_USE_ALT_GREETING === "true";

  const [hideMicTooltip, setHideMicTooltip] = useState(true);
  const [hideDoneTooltip, setHideDoneTooltip] = useState(true);
  const [hideCancelTooltip, setHideCancelTooltip] = useState(true);
  const [hideStopResponseTooltip, setHideStopResponseTooltip] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMicHint, setShowMicHint] = useState(false);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const shouldTranscribeRef = useRef(true);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
  });

  const handleSend = () => {
    if (isUploading || isTyping || !message.trim()) return;
    createMessage(message);
    setInputPrefill("");
    setMessage("");
  };

  useEffect(() => {
    setMessage(inputPrefill);
  }, [inputPrefill]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const pickSupportedMime = () => {
    const candidates = [
      { mime: "audio/mpeg", ext: "mp3" },
      { mime: "audio/webm;codecs=opus", ext: "webm" },
      { mime: "audio/ogg;codecs=opus", ext: "ogg" },
      { mime: "audio/wav", ext: "wav" },
    ];

    for (const candidate of candidates) {
      if (
        window.MediaRecorder &&
        MediaRecorder.isTypeSupported(candidate.mime)
      ) {
        return candidate;
      }
    }

    return { mime: "", ext: "webm" };
  };

  const releaseMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
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
      shouldTranscribeRef.current = true;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          setIsRecording(false);
          setShowMicHint(false);

          if (!shouldTranscribeRef.current) {
            return;
          }

          setIsUploading(true);

          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          const filename = `record.${ext}`;
          const formData = new FormData();
          formData.append("audio_file", blob, filename);

          const response = await api.post("/audio/stt", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            responseType: "text",
            transformResponse: [(data) => data],
          });

          const textFromStt =
            typeof response.data === "string"
              ? response.data
              : String(response.data || "");

          setMessage((prev) => {
            const transcript = textFromStt.trim();
            if (!transcript) return prev;
            return prev ? `${prev} ${transcript}` : transcript;
          });
        } catch (error) {
          console.error("STT upload error:", error);
        } finally {
          shouldTranscribeRef.current = true;
          setIsUploading(false);
          releaseMedia();
        }
      };

      recorder.start();
      setIsRecording(true);
      setShowMicHint(true);
    } catch (error) {
      console.error("Microphone permission or init error:", error);
      alert(t("messageInput.micPermissionDenied"));
    }
  };

  const finishRecording = () => {
    shouldTranscribeRef.current = true;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      return;
    }

    setIsRecording(false);
    setShowMicHint(false);
    releaseMedia();
  };

  const cancelRecording = () => {
    shouldTranscribeRef.current = false;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      return;
    }

    setIsRecording(false);
    setShowMicHint(false);
    releaseMedia();
  };

  const handleMicClick = () => {
    if (isRecording || isUploading) return;
    startRecording();
  };

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      releaseMedia();
    };
  }, []);

  return (
    <div className="bottom__wrapper">
      <div className="message-input-container">
        <div
          className={`message-input mt-auto font-light bg-white flex items-center gap-2 relative ${
            showMicHint ? "input--with-hint" : ""
          }`}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("messageInput.placeholder")}
            className="flex-1 p-2 border rounded-lg"
          />
          {showMicHint && (
            <div className="mic-hint">{t("messageInput.micRecordingHint")}</div>
          )}
        </div>

        <div className="message-input-actions">
          {!isRecording && (
            <button
              type="button"
              className={`message-input-action ${
                hideMicTooltip ? "tooltip-hide" : ""
              }`}
              aria-label={
                isUploading
                  ? t("messageInput.micUploading")
                  : t("messageInput.micTooltip")
              }
              onMouseEnter={() => setHideMicTooltip(false)}
              onMouseLeave={() => setHideMicTooltip(true)}
              onClick={(e) => {
                e.preventDefault();
                handleMicClick();
                setHideMicTooltip(true);
              }}
              disabled={isUploading}
            >
              {isUploading ? (
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
              ) : (
                <img
                  src={microphoneIcon}
                  alt={t("messageInput.micTooltip")}
                  className="icon-s"
                />
              )}
              <span className="tooltip mic-tooltip">
                {isUploading
                  ? t("messageInput.micUploading")
                  : t("messageInput.micTooltip")}
              </span>
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              className={`message-input-action message-input-action--stop ${
                hideCancelTooltip ? "tooltip-hide" : ""
              }`}
              aria-label={t("messageInput.micRecording")}
              onMouseEnter={() => setHideCancelTooltip(false)}
              onMouseLeave={() => setHideCancelTooltip(true)}
              onClick={(e) => {
                e.preventDefault();
                cancelRecording();
                setHideCancelTooltip(true);
              }}
            >
              <img
                src={stopIcon}
                alt={t("messageInput.micRecording")}
                className="icon-s"
              />
              <span className="tooltip mic-tooltip">
                {t("messageInput.micRecording")}
              </span>
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              className={`message-input-action message-input-action--primary ${
                hideDoneTooltip ? "tooltip-hide" : ""
              }`}
              aria-label={t("messageInput.micDoneTooltip")}
              onMouseEnter={() => setHideDoneTooltip(false)}
              onMouseLeave={() => setHideDoneTooltip(true)}
              onClick={(e) => {
                e.preventDefault();
                finishRecording();
                setHideDoneTooltip(true);
              }}
            >
              <span className="message-input-action__check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20.285 6.709a1 1 0 0 0-1.414 0L9 16.58l-3.871-3.87a1 1 0 1 0-1.414 1.414l4.578 4.578a1 1 0 0 0 1.414 0L20.285 8.123a1 1 0 0 0 0-1.414Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="tooltip mic-tooltip">
                {t("messageInput.micDoneTooltip")}
              </span>
            </button>
          )}

          {isTyping ? (
            <button
              type="button"
              className={`message-input-action message-input-action--stop ${
                hideStopResponseTooltip ? "tooltip-hide" : ""
              }`}
              aria-label={t("messageInput.stopResponseTooltip")}
              onMouseEnter={() => setHideStopResponseTooltip(false)}
              onMouseLeave={() => setHideStopResponseTooltip(true)}
              onClick={(e) => {
                e.preventDefault();
                cancelAssistantResponse();
                setHideStopResponseTooltip(true);
              }}
            >
              <img
                src={stopIcon}
                alt={t("messageInput.stopResponseTooltip")}
                className="icon-s"
              />
              <span className="tooltip mic-tooltip">
                {t("messageInput.stopResponseTooltip")}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="message-input-send"
              onClick={handleSend}
              disabled={isUploading || !message.trim()}
            >
              <img
                className="send-icon"
                src={sendIcon}
                alt={t("messageInput.sendIconAlt")}
              />
            </button>
          )}
        </div>
      </div>

      <div className={`ai__text${useAltGreeting ? " ai__text--alt" : ""}`}>
        {t(useAltGreeting ? "messageInput.textAlt" : "messageInput.text")}
      </div>
    </div>
  );
}
