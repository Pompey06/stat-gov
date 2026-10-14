import { useId, useState } from "react";
import PropTypes from "prop-types";
import Button from "../Button/Button";
import LocalizedFields from "../LocalizedFields/LocalizedFields";
import FaqEditor from "../FaqEditor/FaqEditor";
import "./FaqItemEditor.css";

const previewText = (item) =>
  item.question?.ru || item.question?.kz || item.question?.en || "…";

const FaqItemEditor = ({ item, onChange, onDelete, texts, depth }) => {
  const bodyId = useId();
  const [isOpen, setIsOpen] = useState(
    () => !item.question?.ru && !item.question?.kz && !item.question?.en,
  );

  const updateField = (field, value) => onChange({ ...item, [field]: value });

  const handleDelete = () => {
    if (window.confirm(texts.confirmDeleteQuestion)) {
      onDelete();
    }
  };

  return (
    <div className={`faq-item faq-item_depth-${Math.min(depth, 3)}`}>
      <button
        type="button"
        className="faq-item__header"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
      >
        <span className={`faq-item__arrow ${isOpen ? "faq-item__arrow_open" : ""}`}>
          {isOpen ? "▼" : "▶"}
        </span>
        <span className="faq-item__preview">{previewText(item)}</span>
      </button>

      {isOpen && (
        <div className="faq-item__body" id={bodyId}>
          <LocalizedFields
            label={texts.question}
            value={item.question}
            onChange={(value) => updateField("question", value)}
            as="input"
          />
          <LocalizedFields
            label={texts.answer}
            value={item.answer}
            onChange={(value) => updateField("answer", value)}
            as="textarea"
          />

          <div className="faq-item__subquestions">
            <div className="faq-item__section-label">{texts.subquestions}</div>
            <FaqEditor
              items={item.subquestions || []}
              onChange={(next) => updateField("subquestions", next)}
              texts={texts}
              depth={depth + 1}
            />
          </div>

          <Button type="button" className="faq-item__delete" onClick={handleDelete}>
            {texts.deleteQuestion}
          </Button>
        </div>
      )}
    </div>
  );
};

FaqItemEditor.propTypes = {
  item: PropTypes.shape({
    question: PropTypes.object,
    answer: PropTypes.object,
    subquestions: PropTypes.array,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  texts: PropTypes.object.isRequired,
  depth: PropTypes.number,
};

FaqItemEditor.defaultProps = {
  depth: 0,
};

export default FaqItemEditor;
