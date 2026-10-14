import PropTypes from "prop-types";
import "./LocalizedFields.css";

const LANGS = [
  { key: "ru", label: "RU" },
  { key: "kz", label: "KZ" },
  { key: "en", label: "EN" },
];

const LocalizedFields = ({ label, value, onChange, as = "input" }) => {
  const Field = as === "textarea" ? "textarea" : "input";

  return (
    <div className="localized-fields">
      {label && <div className="localized-fields__label">{label}</div>}
      <div className="localized-fields__rows">
        {LANGS.map(({ key, label: langLabel }) => (
          <label key={key} className="localized-fields__row">
            <span className="localized-fields__lang">{langLabel}</span>
            <Field
              className="localized-fields__control"
              value={value?.[key] ?? ""}
              onChange={(event) => onChange({ ...value, [key]: event.target.value })}
              rows={as === "textarea" ? 3 : undefined}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

LocalizedFields.propTypes = {
  label: PropTypes.string,
  value: PropTypes.shape({
    ru: PropTypes.string,
    kz: PropTypes.string,
    en: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  as: PropTypes.oneOf(["input", "textarea"]),
};

export default LocalizedFields;
