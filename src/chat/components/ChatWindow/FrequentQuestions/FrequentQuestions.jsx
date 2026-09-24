import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import chatI18n from "../../../i18n";
import "./FrequentQuestions.css";

const localeKey = (language) => {
  if (language === "қаз" || language === "kz" || language === "kk") {
    return "kz";
  }
  if (language === "eng" || language === "en") return "en";
  return "ru";
};

const localizedText = (value, language) => {
  if (typeof value === "string") return value;

  const locale = localeKey(language);
  if (locale === "en") return value?.en || value?.ru || value?.kz || "";
  if (locale === "kz") return value?.kz || value?.ru || value?.en || "";
  return value?.ru || value?.kz || value?.en || "";
};

function Answer({ children }) {
  if (!children) return null;

  return (
    <div className="frequent-questions__answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ node, ...props }) => {
            void node;
            return <a {...props} target="_blank" rel="noreferrer" />;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

Answer.propTypes = {
  children: PropTypes.string,
};

function QuestionEntry({ item, language, number, depth = 0 }) {
  const question = localizedText(item?.question, language);
  const answer = localizedText(item?.answer, language);
  const subquestions = Array.isArray(item?.subquestions)
    ? item.subquestions.filter((subquestion) =>
        Boolean(localizedText(subquestion?.question, language)),
      )
    : [];

  if (!question) return null;

  return (
    <li
      className={`frequent-questions__item${
        depth > 0 ? " frequent-questions__item--nested" : ""
      }`}
    >
      <details className="frequent-questions__entry">
        <summary className="frequent-questions__question">
          <span className="frequent-questions__number" aria-hidden="true">
            {number}
          </span>
          <span className="frequent-questions__question-text">{question}</span>
          <svg
            className="frequent-questions__question-arrow"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </summary>

        <div className="frequent-questions__entry-body">
          <Answer>{answer}</Answer>

          {subquestions.length > 0 && (
            <ol className="frequent-questions__subquestions">
              {subquestions.map((subquestion, index) => (
                <QuestionEntry
                  key={`${number}.${index + 1}-${localizedText(
                    subquestion.question,
                    language,
                  )}`}
                  item={subquestion}
                  language={language}
                  number={`${number}.${index + 1}`}
                  depth={depth + 1}
                />
              ))}
            </ol>
          )}
        </div>
      </details>
    </li>
  );
}

QuestionEntry.propTypes = {
  item: PropTypes.shape({
    question: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    answer: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    subquestions: PropTypes.array,
  }).isRequired,
  language: PropTypes.string.isRequired,
  number: PropTypes.string.isRequired,
  depth: PropTypes.number,
};

export default function FrequentQuestions({ items }) {
  const { t, i18n } = useTranslation(undefined, { i18n: chatI18n });
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef(null);
  const panelId = useId();
  const visibleItems = items.filter((item) =>
    Boolean(localizedText(item?.question, i18n.language)),
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      const isMobile = window.matchMedia("(max-width: 700px)").matches;
      if (isMobile) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      sectionRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);

  if (visibleItems.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`frequent-questions${isOpen ? " frequent-questions--open" : ""}`}
    >
      <button
        type="button"
        className="frequent-questions__toggle"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="frequent-questions__help" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.8 9.2a2.35 2.35 0 0 1 4.5.95c0 1.75-2.3 1.9-2.3 3.45" />
            <path d="M12 17h.01" />
          </svg>
        </span>
        <span className="frequent-questions__copy">
          <span className="frequent-questions__title">
            {t("frequentQuestions.title")}
          </span>
          <span className="frequent-questions__description">
            {t("frequentQuestions.description")}
          </span>
        </span>
        <span className="frequent-questions__chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </span>
      </button>

      <div className="frequent-questions__reveal">
        <div
          id={panelId}
          className="frequent-questions__panel"
          aria-hidden={!isOpen}
          inert={!isOpen}
        >
          <ol className="frequent-questions__list">
            {visibleItems.map((item, index) => (
              <QuestionEntry
                key={`${index}-${localizedText(item.question, i18n.language)}`}
                item={item}
                language={i18n.language}
                number={String(index + 1)}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

FrequentQuestions.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      answer: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      subquestions: PropTypes.array,
    }),
  ).isRequired,
};
