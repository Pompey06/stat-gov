import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo.svg";
import newIcon from "../../assets/new.svg";
import downloadIcon from "../../assets/download.svg";
import burgerIcon from "../../assets/burgerIcon.svg";
import SidebarButton from "../SidebarButton/SidebarButton";
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

const FaqIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8 10.5C8 8.01472 10.0147 6 12.5 6H21.5C23.9853 6 26 8.01472 26 10.5V18.5C26 20.9853 23.9853 23 21.5 23H15.3L10.8 27.5V23H12.5C10.0147 23 8 20.9853 8 18.5V10.5Z"
      stroke="white"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 16H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FilesIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9 10.5C9 8.567 10.567 7 12.5 7H17L20 10H24.5C26.433 10 28 11.567 28 13.5V23.5C28 25.433 26.433 27 24.5 27H12.5C10.567 27 9 25.433 9 23.5V10.5Z"
      stroke="white"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M13 16H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 20H21" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SitemapIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="6" y="8" width="22" height="18" rx="2" stroke="white" strokeWidth="2" />
    <path d="M10 14H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 22H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Sidebar = ({ activeTab, setActiveTab, isOpen, onMenuToggle }) => {
  const { t, i18n } = useTranslation(undefined, { i18n: adminI18n });
  const [activeLang, setActiveLang] = useState(
    i18n.language === "kz" ? "kz" : "ru",
  );
  const filesLabel =
    i18n.language === "kz" ? "Файлдарды жаңарту" : "Обновление файлов";
  const faqLabel = i18n.language === "kz" ? "Санаттар мен FAQ" : "Категории и FAQ";
  const sitemapLabel = i18n.language === "kz" ? "Сайт картасы" : "Карта сайта";

  const handleLangChange = (lang) => {
    setActiveLang(lang);
    i18n.changeLanguage(lang);
  };

  const handleButtonClick = (tab) => {
    setActiveTab(tab);
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
          icon={<FilesIcon />}
          text={filesLabel}
          active={activeTab === 2}
          onClick={() => handleButtonClick(2)}
        />
        <SidebarButton
          icon={downloadIcon}
          text={t("sidebar.feedbackExport")}
          active={activeTab === 3}
          onClick={() => handleButtonClick(3)}
        />
        <SidebarButton
          icon={<AnalyticsIcon />}
          text={t("sidebar.analytics")}
          active={activeTab === 4}
          onClick={() => handleButtonClick(4)}
        />
        <SidebarButton
          icon={<FaqIcon />}
          text={faqLabel}
          active={activeTab === 5}
          onClick={() => handleButtonClick(5)}
        />
        <SidebarButton
          icon={<SitemapIcon />}
          text={sitemapLabel}
          active={activeTab === 6}
          onClick={() => handleButtonClick(6)}
        />
      </nav>
      <div className="sidebar-bottom">
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
