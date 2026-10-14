import { useId, useState } from "react";
import PropTypes from "prop-types";
import LocalizedFields from "../LocalizedFields/LocalizedFields";
import FaqEditor from "../FaqEditor/FaqEditor";
import Button from "../Button/Button";
import { emptyLocalized } from "../FaqItemEditor/faqItemDefaults";
import "./CategoryEditor.css";

const previewText = (category) =>
  category.name?.ru || category.name?.kz || category.name?.en || "…";

const CategoryEditor = ({ category, onChange, onDelete, texts }) => {
  const bodyId = useId();
  const [isOpen, setIsOpen] = useState(
    () => !category.name?.ru && !category.name?.kz && !category.name?.en,
  );

  const updateField = (field, value) => onChange({ ...category, [field]: value });

  const updateSubcategory = (index, nextSub) => {
    const next = (category.subcategories || []).slice();
    next[index] = nextSub;
    updateField("subcategories", next);
  };

  const updateReport = (subIndex, reportIndex, nextReport) => {
    const sub = category.subcategories[subIndex];
    const nextReports = (sub.reports || []).slice();
    nextReports[reportIndex] = nextReport;
    updateSubcategory(subIndex, { ...sub, reports: nextReports });
  };

  const addSubcategory = () =>
    updateField("subcategories", [
      ...(category.subcategories || []),
      { name: emptyLocalized(), reports: [] },
    ]);

  const deleteSubcategory = (index) => {
    if (!window.confirm(texts.confirmDeleteSubcategory)) return;
    updateField("subcategories", category.subcategories.filter((_, i) => i !== index));
  };

  const addReport = (subIndex) => {
    const sub = category.subcategories[subIndex];
    updateSubcategory(subIndex, { ...sub, reports: [...(sub.reports || []), emptyLocalized()] });
  };

  const deleteReport = (subIndex, reportIndex) => {
    const sub = category.subcategories[subIndex];
    updateSubcategory(subIndex, {
      ...sub,
      reports: sub.reports.filter((_, i) => i !== reportIndex),
    });
  };

  return (
    <div className="category-editor">
      <button
        type="button"
        className="category-editor__header"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
      >
        <span className={`category-editor__arrow ${isOpen ? "category-editor__arrow_open" : ""}`}>
          {isOpen ? "▼" : "▶"}
        </span>
        <span className="category-editor__preview">{previewText(category)}</span>
      </button>

      {isOpen && (
        <div className="category-editor__body" id={bodyId}>
          <LocalizedFields
            label={texts.categoryName}
            value={category.name}
            onChange={(value) => updateField("name", value)}
            as="input"
          />

          <div className="category-editor__block">
            <div className="category-editor__section-label">{texts.subcategories}</div>
            {(category.subcategories || []).map((sub, subIndex) => (
              <div key={subIndex} className="category-editor__subcategory">
                <LocalizedFields
                  label={texts.subcategoryName}
                  value={sub.name}
                  onChange={(value) => updateSubcategory(subIndex, { ...sub, name: value })}
                  as="input"
                />
                <div className="category-editor__reports">
                  <div className="category-editor__section-label">{texts.reports}</div>
                  {(sub.reports || []).map((report, reportIndex) => (
                    <div key={reportIndex} className="category-editor__report">
                      <LocalizedFields
                        value={report}
                        onChange={(value) => updateReport(subIndex, reportIndex, value)}
                        as="input"
                      />
                      <Button
                        type="button"
                        className="category-editor__action category-editor__action_delete"
                        onClick={() => deleteReport(subIndex, reportIndex)}
                      >
                        {texts.deleteReport}
                      </Button>
                    </div>
                  ))}
                  <Button type="button" className="category-editor__action" onClick={() => addReport(subIndex)}>
                    {texts.addReport}
                  </Button>
                </div>
                <Button
                  type="button"
                  className="category-editor__action category-editor__action_delete"
                  onClick={() => deleteSubcategory(subIndex)}
                >
                  {texts.deleteSubcategory}
                </Button>
              </div>
            ))}
            <Button type="button" className="category-editor__action" onClick={addSubcategory}>
              {texts.addSubcategory}
            </Button>
          </div>

          <div className="category-editor__block">
            <div className="category-editor__section-label">{texts.categoryFaq}</div>
            <FaqEditor
              items={category.faq || []}
              onChange={(next) => updateField("faq", next)}
              texts={texts}
              depth={0}
            />
          </div>
          <Button
            type="button"
            className="category-editor__action category-editor__action_delete"
            onClick={() => {
              if (window.confirm(texts.confirmDeleteCategory)) onDelete();
            }}
          >
            {texts.deleteCategory}
          </Button>
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
  onDelete: PropTypes.func.isRequired,
  texts: PropTypes.object.isRequired,
};

export default CategoryEditor;
