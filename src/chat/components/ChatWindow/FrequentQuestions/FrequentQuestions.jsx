import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import chatI18n from "../../../i18n";
import "./FrequentQuestions.css";

const localeKey = (language) => {
  if (language === "қаз" || language === "kz" || language === "kk") {
    return "kz";
  }
  if (language === "eng" || language === "en") return "en";
  return "ru";
};

const localizedQuestion = (item, language) => {
  const question = item?.question;
  if (typeof question === "string") return question;

  const locale = localeKey(language);
  if (locale === "en") return question?.en || "";
  return question?.[locale] || question?.ru || question?.kz || question?.en || "";
};

export default function FrequentQuestions({ items, onSelect, disabled }) {
  const { t, i18n } = useTranslation(undefined, { i18n: chatI18n });
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef(null);
  const panelId = useId();
  const visibleItems = items
    .map((item, index) => ({
      item,
      index,
      question: localizedQuestion(item, i18n.language),
    }))
    .filter(({ question }) => Boolean(question));

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
        aria-label={t(isOpen ? "frequentQuestions.close" : "frequentQuestions.open")}
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
        >
          <ol className="frequent-questions__list">
            {visibleItems.map(({ item, index, question }) => {
              return (
                <li key={`${question}-${index}`} className="frequent-questions__item">
                  <button
                    type="button"
                    className="frequent-questions__question"
                    onClick={() => onSelect(item)}
                    disabled={disabled}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <span className="frequent-questions__number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>{question}</span>
                    <svg
                      className="frequent-questions__question-arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

FrequentQuestions.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          ru: PropTypes.string,
          kz: PropTypes.string,
          en: PropTypes.string,
        }),
      ]).isRequired,
    }),
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

FrequentQuestions.defaultProps = {
  disabled: false,
};
