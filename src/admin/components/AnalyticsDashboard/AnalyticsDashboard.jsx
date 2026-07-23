import { forwardRef, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import ru from "date-fns/locale/ru";
import kk from "date-fns/locale/kk";
import Button from "../Button/Button";
import { useApi } from "../Context/Context";
import calendarIcon from "../../assets/сalendarIcon.svg";
import clearIcon from "../../assets/clearIcon.svg";
import adminI18n from "../../i18n";
import AnalyticsTimelineChart from "./AnalyticsTimelineChart";
import "./AnalyticsDashboard.css";

const CustomDateInput = forwardRef(
  ({ value, onClick, placeholder, onClear }, ref) => (
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
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
        />
      )}
    </div>
  ),
);

CustomDateInput.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  onClear: PropTypes.func.isRequired,
};

CustomDateInput.displayName = "CustomDateInput";

const formatDateTimeParam = (date, endOfDay = false) => {
  if (!date) {
    return undefined;
  }

  const localDate = new Date(date);
  localDate.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, 0);

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");
  const seconds = String(localDate.getSeconds()).padStart(2, "0");

  const offsetMinutes = -localDate.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(
    Math.floor(absoluteOffsetMinutes / 60),
  ).padStart(2, "0");
  const offsetMins = String(absoluteOffsetMinutes % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
};

const formatInsightPointLabel = (value, bucket, locale) => {
  const date = new Date(value);

  if (bucket === "day") {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const maskSecret = (value) => {
  if (!value) {
    return "-";
  }

  if (value.length <= 4) {
    return "*".repeat(value.length);
  }

  return `${"*".repeat(Math.max(value.length - 2, 4))}${value.slice(-2)}`;
};

const normalizeLangfusePath = (path) => {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith(":")) {
    return `${window.location.protocol}//${window.location.hostname}${path}`;
  }

  if (path.startsWith("/")) {
    return `${window.location.origin}${path}`;
  }

  return `${window.location.protocol}//${path}`;
};

const AnalyticsDashboard = ({ credentials }) => {
  const { t, i18n } = useTranslation(undefined, { i18n: adminI18n });
  const api = useApi();

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date;
  });
  const [endDate, setEndDate] = useState(() => new Date());
  const [bucket, setBucket] = useState("day");
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [errors, setErrors] = useState([]);
  const [langfuse, setLangfuse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const locale = i18n.language === "kz" ? "kk-KZ" : "ru-RU";
  const datePickerLocale = i18n.language === "kz" ? kk : ru;

  const loadAnalytics = async () => {
    if (!credentials) {
      return;
    }

    setLoading(true);
    setError("");

    const encodedCredentials = btoa(
      `${credentials.login}:${credentials.password}`,
    );
    const headers = { Authorization: `Basic ${encodedCredentials}` };
    const params = {
      from: formatDateTimeParam(startDate),
      to: formatDateTimeParam(endDate, true),
    };

    const [summaryResult, timelineResult, errorsResult, langfuseResult] =
      await Promise.allSettled([
        api.get("/analytics/summary", { headers, params }),
        api.get("/analytics/timeline", {
          headers,
          params: { ...params, bucket },
        }),
        api.get("/analytics/errors", {
          headers,
          params,
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 404,
        }),
        api.get("/analytics/langfuse", { headers }),
      ]);

    setSummary(
      summaryResult.status === "fulfilled" ? summaryResult.value.data : null,
    );
    setTimeline(
      timelineResult.status === "fulfilled" &&
        Array.isArray(timelineResult.value.data)
        ? timelineResult.value.data
        : [],
    );
    setErrors(
      errorsResult.status === "fulfilled" &&
        Array.isArray(errorsResult.value.data)
        ? errorsResult.value.data
        : [],
    );
    setLangfuse(
      langfuseResult.status === "fulfilled" ? langfuseResult.value.data : null,
    );

    if (
      summaryResult.status === "rejected" ||
      timelineResult.status === "rejected"
    ) {
      setError(t("analytics.partialError"));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [bucket, startDate, endDate, credentials]);

  const summaryCards = useMemo(
    () => [
      {
        key: "requests",
        label: t("analytics.cards.requests"),
        value: summary?.requests ?? 0,
      },
      {
        key: "conversations",
        label: t("analytics.cards.conversations"),
        value: summary?.conversations ?? 0,
      },
      {
        key: "feedbackGood",
        label: t("analytics.cards.feedbackGood"),
        value: summary?.feedback_good ?? 0,
      },
      {
        key: "feedbackBad",
        label: t("analytics.cards.feedbackBad"),
        value: summary?.feedback_bad ?? 0,
      },
      {
        key: "notFound",
        label: t("analytics.cards.notFound"),
        value: summary?.not_found ?? 0,
      },
      {
        key: "cancelled",
        label: t("analytics.cards.cancelled"),
        value: summary?.cancelled ?? 0,
      },
      {
        key: "unanswered",
        label: t("analytics.cards.unanswered"),
        value: summary?.unanswered ?? 0,
      },
      {
        key: "errors",
        label: t("analytics.cards.errors"),
        value: summary?.errors ?? 0,
      },
    ],
    [summary, t],
  );

  const chartSeriesLabels = useMemo(
    () => ({
      count: t("analytics.chart.requests"),
      errors: t("analytics.chart.errors"),
      not_found: t("analytics.chart.notFound"),
    }),
    [t],
  );

  const peakLoadPoint = useMemo(() => {
    if (!timeline.length) {
      return null;
    }

    return timeline.reduce((max, point) =>
      (point.count ?? 0) > (max?.count ?? -1) ? point : max,
    );
  }, [timeline]);

  const peakErrorPoint = useMemo(() => {
    if (!timeline.length) {
      return null;
    }

    return timeline.reduce((max, point) =>
      (point.errors ?? 0) > (max?.errors ?? -1) ? point : max,
    );
  }, [timeline]);

  const langfuseConfigured = Boolean(
    langfuse?.path || langfuse?.login || langfuse?.password,
  );
  const langfusePath = useMemo(
    () => normalizeLangfusePath(langfuse?.path),
    [langfuse?.path],
  );

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">{t("analytics.title")}</h2>
          <p className="analytics-subtitle">{t("analytics.subtitle")}</p>
        </div>
        <Button
          type="button"
          className="analytics-refresh-button"
          onClick={loadAnalytics}
          disabled={loading}
        >
          {loading ? (
            <span className="loader loader_inline" />
          ) : (
            t("analytics.refresh")
          )}
        </Button>
      </div>

      <div className="analytics-panel analytics-filters">
        <div className="date-picker-item">
          <h4 className="date-picker-title">{t("analytics.filters.from")}</h4>
          <DatePicker
            locale={datePickerLocale}
            selected={startDate}
            onChange={setStartDate}
            placeholderText={t("analytics.filters.datePlaceholder")}
            dateFormat="dd.MM.yyyy"
            maxDate={endDate}
            customInput={
              <CustomDateInput
                onClear={() => setStartDate(null)}
                placeholder={t("analytics.filters.datePlaceholder")}
              />
            }
          />
        </div>

        <div className="date-picker-item">
          <h4 className="date-picker-title">{t("analytics.filters.to")}</h4>
          <DatePicker
            locale={datePickerLocale}
            selected={endDate}
            onChange={setEndDate}
            placeholderText={t("analytics.filters.datePlaceholder")}
            dateFormat="dd.MM.yyyy"
            minDate={startDate}
            customInput={
              <CustomDateInput
                onClear={() => setEndDate(null)}
                placeholder={t("analytics.filters.datePlaceholder")}
              />
            }
          />
        </div>

        <label className="analytics-select-field">
          <span className="analytics-select-label">
            {t("analytics.filters.bucket")}
          </span>
          <select
            className="analytics-select"
            value={bucket}
            onChange={(event) => setBucket(event.target.value)}
          >
            <option value="hour">{t("analytics.filters.hour")}</option>
            <option value="day">{t("analytics.filters.day")}</option>
          </select>
        </label>
      </div>

      {error && <div className="analytics-alert">{error}</div>}

      <div className="analytics-summary-grid">
        {summaryCards.map((card) => (
          <article className="analytics-card" key={card.key}>
            <span className="analytics-card-label">{card.label}</span>
            <strong className="analytics-card-value">
              {new Intl.NumberFormat(locale).format(card.value)}
            </strong>
          </article>
        ))}
      </div>

      <div className="analytics-content-grid">
        <section className="analytics-panel analytics-chart-panel">
          <div className="analytics-panel-header">
            <div>
              <h3 className="analytics-panel-title">
                {t("analytics.chart.title")}
              </h3>
              <p className="analytics-panel-subtitle">
                {t("analytics.chart.subtitle")}
              </p>
            </div>
          </div>

          <AnalyticsTimelineChart
            timeline={timeline}
            bucket={bucket}
            startDate={startDate}
            endDate={endDate}
            locale={locale}
            seriesLabels={chartSeriesLabels}
            emptyText={t("analytics.chart.empty")}
          />
        </section>

        <div className="analytics-side-column">
          <section className="analytics-panel analytics-insights-panel">
            <h3 className="analytics-panel-title">
              {t("analytics.insights.title")}
            </h3>
            <div className="analytics-insight-list">
              <article className="analytics-insight-card">
                <span className="analytics-insight-label">
                  {t("analytics.insights.peakLoad")}
                </span>
                <strong className="analytics-insight-value">
                  {peakLoadPoint
                    ? `${new Intl.NumberFormat(locale).format(
                        peakLoadPoint.count,
                      )} - ${formatInsightPointLabel(
                        peakLoadPoint.ts,
                        bucket,
                        locale,
                      )}`
                    : "-"}
                </strong>
              </article>

              <article className="analytics-insight-card">
                <span className="analytics-insight-label">
                  {t("analytics.insights.peakErrors")}
                </span>
                <strong className="analytics-insight-value">
                  {peakErrorPoint
                    ? `${new Intl.NumberFormat(locale).format(
                        peakErrorPoint.errors,
                      )} - ${formatInsightPointLabel(
                        peakErrorPoint.ts,
                        bucket,
                        locale,
                      )}`
                    : "-"}
                </strong>
              </article>

              <article className="analytics-insight-card">
                <span className="analytics-insight-label">
                  {t("analytics.insights.feedbackTotal")}
                </span>
                <strong className="analytics-insight-value">
                  {new Intl.NumberFormat(locale).format(
                    (summary?.feedback_good ?? 0) + (summary?.feedback_bad ?? 0),
                  )}
                </strong>
              </article>
            </div>
          </section>

          <section className="analytics-panel analytics-langfuse-panel">
            <div className="analytics-panel-header">
              <div>
                <h3 className="analytics-panel-title">
                  {t("analytics.langfuse.title")}
                </h3>
                <p className="analytics-panel-subtitle">
                  {langfuseConfigured
                    ? t("analytics.langfuse.connected")
                    : t("analytics.langfuse.empty")}
                </p>
              </div>
              {langfusePath && (
                <Button
                  type="button"
                  className="analytics-link-button"
                  onClick={() =>
                    window.open(langfusePath, "_blank", "noopener,noreferrer")
                  }
                >
                  {t("analytics.langfuse.open")}
                </Button>
              )}
            </div>

            <div className="analytics-credentials">
              <div className="analytics-credential-field">
                <span className="analytics-credential-label">
                  {t("analytics.langfuse.login")}
                </span>
                <span className="analytics-credential-value">
                  {langfuse?.login || "-"}
                </span>
              </div>

              <div className="analytics-credential-field">
                <div className="analytics-password-row">
                  <span className="analytics-credential-label">
                    {t("analytics.langfuse.password")}
                  </span>
                  <button
                    type="button"
                    className="analytics-toggle-secret"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword
                      ? t("analytics.langfuse.hide")
                      : t("analytics.langfuse.show")}
                  </button>
                </div>
                <span className="analytics-credential-value">
                  {showPassword
                    ? langfuse?.password || "-"
                    : maskSecret(langfuse?.password)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="analytics-panel analytics-errors-panel">
        <div className="analytics-panel-header">
          <div>
            <h3 className="analytics-panel-title">
              {t("analytics.errors.title")}
            </h3>
            <p className="analytics-panel-subtitle">
              {t("analytics.errors.subtitle")}
            </p>
          </div>
        </div>

        {errors.length ? (
          <div className="analytics-errors-table-wrapper">
            <table className="analytics-errors-table">
              <thead>
                <tr>
                  <th>{t("analytics.errors.time")}</th>
                  <th>{t("analytics.errors.userMessage")}</th>
                  <th>{t("analytics.errors.errorText")}</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((item) => (
                  <tr key={`${item.conversation_id}-${item.created_at}`}>
                    <td className="analytics-errors-time">
                      {formatInsightPointLabel(
                        item.created_at,
                        bucket,
                        locale,
                      )}
                    </td>
                    <td className="analytics-errors-prompt">
                      {item.user_message || "-"}
                    </td>
                    <td className="analytics-errors-message">{item.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="analytics-empty-state">
            {t("analytics.errors.empty")}
          </div>
        )}
      </section>
    </div>
  );
};

AnalyticsDashboard.propTypes = {
  credentials: PropTypes.shape({
    login: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
};

export default AnalyticsDashboard;
