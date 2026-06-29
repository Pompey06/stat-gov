import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../ChatWindow/Modal/BaseModal";
import { ChatContext } from "../../context/ChatContext";
import chatI18n from "../../i18n";
import "./SearchChatsModal.css";

function highlightMatch(text, query) {
   const source = String(text || "");
   const trimmedQuery = String(query || "").trim();

   if (!source || !trimmedQuery) {
      return source;
   }

   const lowerSource = source.toLocaleLowerCase();
   const lowerQuery = trimmedQuery.toLocaleLowerCase();
   const matchIndex = lowerSource.indexOf(lowerQuery);

   if (matchIndex === -1) {
      return source;
   }

   const before = source.slice(0, matchIndex);
   const match = source.slice(matchIndex, matchIndex + trimmedQuery.length);
   const after = source.slice(matchIndex + trimmedQuery.length);

   return (
      <>
         {before}
         <mark className="search-chats-modal__mark">{match}</mark>
         {after}
      </>
   );
}

export default function SearchChatsModal({ isOpen, onClose }) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const { searchChats, focusChatSearchResult } = useContext(ChatContext);
   const [query, setQuery] = useState("");
   const [results, setResults] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const inputRef = useRef(null);
   const searchRequestRef = useRef(0);
   const searchChatsRef = useRef(searchChats);

   useEffect(() => {
      searchChatsRef.current = searchChats;
   }, [searchChats]);

   useEffect(() => {
      if (!isOpen) {
         setQuery("");
         setResults([]);
         setIsLoading(false);
         searchRequestRef.current += 1;
         return;
      }

      const timeoutId = window.setTimeout(() => {
         inputRef.current?.focus();
      }, 20);

      return () => window.clearTimeout(timeoutId);
   }, [isOpen]);

   useEffect(() => {
      if (!isOpen) return;

      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
         searchRequestRef.current += 1;
         setResults([]);
         setIsLoading(false);
         return;
      }

      const requestId = searchRequestRef.current + 1;
      searchRequestRef.current = requestId;
      setIsLoading(true);

      const timeoutId = window.setTimeout(() => {
         (async () => {
            try {
               const nextResults = await searchChatsRef.current(trimmedQuery);
               if (searchRequestRef.current !== requestId) return;
               setResults(nextResults);
            } catch (error) {
               console.error("Error searching chats:", error);
               if (searchRequestRef.current !== requestId) return;
               setResults([]);
            } finally {
               if (searchRequestRef.current === requestId) {
                  setIsLoading(false);
               }
            }
         })();
      }, 250);

      return () => window.clearTimeout(timeoutId);
   }, [isOpen, query]);

   const formatChatDate = (dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (left, right) =>
         left.getFullYear() === right.getFullYear() &&
         left.getMonth() === right.getMonth() &&
         left.getDate() === right.getDate();

      if (isSameDay(date, today)) return t("sidebar.today");
      if (isSameDay(date, yesterday)) return t("sidebar.yesterday");

      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
   };

   const handleSelectResult = async (result) => {
      await focusChatSearchResult({
         chatId: result.id,
         messageIndex: result.messageIndex,
         query: query.trim(),
      });
      onClose();
   };

   const renderStatus = () => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 2) {
         return (
            <div className="search-chats-modal__status">
               {t("sidebar.searchHint")}
            </div>
         );
      }

      if (isLoading) {
         return (
            <div className="search-chats-modal__status">
               {t("sidebar.searchLoading")}
            </div>
         );
      }

      if (results.length === 0) {
         return (
            <div className="search-chats-modal__status">
               {t("sidebar.searchEmpty")}
            </div>
         );
      }

      return null;
   };

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={t("sidebar.searchTitle")}
         modalClassName="search-chats-modal"
      >
         <div className="search-chats-modal__body">
            <div className="search-chats-modal__field">
               <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="search-chats-modal__input"
                  placeholder={t("sidebar.searchPlaceholder")}
                  autoComplete="off"
                  spellCheck="false"
               />
            </div>

            {results.length > 0 ? (
               <div className="search-chats-modal__results">
                  {results.map((result) => (
                     <button
                        key={result.id}
                        type="button"
                        className="search-chats-modal__result"
                        onClick={() => handleSelectResult(result)}
                     >
                        <div className="search-chats-modal__result-top">
                           <div className="search-chats-modal__result-title">
                              {highlightMatch(
                                 result.title || t("sidebar.newChat"),
                                 query,
                              )}
                           </div>
                           <div className="search-chats-modal__result-date">
                              {formatChatDate(result.lastUpdated)}
                           </div>
                        </div>

                        <div className="search-chats-modal__result-meta">
                           <span className="search-chats-modal__badge">
                              {result.messageMatch
                                 ? t("sidebar.searchMatchMessage")
                                 : t("sidebar.searchMatchTitle")}
                           </span>
                        </div>

                        {(result.messageMatch ||
                           result.snippet !== (result.title || "")) && (
                           <div className="search-chats-modal__result-snippet">
                              {highlightMatch(result.snippet, query)}
                           </div>
                        )}
                     </button>
                  ))}
               </div>
            ) : (
               renderStatus()
            )}
         </div>
      </BaseModal>
   );
}
