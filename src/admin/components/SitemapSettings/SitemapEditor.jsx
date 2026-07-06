import { useMemo } from "react";
import PropTypes from "prop-types";
import CodeMirror from "@uiw/react-codemirror";
import "./SitemapEditor.css";

const SitemapEditor = ({ value, onChange, readOnly = false }) => {
  const extensions = useMemo(() => [], []);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      readOnly={readOnly}
      minHeight="520px"
      className="sitemap-editor"
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        bracketMatching: true,
      }}
    />
  );
};

SitemapEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default SitemapEditor;
