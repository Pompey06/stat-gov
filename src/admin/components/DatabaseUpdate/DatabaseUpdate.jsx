// src/components/DatabaseUpdate/DatabaseUpdate.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
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
            {buttonText ? buttonText : t("databaseUpdate.uploadButtonText")}
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

   // <-- Добавил это состояние -->
   const [uploadStatus, setUploadStatus] = useState(null); // null | "success" | "error"

   const handleExport = async () => {
      if (!credentials) {
         console.error("Учётные данные не заданы");
         return;
      }
      const encodedCredentials = btoa(`${credentials.login}:${credentials.password}`);
      try {
         const response = await api.get("/knowledge/", {
            headers: {
               Authorization: `Basic ${encodedCredentials}`,
            },
            responseType: "blob",
         });
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement("a");
         link.href = url;
         link.setAttribute("download", "knowledge.xlsx");
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      } catch (error) {
         console.error("Ошибка при экспорте файла:", error);
      }
   };

   const handleNewQAFileSelect = (file) => {
      console.log("Выбран файл для новых вопросов и ответов:", file);
      setNewQAFile(file);
      setUploadProgress(0);
      // <-- сбрасываем статус при выборе нового файла -->
      setUploadStatus(null);
   };

   const handleNewQAFileRemove = () => {
      setNewQAFile(null);
      setUploadProgress(0);
      setUploadStarted(false);
      setUploadStatus(null);
   };

   const handleUpload = async () => {
      if (!newQAFile) return;
      if (!credentials) {
         console.error("Учётные данные не заданы");
         return;
      }

      setUploadStarted(true);
      setUploadProgress(0);
      // <-- сброс статуса перед новой загрузкой -->
      setUploadStatus(null);

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

      const encodedCredentials = btoa(`${credentials.login}:${credentials.password}`);
      const formData = new FormData();
      formData.append("knowledge_file", newQAFile);

      try {
         const uploadPromise = api.post("/knowledge/", formData, {
            headers: {
               Authorization: `Basic ${encodedCredentials}`,
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

         await Promise.all([uploadPromise, simulationDone]);

         cancelAnimationFrame(frameId);

         // <-- при успехе -->
         setUploadStatus("success");
         setTimeout(() => {
            setUploadStatus(null);
            setNewQAFile(null);
            setUploadStarted(false);
            setUploadProgress(0);
         }, 3000);
      } catch (error) {
         console.error("Ошибка при загрузке файла:", error);
         if (frameId) cancelAnimationFrame(frameId);
         // <-- при ошибке -->
         setUploadStatus("error");
         setTimeout(() => {
            setUploadStatus(null);
            setUploadStarted(false);
         }, 3000);
      }
   };

   return (
      <div className="database-update">
         {/* Первый блок: выгрузка старой базы данных */}
         <FileUploadBlock
            title={t("databaseUpdate.oldDbTitle")}
            subtitle={t("databaseUpdate.oldDbSubtitle")}
            fileFieldText={t("databaseUpdate.oldDbFileFieldText")}
            hideFileUploadField={true}
            buttonText={t("databaseUpdate.exportButtonText")}
            onButtonClick={handleExport}
         />

         {/* Второй блок: либо сообщение, либо блок загрузки */}
         {uploadStatus === "success" ? (
            <div className="upload-message">{t("databaseUpdate.uploadCompleteMessage")}</div>
         ) : uploadStatus === "error" ? (
            <div className="upload-message error"> {t("databaseUpdate.uploadErrorMessage")}</div>
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
