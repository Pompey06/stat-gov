import React from "react";
import "./Header.css";
import newBurgerIcon from "../../assets/newBurgerIcon.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

const Header = ({ isSidebarOpen, toggleSidebar }) => {
   const { updateLocale } = useContext(ChatContext);

   // Текущий язык по-умолчанию — казахский
   const [language, setLanguage] = React.useState("қаз");

   // При монтировании устанавливаем казахский в контексте
   React.useEffect(() => {
      updateLocale("қаз");
   }, []);

   const handleLanguageChange = (lang) => {
      setLanguage(lang);
      updateLocale(lang);
   };

   return (
      <div className="h-[50px] chat-header justify-end header border-b-1 border-solid flex items-center px-4">
         {/* Иконка открытия боковой панели для мобильных устройств */}
         <img
            src={isSidebarOpen ? newBurgerIcon : newBurgerIcon}
            alt="Menu"
            className={`header__burger-icon ${isSidebarOpen ? "hidden" : "block"} md:hidden`}
            onClick={toggleSidebar}
         />

         <div className="flex language">
            <button
               className={`language__button rounded ${
                  language === "русc" ? "bg-blue text-white" : "bg-gray color-blue"
               }`}
               onClick={() => handleLanguageChange("русc")}
            >
               русc
            </button>
            <button
               className={`language__button rounded ${
                  language === "қаз" ? "bg-blue text-white" : "bg-gray color-blue"
               }`}
               onClick={() => handleLanguageChange("қаз")}
            >
               қаз
            </button>
         </div>
      </div>
   );
};

export default Header;
