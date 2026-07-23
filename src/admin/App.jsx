import "./App.css";
import Login from "./components/Login/Login";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import DatabaseUpdate from "./components/DatabaseUpdate/DatabaseUpdate";
import FileManager from "./components/FileManager/FileManager";
import FeedbackExport from "./components/FeedbackExport/FeedbackExport";
import AnalyticsDashboard from "./components/AnalyticsDashboard/AnalyticsDashboard";
import FaqSettings from "./components/FaqSettings/FaqSettings";
import SitemapSettings from "./components/SitemapSettings/SitemapSettings";
import { useState } from "react";
import "./i18n.js";

function AppAdmin() {
   const [activeTab, setActiveTab] = useState(1);

   // === НОВАЯ ЛОГИКА: показываем Login, пока credentials === null ===
   // Для локальной разработки сразу попадаем в админку без формы логина.
   // Чтобы вернуть обычный вход, замените объект ниже на `null`.
   const [credentials, setCredentials] = useState(null);

   const [sidebarOpen, setSidebarOpen] = useState(true);
   const handleMenuToggle = () => {
      setSidebarOpen((prev) => !prev);
   };

   return (
      <div className="app">
         {!credentials ? (
            // Показываем форму входа
            <Login onLogin={(login, password) => setCredentials({ login, password })} />
         ) : (
            <AdminLayout
               activeTab={activeTab}
               setActiveTab={setActiveTab}
               sidebarOpen={sidebarOpen}
               onMenuToggle={handleMenuToggle}
            >
               {activeTab === 1 && <DatabaseUpdate credentials={credentials} />}
               {activeTab === 2 && <FileManager credentials={credentials} />}
               {activeTab === 3 && <FeedbackExport credentials={credentials} />}
               {activeTab === 4 && <AnalyticsDashboard credentials={credentials} />}
               {activeTab === 5 && <FaqSettings credentials={credentials} />}
               {activeTab === 6 && <SitemapSettings credentials={credentials} />}
            </AdminLayout>
         )}
      </div>
   );
}

export default AppAdmin;

//СТАРЫЙ ВАРИАНТ (без формы логина — всегда подставлены учётки)
//Раскомментируй этот блок и закомментируй весь код выше,
//чтобы сразу переключиться на прежнее поведение:

//import "./App.css";
//import Sidebar from "./components/Sidebar/Sidebar";
//import Header from "./components/Header/Header";
//import DatabaseUpdate from "./components/DatabaseUpdate/DatabaseUpdate";
//import FeedbackExport from "./components/FeedbackExport/FeedbackExport";
//import { useState } from "react";
//import "./i18n.js";

//function AppAdmin() {
//   const [activeTab, setActiveTab] = useState(1);
//   // Всегда залогинены под админом — форма входа не показывается
//   const [credentials, setCredentials] = useState({
//      login: "admin",
//      password: "C1KACI",
//   });

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const handleMenuToggle = () => {
//      setSidebarOpen((prev) => !prev);
//   };

//   return (
//      <div className="app">
//         <Sidebar
//            activeTab={activeTab}
//            setActiveTab={setActiveTab}
//            isOpen={sidebarOpen}
//            onMenuToggle={handleMenuToggle}
//         />
//         <div className="main-content">
//            <Header activeTab={activeTab} onMenuToggle={handleMenuToggle} />
//            {activeTab === 1 && <DatabaseUpdate credentials={credentials} />}
//            {activeTab === 2 && <FeedbackExport credentials={credentials} />}
//         </div>
//      </div>
//   );
//}

//export default AppAdmin;
