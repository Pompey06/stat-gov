import PropTypes from "prop-types";
import Button from "../Button/Button";
import { isPathInStorage } from "../../utils/storagePaths";

const CREATE_STEP = {
  UPLOAD_RU: "upload_ru",
  UPLOAD_KZ: "upload_kz",
  CONFIGURE: "configure",
};

const PathField = ({
  label,
  path,
  field,
  fileId,
  exists,
  text,
  uploadingPath,
  downloadingPath,
  readOnly = false,
  hideActions = false,
  suppressMissing = false,
  onFieldChange,
  onUpload,
  onDownload,
}) => {
  const hasPath = Boolean(String(path || "").trim());
  const isUploading = hasPath && uploadingPath === path;
  const isDownloading = hasPath && downloadingPath === path;

  return (
    <div className="file-details__field">
      <div className="file-details__label-row">
        <span className="file-details__label">{label}</span>
        {hasPath && !exists && !suppressMissing && (
          <span
            className="file-details__missing"
            title={text.fileMissing}
            aria-label={text.fileMissing}
          >
            ×
          </span>
        )}
      </div>
      <input
        type="text"
        className="file-details__input"
        value={path}
        readOnly={readOnly}
        onChange={(event) => onFieldChange(fileId, field, event.target.value)}
      />
      {!readOnly && !hideActions && (
        <div className="file-details__path-actions">
          <label
            className={`file-details__path-button${
              !hasPath || isUploading ? " file-details__path-button_disabled" : ""
            }`}
          >
            <input
              type="file"
              className="file-details__file-input"
              disabled={!hasPath || isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(path, file);
                event.target.value = "";
              }}
            />
            {isUploading ? text.loading : text.upload}
          </label>
          <button
            type="button"
            className="file-details__path-button"
            onClick={() => onDownload(path)}
            disabled={!hasPath || isDownloading}
          >
            {isDownloading ? text.loading : text.download}
          </button>
        </div>
      )}
    </div>
  );
};

PathField.propTypes = {
  label: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  fileId: PropTypes.string.isRequired,
  exists: PropTypes.bool.isRequired,
  text: PropTypes.object.isRequired,
  uploadingPath: PropTypes.string.isRequired,
  downloadingPath: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  hideActions: PropTypes.bool,
  suppressMissing: PropTypes.bool,
  onFieldChange: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

const DraftUploadStep = ({
  hint,
  buttonLabel,
  disabled,
  onSelect,
  onCancel,
  cancelLabel,
}) => (
  <>
    <p className="file-details__hint">{hint}</p>
    <label
      className={`file-details__upload-zone${
        disabled ? " file-details__upload-zone_disabled" : ""
      }`}
    >
      <input
        type="file"
        className="file-details__file-input"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = "";
        }}
      />
      {buttonLabel}
    </label>
    <button
      type="button"
      className="file-details__path-button file-details__cancel"
      onClick={onCancel}
      disabled={disabled}
    >
      {cancelLabel}
    </button>
  </>
);

DraftUploadStep.propTypes = {
  hint: PropTypes.string.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  cancelLabel: PropTypes.string.isRequired,
};

const FileDetails = ({
  file,
  isNew,
  storagePaths,
  text,
  savingId,
  deletingId,
  uploadingPath,
  downloadingPath,
  isChanged,
  onFieldChange,
  onSave,
  onCreate,
  onCancelCreate,
  onDraftRuSelect,
  onDraftKzSelect,
  onSkipKzUpload,
  onDelete,
  onUpload,
  onDownload,
}) => {
  if (!file) {
    return (
      <div className="file-details file-details_empty">
        <p>{text.selectFile}</p>
        <p className="file-details__hint">{text.selectFileHint}</p>
      </div>
    );
  }

  if (isNew) {
    const isBusy = Boolean(savingId);

    if (file.createStep === CREATE_STEP.UPLOAD_RU) {
      return (
        <div className="file-details">
          <h3 className="file-details__title">{text.newFile}</h3>
          <DraftUploadStep
            hint={text.createStepRuHint}
            buttonLabel={text.selectRuFile}
            disabled={isBusy}
            onSelect={onDraftRuSelect}
            onCancel={onCancelCreate}
            cancelLabel={text.cancel}
          />
        </div>
      );
    }

    if (file.createStep === CREATE_STEP.UPLOAD_KZ) {
      return (
        <div className="file-details">
          <h3 className="file-details__title">{text.newFile}</h3>
          <PathField
            label={text.pathRu}
            path={file.path_ru}
            field="path_ru"
            fileId={file.id}
            exists={false}
            text={text}
            uploadingPath={uploadingPath}
            downloadingPath={downloadingPath}
            readOnly
            suppressMissing
            onFieldChange={onFieldChange}
            onUpload={onUpload}
            onDownload={onDownload}
          />
          {file.pendingRuFile?.name && (
            <p className="file-details__selected">
              {text.selectedFile}: {file.pendingRuFile.name}
            </p>
          )}
          <DraftUploadStep
            hint={text.createStepKzHint}
            buttonLabel={text.selectKzFile}
            disabled={isBusy}
            onSelect={onDraftKzSelect}
            onCancel={onCancelCreate}
            cancelLabel={text.cancel}
          />
          <button
            type="button"
            className="file-details__path-button file-details__skip"
            onClick={onSkipKzUpload}
            disabled={isBusy}
          >
            {text.skipKz}
          </button>
        </div>
      );
    }

    return (
      <div className="file-details">
        <h3 className="file-details__title">{text.newFile}</h3>
        <p className="file-details__hint">{text.createStepConfigureHint}</p>

        {file.pendingRuFile?.name && (
          <p className="file-details__selected">
            {text.pathRu}: {file.pendingRuFile.name}
          </p>
        )}
        {file.pendingKzFile?.name && (
          <p className="file-details__selected">
            {text.pathKz}: {file.pendingKzFile.name}
          </p>
        )}

        <PathField
          label={text.pathRu}
          path={file.path_ru}
          field="path_ru"
          fileId={file.id}
          exists={false}
          text={text}
          uploadingPath={uploadingPath}
          downloadingPath={downloadingPath}
          hideActions
          suppressMissing
          onFieldChange={onFieldChange}
          onUpload={onUpload}
          onDownload={onDownload}
        />

        <PathField
          label={text.pathKz}
          path={file.path_kz}
          field="path_kz"
          fileId={file.id}
          exists={false}
          text={text}
          uploadingPath={uploadingPath}
          downloadingPath={downloadingPath}
          hideActions
          suppressMissing
          onFieldChange={onFieldChange}
          onUpload={onUpload}
          onDownload={onDownload}
        />

        <label className="file-details__field">
          <span className="file-details__label">{text.keyword}</span>
          <input
            type="text"
            className="file-details__input"
            value={file.keyword}
            onChange={(event) =>
              onFieldChange(file.id, "keyword", event.target.value)
            }
          />
        </label>

        <div className="file-details__actions">
          <Button
            type="button"
            className="file-details__action file-details__action_primary"
            onClick={() => onCreate(file)}
            disabled={isBusy || !file.path_ru.trim() || !file.pendingRuFile}
          >
            {isBusy ? text.loading : text.create}
          </Button>
          <button
            type="button"
            className="file-details__path-button file-details__cancel"
            onClick={onCancelCreate}
            disabled={isBusy}
          >
            {text.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-details">
      <h3 className="file-details__title">{text.fileDetails}</h3>

      <PathField
        label={text.pathRu}
        path={file.path_ru}
        field="path_ru"
        fileId={file.id}
        exists={isPathInStorage(storagePaths, file.path_ru)}
        text={text}
        uploadingPath={uploadingPath}
        downloadingPath={downloadingPath}
        onFieldChange={onFieldChange}
        onUpload={onUpload}
        onDownload={onDownload}
      />

      <PathField
        label={text.pathKz}
        path={file.path_kz}
        field="path_kz"
        fileId={file.id}
        exists={isPathInStorage(storagePaths, file.path_kz)}
        text={text}
        uploadingPath={uploadingPath}
        downloadingPath={downloadingPath}
        onFieldChange={onFieldChange}
        onUpload={onUpload}
        onDownload={onDownload}
      />

      <label className="file-details__field">
        <span className="file-details__label">{text.keyword}</span>
        <input
          type="text"
          className="file-details__input"
          value={file.keyword}
          onChange={(event) =>
            onFieldChange(file.id, "keyword", event.target.value)
          }
        />
      </label>

      {file.deleted && (
        <span className="file-details__badge">{text.deleted}</span>
      )}

      <div className="file-details__actions">
        <Button
          type="button"
          className="file-details__action file-details__action_primary"
          onClick={() => onSave(file)}
          disabled={savingId === file.id || deletingId === file.id || !isChanged}
        >
          {savingId === file.id ? text.loading : text.save}
        </Button>
        <button
          type="button"
          className="file-details__path-button file-details__delete"
          onClick={() => onDelete(file)}
          disabled={savingId === file.id || deletingId === file.id}
        >
          {deletingId === file.id ? text.loading : text.delete}
        </button>
      </div>

      <p className="file-details__hint">{text.renameHint}</p>
    </div>
  );
};

FileDetails.propTypes = {
  file: PropTypes.object,
  isNew: PropTypes.bool.isRequired,
  storagePaths: PropTypes.instanceOf(Set).isRequired,
  text: PropTypes.object.isRequired,
  savingId: PropTypes.string.isRequired,
  deletingId: PropTypes.string.isRequired,
  uploadingPath: PropTypes.string.isRequired,
  downloadingPath: PropTypes.string.isRequired,
  isChanged: PropTypes.bool.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onCancelCreate: PropTypes.func.isRequired,
  onDraftRuSelect: PropTypes.func.isRequired,
  onDraftKzSelect: PropTypes.func.isRequired,
  onSkipKzUpload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default FileDetails;
