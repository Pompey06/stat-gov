// src/components/DatabaseUpdate/DatabaseUpdate.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import uploadIcon from '../../assets/uploadIcon.svg';
import fileIcon from '../../assets/csv.svg';
import crossIcon from '../../assets/cross.svg';
import './DatabaseUpdate.css';
import { useApi } from '../../components/Context/Context';
import adminI18n from '../../i18n';
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

  // Обработчик выбора файла через input
  const handleFileChange = (e) => {
    if (onFileSelect && e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  // Обработчик drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFileSelect && e.dataTransfer.files && e.dataTransfer.files[0]) {
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
            <>
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
                    ></div>
                    <span className="upload-progress-text">
                      {uploadProgress}%
                    </span>
                  </div>
                )}
              </div>
            </>
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
              <p className="upload-field-format">csv, xlsx</p>
              <p className="upload-field-text">{fileFieldText}</p>
              {/* Скрытый input для выбора файла */}
              <input
                type="file"
                id={`${title}-fileInput`}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          )}
        </>
      )}
      <Button type="button" className="upload-button" onClick={onButtonClick}>
        {buttonText ? buttonText : t('databaseUpdate.uploadButtonText')}
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
  uploadProgress: PropTypes.number, // процент загрузки
};

const DatabaseUpdate = () => {
  const { t } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();
  const [newQAFile, setNewQAFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // состояние прогресса загрузки
  const [uploadStarted, setUploadStarted] = useState(false); // состояние начала загрузки

  // Обработчик экспорта для первого блока (выгрузка старой базы данных)
  const handleExport = async () => {
    const encodedCredentials = btoa('admin:HmADJuDisELD');
    try {
      const response = await api.get('/knowledge/qa.csv', {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'qa.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Ошибка при экспорте файла:', error);
    }
  };

  // Обработчик выбора файла для второго блока (новые вопросы и ответы)
  const handleNewQAFileSelect = (file) => {
    console.log('Выбран файл для новых вопросов и ответов:', file);
    setNewQAFile(file);
    setUploadProgress(0); // сбрасываем прогресс при новом выборе файла
  };

  // Обработчик удаления выбранного файла
  const handleNewQAFileRemove = () => {
    setNewQAFile(null);
    setUploadProgress(0);
    setUploadStarted(false);
  };

  // Обработчик загрузки файла (POST запрос) для второго блока
  const handleUpload = async () => {
    if (!newQAFile) return;
    setUploadStarted(true);
    const encodedCredentials = btoa('admin:HmADJuDisELD');
    const formData = new FormData();
    formData.append('qa_file', newQAFile);
    try {
      const response = await api.post('/knowledge/fill-db', formData, {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });
      console.log('Файл успешно загружен', response.data);
      setNewQAFile(null);
      setUploadProgress(0);
      setUploadStarted(false);
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      setUploadStarted(false);
    }
  };

  return (
    <div className="database-update">
      {/* Первый блок: выгрузка старой базы данных (поле загрузки скрыто) */}
      <FileUploadBlock
        title={t('databaseUpdate.oldDbTitle')}
        subtitle={t('databaseUpdate.oldDbSubtitle')}
        fileFieldText={t('databaseUpdate.oldDbFileFieldText')}
        hideFileUploadField={true}
        buttonText={t('databaseUpdate.exportButtonText')}
        onButtonClick={handleExport}
      />
      {/* Второй блок: загрузка новых вопросов и ответов */}
      <FileUploadBlock
        title={t('databaseUpdate.newQATitle')}
        subtitle={t('databaseUpdate.newQASubtitle')}
        fileFieldText={t('databaseUpdate.newQAFileFieldText')}
        onFileSelect={handleNewQAFileSelect}
        selectedFile={newQAFile}
        onFileRemove={handleNewQAFileRemove}
        onButtonClick={handleUpload}
        uploadProgress={uploadStarted ? uploadProgress : null}
      />
    </div>
  );
};

export default DatabaseUpdate;
