import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation, Trans } from "react-i18next";
import Button from "../Button/Button";
import uploadIcon from "../../assets/uploadIcon.svg";
import fileIcon from "../../assets/csv.svg";
import crossIcon from "../../assets/cross.svg";
import "./DatabaseUpdate.css";
import { useApi } from "../../components/Context/Context";
import adminI18n from "../../i18n";

// Если вы вынесли FileUploadBlock в отдельный файл, убедитесь, что он импортирован:
// import { FileUploadBlock } from "./FileUploadBlock";
const FileUploadBlock = ({
  title,
  subtitle,
  fileFieldText,
  hideFileUploadField,
  buttonText,
  onButtonClick,
  onFileSelect,
  selectedFile,
  onFileRemove,
  uploadProgress,
  loading = false,
}) => {
  const { t } = useTranslation(undefined, { i18n: adminI18n });

  const handleFileChange = (e) => {
    if (onFileSelect && e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFileSelect && e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="upload-block">
      <h2 className="upload-title">{title}</h2>
      <p className="upload-subtitle">{subtitle}</p>
      {!hideFileUploadField && (
        <>
          {selectedFile ? (
            <div className="file-preview">
              <div className="file-preview-header">
                <img
                  src={fileIcon}
                  alt="File Icon"
                  className="file-preview-icon"
                />
                <div className="file-preview-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <img
                  src={crossIcon}
                  alt="Remove file"
                  className="file-remove-icon"
                  onClick={onFileRemove}
                />
              </div>
              {uploadProgress !== null && (
                <div className="upload-progress">
                  <div
                    className="upload-progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <span className="upload-progress-text">
                    {uploadProgress}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="file-upload-field"
              onClick={() =>
                document.getElementById(`${title}-fileInput`).click()
              }
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img src={uploadIcon} alt="Upload" className="upload-icon" />
              <p className="upload-field-format">xlsx</p>
              <p className="upload-field-text">{fileFieldText}</p>
              <input
                type="file"
                id={`${title}-fileInput`}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          )}
        </>
      )}
      <Button
        type="button"
        className="db-upload-button"
        onClick={onButtonClick}
        disabled={loading}
      >
        {loading ? (
          <span className="loader loader_inline" />
        ) : (
          buttonText || t("databaseUpdate.uploadButtonText")
        )}
      </Button>
    </div>
  );
};

FileUploadBlock.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  fileFieldText: PropTypes.string.isRequired,
  hideFileUploadField: PropTypes.bool,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
  onFileSelect: PropTypes.func,
  selectedFile: PropTypes.object,
  onFileRemove: PropTypes.func,
  uploadProgress: PropTypes.number,
  loading: PropTypes.bool,
};

const DatabaseUpdate = ({ credentials }) => {
  const { t } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();

  const [newQAFile, setNewQAFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStarted, setUploadStarted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // ← Здесь объявляем isExporting
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!credentials) {
      console.error("Учётные данные не заданы");
      return;
    }
    setIsExporting(true);
    const encoded = btoa(`${credentials.login}:${credentials.password}`);
    try {
      const res = await api.get("/knowledge/", {
        headers: { Authorization: `Basic ${encoded}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "knowledge.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Ошибка при экспорте файла:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewQAFileSelect = (file) => {
    setNewQAFile(file);
    setUploadProgress(0);
    setUploadStatus(null);
    setUploadResult(null);
  };

  const handleNewQAFileRemove = () => {
    setNewQAFile(null);
    setUploadProgress(0);
    setUploadStarted(false);
    setUploadStatus(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!newQAFile || !credentials) return;

    const USE_MOCK_UPLOAD_RESULT = false; // ← Поставь false для прода

    setUploadStarted(true);
    setUploadProgress(0);
    setUploadStatus(null);
    setUploadResult(null);

    // 💡 Мок-ответ (для отладки, без запроса на сервер)
    if (USE_MOCK_UPLOAD_RESULT) {
      const mock = {
        instructions_created: 1,
        instructions_deleted: 2,
        qa_created: 3,
        qa_deleted: 4,
        qa_updated: 5,
        files_changed: false,
        stats: {
          tables: [
            {
              name: "instruction",
              rows: 0,
              schema_hint:
                "text: string not null\nvector: fixed_size_list<item: float>[1536]\n  child 0, item: float\ncategory: string not null\nsubcategory: string not null",
            },
            {
              name: "qa",
              rows: 193,
              schema_hint:
                "question: string not null\nquestion_vector: fixed_size_list<item: float>[1536]\n  child 0, item: float\nanswer: string not null\nanswer_vector: fixed_size_list<item: float>[1536]\n  child 0, item: float\ncategory: string not null\nsubcategory: string not null",
            },
          ],
        },
      };

      setUploadResult(mock);
      setUploadStatus("success");
      setTimeout(() => {
        setUploadStatus(null);
        setNewQAFile(null);
        setUploadStarted(false);
        setUploadProgress(0);
      }, 20000);
      return;
    }

    const startTime = Date.now();
    let totalDuration = null;
    let resolveSimulation;
    const simulationDone = new Promise((res) => {
      resolveSimulation = res;
    });
    let frameId;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setUploadProgress(Math.round(pct));
      if (elapsed < totalDuration) {
        frameId = requestAnimationFrame(animate);
      } else {
        setUploadProgress(100);
        resolveSimulation();
      }
    };

    const encoded = btoa(`${credentials.login}:${credentials.password}`);
    const formData = new FormData();
    formData.append("knowledge_file", newQAFile);

    try {
      const uploadPromise = api.post("/knowledge/", formData, {
        headers: {
          Authorization: `Basic ${encoded}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          if (e.loaded === e.total && totalDuration === null) {
            const uploadDuration = Date.now() - startTime;
            totalDuration = uploadDuration + 15000;
            frameId = requestAnimationFrame(animate);
          }
        },
      });

      const [response] = await Promise.all([uploadPromise, simulationDone]);
      cancelAnimationFrame(frameId);

      setUploadResult(response.data);
      setUploadStatus("success");
      setTimeout(() => {
        setUploadStatus(null);
        setNewQAFile(null);
        setUploadStarted(false);
        setUploadProgress(0);
      }, 20000);
    } catch (err) {
      console.error("Ошибка при загрузке файла:", err);
      if (frameId) cancelAnimationFrame(frameId);
      setUploadStatus("error");
      setTimeout(() => {
        setUploadStatus(null);
        setUploadStarted(false);
      }, 20000);
    }
  };

  return (
    <div className="database-update">
      <FileUploadBlock
        title={t("databaseUpdate.oldDbTitle")}
        subtitle={t("databaseUpdate.oldDbSubtitle")}
        fileFieldText={t("databaseUpdate.oldDbFileFieldText")}
        hideFileUploadField={true}
        buttonText={t("databaseUpdate.exportButtonText")}
        onButtonClick={handleExport}
        loading={isExporting}
      />

      {uploadStatus === "success" && uploadResult ? (
        <div className="upload-message">
          <p>
            <Trans
              i18nKey="databaseUpdate.createdInstructions"
              count={uploadResult.instructions_created}
              components={[<strong key="count" />]}
            />
          </p>
          <p>
            <Trans
              i18nKey="databaseUpdate.deletedInstructions"
              count={uploadResult.instructions_deleted}
              components={[<strong key="count" />]}
            />
          </p>
          <p>
            <Trans
              i18nKey="databaseUpdate.createdQAPairs"
              count={uploadResult.qa_created}
              components={[<strong key="count" />]}
            />
          </p>
          <p>
            <Trans
              i18nKey="databaseUpdate.deletedQAPairs"
              count={uploadResult.qa_deleted}
              components={[<strong key="count" />]}
            />
          </p>
          <p>
            <Trans
              i18nKey="databaseUpdate.qaUpdated"
              count={uploadResult.qa_updated}
              components={[<strong key="count" />]}
            />
          </p>
        </div>
      ) : uploadStatus === "error" ? (
        <div className="upload-message error">
          {t("databaseUpdate.uploadErrorMessage")}
        </div>
      ) : (
        <FileUploadBlock
          title={t("databaseUpdate.newQATitle")}
          subtitle={t("databaseUpdate.newQASubtitle")}
          fileFieldText={t("databaseUpdate.newQAFileFieldText")}
          onFileSelect={handleNewQAFileSelect}
          selectedFile={newQAFile}
          onFileRemove={handleNewQAFileRemove}
          onButtonClick={handleUpload}
          uploadProgress={uploadStarted ? uploadProgress : null}
        />
      )}
    </div>
  );
};

DatabaseUpdate.propTypes = {
  credentials: PropTypes.shape({
    login: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
};

export default DatabaseUpdate;
