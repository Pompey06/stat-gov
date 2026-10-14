import PropTypes from "prop-types";
import Button from "../Button/Button";
import FaqItemEditor from "../FaqItemEditor/FaqItemEditor";
import { createEmptyFaqItem } from "../FaqItemEditor/faqItemDefaults";
import "./FaqEditor.css";

const FaqEditor = ({ items, onChange, texts, depth }) => {
  const handleItemChange = (index, nextItem) => {
    const next = items.slice();
    next[index] = nextItem;
    onChange(next);
  };

  const handleDelete = (index) => {
    const next = items.slice();
    next.splice(index, 1);
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...items, createEmptyFaqItem()]);
  };

  return (
    <div className="faq-editor">
      {items.length === 0 && <div className="faq-editor__empty">{texts.noQuestions}</div>}

      {items.map((item, index) => (
        <FaqItemEditor
          key={index}
          item={item}
          onChange={(next) => handleItemChange(index, next)}
          onDelete={() => handleDelete(index)}
          texts={texts}
          depth={depth}
        />
      ))}

      <Button type="button" className="faq-editor__add" onClick={handleAdd}>
        {depth > 0 ? texts.addSubquestion : texts.addQuestion}
      </Button>
    </div>
  );
};

FaqEditor.propTypes = {
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  texts: PropTypes.object.isRequired,
  depth: PropTypes.number,
};

FaqEditor.defaultProps = {
  depth: 0,
};

export default FaqEditor;
