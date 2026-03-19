import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import { useMemo, useState } from "react";
import "./index.css";
import "./i18n.js";

function AppChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isEmbedded = useMemo(() => window.self !== window.top, []);

  // Функция для переключения состояния боковой панели
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <div
        className={`flex wrapper relative items-stretch ${
          isEmbedded ? "wrapper--embedded" : ""
        }`}
      >
        {/* Передаём состояние и функцию в Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <ChatWindow
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>
    </>
  );
}

export default AppChat;
