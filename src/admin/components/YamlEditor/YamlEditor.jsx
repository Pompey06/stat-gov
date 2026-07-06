import { useMemo } from "react";
import PropTypes from "prop-types";
import CodeMirror from "@uiw/react-codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { createYamlSchemaLinter } from "../../utils/yamlSchemaLinter";
import "./YamlEditor.css";

const YamlEditor = ({ value, onChange, schema = null, errors = [], readOnly = false }) => {
  const extensions = useMemo(() => {
    const items = [yaml()];

    if (schema) {
      items.push(createYamlSchemaLinter(schema));
    }

    return items;
  }, [schema]);

  return (
    <div
      className={`yaml-editor-wrap${
        errors.length ? " yaml-editor-wrap_error" : ""
      }`}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        readOnly={readOnly}
        minHeight="520px"
        className="yaml-editor"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
        }}
      />
      {errors.length > 0 && (
        <ul className="yaml-editor__errors">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

YamlEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.object,
  errors: PropTypes.arrayOf(PropTypes.string),
  readOnly: PropTypes.bool,
};

export default YamlEditor;
