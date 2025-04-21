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

   // === НОВАЯ ЛОГИКА: показываем Login, пока credentials === null ===
   const [credentials, setCredentials] = useState(null);

   const [sidebarOpen, setSidebarOpen] = useState(true);
   const handleMenuToggle = () => {
      setSidebarOpen((prev) => !prev);
   };
   const handleLogout = () => {
      setCredentials(null);
   };

   return (
      <div className="app">
         {!credentials ? (
            // Показываем форму входа
            <Login onLogin={(login, password) => setCredentials({ login, password })} />
         ) : (
            // После успешного Login — вся админка
            <>
               <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isOpen={sidebarOpen}
                  onMenuToggle={handleMenuToggle}
               />
               <div className="main-content">
                  <Header
                     activeTab={activeTab}
                     onMenuToggle={handleMenuToggle}
                     onLogout={handleLogout} // если надо вывести кнопку «Выйти»
                  />
                  {activeTab === 1 && <DatabaseUpdate credentials={credentials} />}
                  {activeTab === 2 && <FeedbackExport credentials={credentials} />}
               </div>
            </>
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
