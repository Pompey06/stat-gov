import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ type = 'button', onClick, children, className = '', ...props }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
   type: PropTypes.string,       
   onClick: PropTypes.func,     
   children: PropTypes.node.isRequired,
   className: PropTypes.string,
 };

export default Button;