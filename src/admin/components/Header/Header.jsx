import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "./Header.css";
import whiteArrowIcon from "../../assets/whiteArrow.svg";
import adminI18n from "../../i18n";

const Header = ({ activeTab, onMenuToggle }) => {
  const { t, i18n } = useTranslation(undefined, { i18n: adminI18n });
  const [activeLang, setActiveLang] = useState("ru");
  const filesLabel =
    i18n.language === "kz" ? "Файлдарды жаңарту" : "Обновление файлов";
  const faqLabel = i18n.language === "kz" ? "Санаттар мен FAQ" : "Категории и FAQ";
  const sitemapLabel = i18n.language === "kz" ? "Сайт картасы" : "Карта сайта";
  const mobileTitle =
    activeTab === 1
      ? t("sidebar.databaseUpdate")
      : activeTab === 2
        ? filesLabel
        : activeTab === 3
          ? t("sidebar.feedbackExport")
          : activeTab === 4
            ? t("sidebar.analytics")
            : activeTab === 5
              ? faqLabel
              : sitemapLabel;

  const handleLangChange = (lang) => {
    setActiveLang(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <header className="header">
      <div className="desktop-header">
        <div className="header-top">
          <div className="language-switcher">
            <button
              className={`lang-button ru ${activeLang === "ru" ? "active" : ""}`}
              onClick={() => handleLangChange("ru")}
            >
              рус
            </button>
            <button
              className={`lang-button kz ${activeLang === "kz" ? "active" : ""}`}
              onClick={() => handleLangChange("kz")}
            >
              қаз
            </button>
          </div>
        </div>
        <div className="header-bottom-border"></div>
      </div>

      <div className="mobile-header show-768">
        <div className="mobile-header-left" onClick={onMenuToggle}>
          <img
            src={whiteArrowIcon}
            alt="Menu Toggle"
            className="menu-toggle-icon"
          />
        </div>
        <div className="mobile-header-center">
          <h2 className="mobile-header-title">{mobileTitle}</h2>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  activeTab: PropTypes.number.isRequired,
  onMenuToggle: PropTypes.func.isRequired,
};

export default Header;
