import PropTypes from 'prop-types';
import './SidebarButton.css';

const SidebarButton = ({ icon, text, active, onClick }) => {
  const isImageIcon = typeof icon === "string";

  return (
    <button
      className={`sidebar-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {isImageIcon ? (
        <img src={icon} alt={text} className="sidebar-button-icon" />
      ) : (
        <span className="sidebar-button-icon sidebar-button-icon-node">{icon}</span>
      )}
      <span className="sidebar-button-text">{text}</span>
    </button>
  );
};

SidebarButton.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};

SidebarButton.defaultProps = {
  active: false,
};

export default SidebarButton;
