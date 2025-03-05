import './App.css';
import Login from './components/Login/Login';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import DatabaseUpdate from './components/DatabaseUpdate/DatabaseUpdate';
import FeedbackExport from './components/FeedbackExport/FeedbackExport';
import { useState } from 'react';
import "./i18n.js";
function AppAdmin() {
  const [activeTab, setActiveTab] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app">
      {!isLoggedIn ? (
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} onMenuToggle={handleMenuToggle} />
          <div className="main-content">
            <Header activeTab={activeTab} onMenuToggle={handleMenuToggle} />
            {activeTab === 1 && <DatabaseUpdate />}
            {activeTab === 2 && <FeedbackExport />}
          </div>
        </>
      )}
    </div>
  );
}

export default AppAdmin;

//import './App.css';
//import Sidebar from './components/Sidebar/Sidebar';
//import Header from './components/Header/Header';
//import DatabaseUpdate from './components/DatabaseUpdate/DatabaseUpdate';
//import FeedbackExport from './components/FeedbackExport/FeedbackExport';
//import { useState } from 'react';

//function App() {
//  const [activeTab, setActiveTab] = useState(1);
//  const [sidebarOpen, setSidebarOpen] = useState(true);

//  const handleMenuToggle = () => {
//    setSidebarOpen((prev) => !prev);
//  };

//  return (
//    <div className="app">
//      <Sidebar
//        activeTab={activeTab}
//        setActiveTab={setActiveTab}
//        isOpen={sidebarOpen}
//        onMenuToggle={handleMenuToggle}
//      />
//      <div className="main-content">
//        <Header activeTab={activeTab} onMenuToggle={handleMenuToggle} />
//        {activeTab === 1 && <DatabaseUpdate />}
//        {activeTab === 2 && <FeedbackExport />}
//      </div>
//    </div>
//  );
//}

//export default App;


