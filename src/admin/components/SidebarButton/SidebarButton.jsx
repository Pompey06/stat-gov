import PropTypes from 'prop-types';
import './SidebarButton.css';

const SidebarButton = ({ icon, text, active, onClick }) => {
  return (
    <button
      className={`sidebar-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <img src={icon} alt={text} className="sidebar-button-icon" />
      <span className="sidebar-button-text">{text}</span>
    </button>
  );
};

SidebarButton.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};

SidebarButton.defaultProps = {
  active: false,
};

export default SidebarButton;
