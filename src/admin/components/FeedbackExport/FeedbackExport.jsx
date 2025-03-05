// src/components/FeedbackExport.jsx
import { useState, forwardRef } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../Button/Button";
import calendarIcon from "../../assets/сalendarIcon.svg";
import clearIcon from "../../assets/clearIcon.svg";
import "./FeedbackExport.css";
import ru from "date-fns/locale/ru";
import { useApi } from "../Context/Context";
import { useTranslation } from "react-i18next";

// Кастомный инпут для DatePicker с иконками календаря и крестика для очистки
const CustomDateInput = forwardRef(({ value, onClick, placeholder, onClear }, ref) => {
   return (
      <div className="custom-date-input">
         <img src={calendarIcon} alt="Calendar" className="calendar-icon" />
         <input
            onClick={onClick}
            value={value}
            placeholder={placeholder}
            ref={ref}
            readOnly
            className="date-input-field"
         />
         {value && (
            <img
               src={clearIcon}
               alt="Clear"
               className="clear-icon"
               onClick={(e) => {
                  e.stopPropagation();
                  onClear();
               }}
            />
         )}
      </div>
   );
});

CustomDateInput.propTypes = {
   value: PropTypes.string,
   onClick: PropTypes.func.isRequired,
   placeholder: PropTypes.string,
   onClear: PropTypes.func.isRequired,
};

CustomDateInput.displayName = "CustomDateInput";

const FeedbackExport = () => {
   const { t } = useTranslation();
   const api = useApi();
   const [startDate, setStartDate] = useState(null);
   const [endDate, setEndDate] = useState(null);

   const handleDownload = async () => {
      if (!startDate || !endDate) {
         console.error("Обе даты должны быть выбраны");
         return;
      }
      const encodedCredentials = btoa("admin:HmADJuDisELD");
      try {
         const response = await api.get("/conversation/export.xlsx", {
            headers: {
               Authorization: `Basic ${encodedCredentials}`,
            },
            params: {
               from_date: startDate.toISOString().split("T")[0],
               to_date: endDate.toISOString().split("T")[0],
            },
            responseType: "blob",
         });
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement("a");
         link.href = url;
         link.setAttribute("download", "export.xlsx");
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         setStartDate(null);
         setEndDate(null);
      } catch (error) {
         console.error("Ошибка при скачивании файла:", error);
      }
   };

   return (
      <div className="feedback-export">
         <h2 className="export-title">{t("feedbackExport.title")}</h2>
         <p className="export-subtitle">{t("feedbackExport.subtitle")}</p>
         <div className="date-picker-container">
            <div className="date-picker-item">
               <h4 className="date-picker-title">{t("feedbackExport.startDateTitle")}</h4>
               <DatePicker
                  locale={ru}
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText={t("feedbackExport.datePlaceholder")}
                  dateFormat="dd.MM.yyyy"
                  maxDate={endDate} // Нельзя выбрать дату больше, чем endDate
                  customInput={
                     <CustomDateInput
                        onClear={() => setStartDate(null)}
                        placeholder={t("feedbackExport.datePlaceholder")}
                     />
                  }
               />
            </div>
            <div className="date-picker-item">
               <h4 className="date-picker-title">{t("feedbackExport.endDateTitle")}</h4>
               <DatePicker
                  locale={ru}
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText={t("feedbackExport.datePlaceholder")}
                  dateFormat="dd.MM.yyyy"
                  minDate={startDate} // Нельзя выбрать дату меньше, чем startDate
                  customInput={
                     <CustomDateInput
                        onClear={() => setEndDate(null)}
                        placeholder={t("feedbackExport.datePlaceholder")}
                     />
                  }
               />
            </div>
         </div>
         <Button
            type="button"
            onClick={handleDownload}
            className="download-button"
            disabled={!startDate || !endDate} // Блокировка кнопки, если даты не выбраны
         >
            {t("feedbackExport.downloadButton")}
         </Button>
      </div>
   );
};

export default FeedbackExport;
