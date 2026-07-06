import PropTypes from "prop-types";
import Sidebar from "../Sidebar/Sidebar";
import burgerIcon from "../../assets/burgerIcon.svg";
import "./AdminLayout.css";

const AdminLayout = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  onMenuToggle,
  children,
}) => (
  <div className="admin-layout">
    <Sidebar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isOpen={sidebarOpen}
      onMenuToggle={onMenuToggle}
    />
    <div className="admin-layout__main">
      <button
        type="button"
        className="admin-layout__mobile-menu show-768"
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        <img src={burgerIcon} alt="" />
      </button>
      <div className="admin-layout__content">{children}</div>
    </div>
  </div>
);

AdminLayout.propTypes = {
  activeTab: PropTypes.number.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired,
  onMenuToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default AdminLayout;
