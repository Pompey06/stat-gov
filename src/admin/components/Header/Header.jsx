// src/components/Header/Header.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "./Header.css";
import userIcon from "../../assets/userIcon.svg";
import arrowIcon from "../../assets/arrowIcon.svg";
import whiteArrowIcon from "../../assets/whiteArrow.svg";
import adminI18n from "../../i18n";

const Header = ({ activeTab, onMenuToggle }) => {
  const { t, i18n } = useTranslation(undefined, { i18n: adminI18n });
  const [activeLang, setActiveLang] = useState("ru");

  const handleLangChange = (lang) => {
    setActiveLang(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <header className="header">
      {/* Десктоп-версия Header */}
      <div className="desktop-header">
        <div className="header-top">
          <div className="language-switcher">
            <button
              className={`lang-button ru ${
                activeLang === "ru" ? "active" : ""
              }`}
              onClick={() => handleLangChange("ru")}
            >
              рус
            </button>
            <button
              className={`lang-button kz ${
                activeLang === "kz" ? "active" : ""
              }`}
              onClick={() => handleLangChange("kz")}
            >
              қаз
            </button>
          </div>

          <div className="user-info">
            <div className="user-details">
              <img src={userIcon} alt="User" className="user-info-icon" />
              <div className="user-info-text">
                <p className="user-email">userlogin@gmail.com</p>
                <p className="user-name">admin</p>
              </div>
            </div>
            <img src={arrowIcon} alt="Arrow" className="user-info-arrow" />
          </div>
        </div>
        <div className="header-bottom-border"></div>
      </div>

      {/* Мобильная версия Header */}
      <div className="mobile-header show-768">
        <div className="mobile-header-left" onClick={onMenuToggle}>
          <img
            src={whiteArrowIcon}
            alt="Menu Toggle"
            className="menu-toggle-icon"
          />
        </div>
        <div className="mobile-header-center">
          <h2 className="mobile-header-title">
            {activeTab === 1
              ? t("sidebar.databaseUpdate")
              : t("sidebar.feedbackExport")}
          </h2>
        </div>
        <div className="mobile-header-right">
          <img src={userIcon} alt="User" className="mobile-user-icon" />
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
