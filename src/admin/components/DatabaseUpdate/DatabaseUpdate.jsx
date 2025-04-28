// src/components/DatabaseUpdate/DatabaseUpdate.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation, Trans } from "react-i18next";
import Button from "../Button/Button";
import uploadIcon from "../../assets/uploadIcon.svg";
import fileIcon from "../../assets/csv.svg";
import crossIcon from "../../assets/cross.svg";
import "./DatabaseUpdate.css";
import { useApi } from "../../components/Context/Context";
import adminI18n from "../../i18n";

export const FileUploadBlock = ({
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
                        <img src={fileIcon} alt="File Icon" className="file-preview-icon" />
                        <div className="file-preview-info">
                           <p className="file-name">{selectedFile.name}</p>
                           <p className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <img src={crossIcon} alt="Remove file" className="file-remove-icon" onClick={onFileRemove} />
                     </div>
                     {uploadProgress !== null && (
                        <div className="upload-progress">
                           <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                           <span className="upload-progress-text">{uploadProgress}%</span>
                        </div>
                     )}
                  </div>
               ) : (
                  <div
                     className="file-upload-field"
                     onClick={() => document.getElementById(`${title}-fileInput`).click()}
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
         <Button type="button" className="upload-button" onClick={onButtonClick}>
            {buttonText || t("databaseUpdate.uploadButtonText")}
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
};

const DatabaseUpdate = ({ credentials }) => {
   const { t } = useTranslation(undefined, { i18n: adminI18n });
   const api = useApi();

   const [newQAFile, setNewQAFile] = useState(null);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [uploadStarted, setUploadStarted] = useState(false);
   const [uploadStatus, setUploadStatus] = useState(null); // null | "success" | "error"
   const [uploadResult, setUploadResult] = useState(null); // holds response.data

   const handleExport = async () => {
      if (!credentials) {
         console.error("Учётные данные не заданы");
         return;
      }
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

      setUploadStarted(true);
      setUploadProgress(0);
      setUploadStatus(null);
      setUploadResult(null);

      const startTime = Date.now();
      let totalDuration = null;
      let resolveSimulation;
      const simulationDone = new Promise((res) => {
         resolveSimulation = res;
      });
      let frameId;

      // progress animation
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
         {/* Первый блок: выгрузка старой базы */}
         <FileUploadBlock
            title={t("databaseUpdate.oldDbTitle")}
            subtitle={t("databaseUpdate.oldDbSubtitle")}
            fileFieldText={t("databaseUpdate.oldDbFileFieldText")}
            hideFileUploadField={true}
            buttonText={t("databaseUpdate.exportButtonText")}
            onButtonClick={handleExport}
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
            </div>
         ) : uploadStatus === "error" ? (
            <div className="upload-message error">{t("databaseUpdate.uploadErrorMessage")}</div>
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
