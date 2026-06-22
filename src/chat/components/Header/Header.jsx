import React from "react";
import "./Header.css";
import newBurgerIcon from "../../assets/newBurgerIcon.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useTranslation } from "react-i18next";
import chatI18n from "../../i18n";

const RU_LANGUAGE = "\u0440\u0443\u0441";
const KZ_LANGUAGE = "\u049b\u0430\u0437";
const normalizeChatLanguage = (lang) =>
  lang === "eng" || lang === "en" ? RU_LANGUAGE : lang;

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const { i18n } = useTranslation(undefined, { i18n: chatI18n });
  const { updateLocale } = useContext(ChatContext);
  const languageOptions = [KZ_LANGUAGE, RU_LANGUAGE];

  // Текущий язык по-умолчанию — казахский
  const currentLang = normalizeChatLanguage(i18n.language);

  const handleLanguageChange = (lang) => {
    updateLocale(lang);
  };

  return (
    <div className="h-[50px] chat-header justify-end header border-b-1 border-solid flex items-center px-4">
      {/* Иконка открытия боковой панели для мобильных устройств */}
      <img
        src={isSidebarOpen ? newBurgerIcon : newBurgerIcon}
        alt="Menu"
        className={`header__burger-icon ${
          isSidebarOpen ? "hidden" : "block"
        } md:hidden`}
        onClick={toggleSidebar}
      />

      <div className="flex language">
        {languageOptions.map((lang) => (
          <button
            key={lang}
            className={`language__button rounded ${
              currentLang === lang ? "bg-blue text-white" : "bg-gray color-blue"
            }`}
            onClick={() => handleLanguageChange(lang)}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;
