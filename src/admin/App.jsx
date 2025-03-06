import "./App.css";
import Login from "./components/Login/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import DatabaseUpdate from "./components/DatabaseUpdate/DatabaseUpdate";
import FeedbackExport from "./components/FeedbackExport/FeedbackExport";
import { useState } from "react";
import "./i18n.js";

function AppAdmin() {
   const [activeTab, setActiveTab] = useState(1);
   // Вместо булевого флага isLoggedIn, теперь храним введённые учётные данные
   const [credentials, setCredentials] = useState(null);
   const [sidebarOpen, setSidebarOpen] = useState(true);

   const handleMenuToggle = () => {
      setSidebarOpen((prev) => !prev);
   };

   return (
      <div className="app">
         {!credentials ? (
            // Передаём колбэк, который получает логин и пароль из компонента Login
            <Login onLogin={(login, password) => setCredentials({ login, password })} />
         ) : (
            <>
               <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isOpen={sidebarOpen}
                  onMenuToggle={handleMenuToggle}
               />
               <div className="main-content">
                  <Header activeTab={activeTab} onMenuToggle={handleMenuToggle} />
                  {/* Передаём credentials в дочерние компоненты, где они могут понадобиться */}
                  {activeTab === 1 && <DatabaseUpdate credentials={credentials} />}
                  {activeTab === 2 && <FeedbackExport credentials={credentials} />}
               </div>
            </>
         )}
      </div>
   );
}

export default AppAdmin;
