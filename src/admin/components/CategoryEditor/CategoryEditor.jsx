import { useState } from "react";
import PropTypes from "prop-types";
import LocalizedFields from "../LocalizedFields/LocalizedFields";
import FaqEditor from "../FaqEditor/FaqEditor";
import "./CategoryEditor.css";

const previewText = (category) =>
  category.name?.ru || category.name?.kz || category.name?.en || "…";

const CategoryEditor = ({ category, onChange, texts }) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateField = (field, value) => onChange({ ...category, [field]: value });

  const updateSubcategory = (index, nextSub) => {
    const next = (category.subcategories || []).slice();
    next[index] = nextSub;
    updateField("subcategories", next);
  };

  const updateReport = (subIndex, reportIndex, nextReport) => {
    const sub = category.subcategories[subIndex];
    const nextReports = sub.reports.slice();
    nextReports[reportIndex] = nextReport;
    updateSubcategory(subIndex, { ...sub, reports: nextReports });
  };

  return (
    <div className="category-editor">
      <button
        type="button"
        className="category-editor__header"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className={`category-editor__arrow ${isOpen ? "category-editor__arrow_open" : ""}`}>
          {isOpen ? "▼" : "▶"}
        </span>
        <span className="category-editor__preview">{previewText(category)}</span>
      </button>

      {isOpen && (
        <div className="category-editor__body">
          <LocalizedFields
            label={texts.categoryName}
            value={category.name}
            onChange={(value) => updateField("name", value)}
            as="input"
          />

          {(category.subcategories || []).length > 0 && (
            <div className="category-editor__block">
              <div className="category-editor__section-label">{texts.subcategories}</div>
              {category.subcategories.map((sub, subIndex) => (
                <div key={subIndex} className="category-editor__subcategory">
                  <LocalizedFields
                    label={texts.subcategoryName}
                    value={sub.name}
                    onChange={(value) => updateSubcategory(subIndex, { ...sub, name: value })}
                    as="input"
                  />
                  {(sub.reports || []).length > 0 && (
                    <div className="category-editor__reports">
                      <div className="category-editor__section-label">{texts.reports}</div>
                      {sub.reports.map((report, reportIndex) => (
                        <LocalizedFields
                          key={reportIndex}
                          value={report}
                          onChange={(value) => updateReport(subIndex, reportIndex, value)}
                          as="input"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="category-editor__block">
            <div className="category-editor__section-label">{texts.categoryFaq}</div>
            <FaqEditor
              items={category.faq || []}
              onChange={(next) => updateField("faq", next)}
              texts={texts}
              depth={0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

CategoryEditor.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.object,
    subcategories: PropTypes.array,
    faq: PropTypes.array,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  texts: PropTypes.object.isRequired,
};

export default CategoryEditor;
