import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const FileTreeFileRow = ({
  file,
  label,
  depth,
  selectedFileId,
  editingFileId,
  renameValue,
  text,
  onSelect,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
}) => {
  const inputRef = useRef(null);
  const isSelected = selectedFileId === file.id;
  const isEditing = editingFileId === file.id;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onRenameCommit(file.id);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onRenameCancel();
    }
  };

  return (
    <div
      role="treeitem"
      aria-selected={isSelected}
      className={`file-tree__row file-tree__row_file${
        isSelected ? " file-tree__row_selected" : ""
      }${file.deleted ? " file-tree__row_deleted" : ""}`}
      style={{ "--depth": depth }}
      onClick={() => onSelect(file.id)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onRenameStart(file.id, label);
      }}
    >
      <span className="file-tree__twistie" aria-hidden />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="file-tree__rename"
          value={renameValue}
          onChange={(event) => onRenameChange(event.target.value)}
          onBlur={() => onRenameCommit(file.id)}
          onKeyDown={handleKeyDown}
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <span className="file-tree__label" title={file.path_ru}>
          {label}
        </span>
      )}
      {file.deleted && (
        <span className="file-tree__badge">{text.deleted}</span>
      )}
    </div>
  );
};

const FileTreeNode = ({
  node,
  depth,
  expanded,
  selectedFileId,
  editingFileId,
  renameValue,
  text,
  onToggle,
  onSelect,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
}) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.fullPath);

  if (hasChildren) {
    return (
      <li className="file-tree__branch" role="none">
        <div
          role="treeitem"
          aria-expanded={isExpanded}
          className="file-tree__row file-tree__row_folder"
          style={{ "--depth": depth }}
        >
          <button
            type="button"
            className="file-tree__twistie"
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
            onClick={() => onToggle(node.fullPath)}
          >
            <span
              className={`file-tree__chevron${
                isExpanded ? " file-tree__chevron_open" : ""
              }`}
            />
          </button>
          <button
            type="button"
            className="file-tree__label file-tree__label_button"
            onClick={() => onToggle(node.fullPath)}
          >
            {node.name}
          </button>
        </div>
        {isExpanded && (
          <ul className="file-tree__group" role="group">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.fullPath}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                selectedFileId={selectedFileId}
                editingFileId={editingFileId}
                renameValue={renameValue}
                text={text}
                onToggle={onToggle}
                onSelect={onSelect}
                onRenameStart={onRenameStart}
                onRenameChange={onRenameChange}
                onRenameCommit={onRenameCommit}
                onRenameCancel={onRenameCancel}
              />
            ))}
            {node.file && (
              <li role="none">
                <FileTreeFileRow
                  file={node.file}
                  label={node.name}
                  depth={depth + 1}
                  selectedFileId={selectedFileId}
                  editingFileId={editingFileId}
                  renameValue={renameValue}
                  text={text}
                  onSelect={onSelect}
                  onRenameStart={onRenameStart}
                  onRenameChange={onRenameChange}
                  onRenameCommit={onRenameCommit}
                  onRenameCancel={onRenameCancel}
                />
              </li>
            )}
          </ul>
        )}
      </li>
    );
  }

  if (!node.file) return null;

  return (
    <li role="none">
      <FileTreeFileRow
        file={node.file}
        label={node.name}
        depth={depth}
        selectedFileId={selectedFileId}
        editingFileId={editingFileId}
        renameValue={renameValue}
        text={text}
        onSelect={onSelect}
        onRenameStart={onRenameStart}
        onRenameChange={onRenameChange}
        onRenameCommit={onRenameCommit}
        onRenameCancel={onRenameCancel}
      />
    </li>
  );
};

const FileTree = ({
  roots,
  orphans,
  expanded,
  selectedFileId,
  editingFileId,
  renameValue,
  text,
  onToggle,
  onSelect,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
}) => (
  <div className="file-tree" role="tree">
    <ul className="file-tree__roots" role="none">
      {roots.map((node) => (
        <FileTreeNode
          key={node.fullPath}
          node={node}
          depth={0}
          expanded={expanded}
          selectedFileId={selectedFileId}
          editingFileId={editingFileId}
          renameValue={renameValue}
          text={text}
          onToggle={onToggle}
          onSelect={onSelect}
          onRenameStart={onRenameStart}
          onRenameChange={onRenameChange}
          onRenameCommit={onRenameCommit}
          onRenameCancel={onRenameCancel}
        />
      ))}
      {orphans.length > 0 && (
        <li className="file-tree__branch" role="none">
          <div
            className="file-tree__row file-tree__row_folder"
            style={{ "--depth": 0 }}
          >
            <span className="file-tree__twistie" aria-hidden />
            <span className="file-tree__label">{text.noPath}</span>
          </div>
          <ul className="file-tree__group" role="group">
            {orphans.map((file) => (
              <li key={file.id || file.storage_key} role="none">
                <FileTreeFileRow
                  file={file}
                  label={file.storage_key || text.notSpecified}
                  depth={1}
                  selectedFileId={selectedFileId}
                  editingFileId={editingFileId}
                  renameValue={renameValue}
                  text={text}
                  onSelect={onSelect}
                  onRenameStart={onRenameStart}
                  onRenameChange={onRenameChange}
                  onRenameCommit={onRenameCommit}
                  onRenameCancel={onRenameCancel}
                />
              </li>
            ))}
          </ul>
        </li>
      )}
    </ul>
  </div>
);

const sharedPropTypes = {
  expanded: PropTypes.instanceOf(Set).isRequired,
  selectedFileId: PropTypes.string.isRequired,
  editingFileId: PropTypes.string.isRequired,
  renameValue: PropTypes.string.isRequired,
  text: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onRenameStart: PropTypes.func.isRequired,
  onRenameChange: PropTypes.func.isRequired,
  onRenameCommit: PropTypes.func.isRequired,
  onRenameCancel: PropTypes.func.isRequired,
};

FileTree.propTypes = {
  roots: PropTypes.arrayOf(PropTypes.object).isRequired,
  orphans: PropTypes.arrayOf(PropTypes.object).isRequired,
  ...sharedPropTypes,
};

FileTreeNode.propTypes = {
  node: PropTypes.object.isRequired,
  depth: PropTypes.number.isRequired,
  ...sharedPropTypes,
};

FileTreeFileRow.propTypes = {
  file: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  depth: PropTypes.number.isRequired,
  selectedFileId: PropTypes.string.isRequired,
  editingFileId: PropTypes.string.isRequired,
  renameValue: PropTypes.string.isRequired,
  text: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onRenameStart: PropTypes.func.isRequired,
  onRenameChange: PropTypes.func.isRequired,
  onRenameCommit: PropTypes.func.isRequired,
  onRenameCancel: PropTypes.func.isRequired,
};

export default FileTree;
