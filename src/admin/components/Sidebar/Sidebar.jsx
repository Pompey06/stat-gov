import PropTypes from "prop-types";
import { useState } from "react";
import logo from "../../assets/logo.svg";
import newIcon from "../../assets/new.svg";
import downloadIcon from "../../assets/download.svg";
import burgerIcon from "../../assets/burgerIcon.svg";
import SidebarButton from "../SidebarButton/SidebarButton";
import userIcon from "../../assets/userIcon.svg";
import arrowIcon from "../../assets/arrowIcon.svg";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";
import adminI18n from "../../i18n";

const AnalyticsIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="4" y="21" width="4" height="9" rx="1.5" fill="white" />
    <rect x="12" y="15" width="4" height="15" rx="1.5" fill="white" />
    <rect x="20" y="9" width="4" height="21" rx="1.5" fill="white" />
    <path
      d="M5 10.5L12.5 14L20 8L27.5 10.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="10.5" r="1.5" fill="white" />
    <circle cx="12.5" cy="14" r="1.5" fill="white" />
    <circle cx="20" cy="8" r="1.5" fill="white" />
    <circle cx="27.5" cy="10.5" r="1.5" fill="white" />
  </svg>
);

const Sidebar = ({ activeTab, setActiveTab, isOpen, onMenuToggle }) => {
  const { t, i18n } = useTranslation(undefined, { i18n: adminI18n });
  const [activeLang, setActiveLang] = useState("ru");

  const handleLangChange = (lang) => {
    setActiveLang(lang);
    i18n.changeLanguage(lang);
  };

  const handleButtonClick = (tab) => {
    setActiveTab(tab);
    // Если экран мобильный, закрываем меню
    if (window.innerWidth <= 768) {
      onMenuToggle();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" className="logo" />
        <img
          src={burgerIcon}
          alt="Burger"
          className="burger-icon show-768"
          onClick={onMenuToggle}
        />
      </div>
      <nav className="sidebar-nav">
        <SidebarButton
          icon={newIcon}
          text={t("sidebar.databaseUpdate")}
          active={activeTab === 1}
          onClick={() => handleButtonClick(1)}
        />
        <SidebarButton
          icon={downloadIcon}
          text={t("sidebar.feedbackExport")}
          active={activeTab === 2}
          onClick={() => handleButtonClick(2)}
        />
        <SidebarButton
          icon={<AnalyticsIcon />}
          text={t("sidebar.analytics")}
          active={activeTab === 3}
          onClick={() => handleButtonClick(3)}
        />
      </nav>
      <div className="sidebar-bottom show-768">
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
    </aside>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.number.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onMenuToggle: PropTypes.func.isRequired,
};

export default Sidebar;
