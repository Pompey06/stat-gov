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
import "./AnalyticsDashboard.css";

const CHART_HEIGHT = 340;
const CHART_MARGIN = {
  top: 20,
  right: 20,
  bottom: 60,
  left: 58,
};

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

const formatPointLabel = (value, bucket, locale) => {
  const date = new Date(value);

  if (bucket === "day") {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
  }).format(date);
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

const formatAxisValue = (value, locale) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

const getNiceStep = (roughStep) => {
  if (roughStep <= 1) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  if (normalized <= 1) {
    return magnitude;
  }
  if (normalized <= 2) {
    return 2 * magnitude;
  }
  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
};

const getAxisConfig = (maxValue) => {
  if (maxValue <= 0) {
    return {
      axisMax: 1,
      ticks: [1, 0],
    };
  }

  const step = getNiceStep(maxValue / 4);
  const axisMax = Math.ceil(maxValue / step) * step;
  const ticks = [];

  for (let value = axisMax; value >= 0; value -= step) {
    ticks.push(Number(value.toFixed(2)));
  }

  if (ticks[ticks.length - 1] !== 0) {
    ticks.push(0);
  }

  return { axisMax, ticks };
};

const getChartWidth = (pointCount, bucket) => {
  const minWidth = 820;
  const spacing = bucket === "day" ? 82 : 72;

  if (pointCount <= 1) {
    return minWidth;
  }

  return Math.max(
    minWidth,
    CHART_MARGIN.left + CHART_MARGIN.right + spacing * (pointCount - 1),
  );
};

const getPointCoordinates = (items, key, axisMax, chartWidth) => {
  if (!items.length) {
    return [];
  }

  const plotWidth = chartWidth - CHART_MARGIN.left - CHART_MARGIN.right;
  const plotHeight = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;

  return items.map((item, index) => {
    const x =
      items.length === 1
        ? CHART_MARGIN.left + plotWidth / 2
        : CHART_MARGIN.left + (index / (items.length - 1)) * plotWidth;
    const y =
      CHART_MARGIN.top +
      plotHeight -
      ((Number(item[key]) || 0) / Math.max(axisMax, 1)) * plotHeight;

    return {
      x,
      y,
      value: Number(item[key]) || 0,
      ts: item.ts,
      key: `${key}-${item.ts}-${index}`,
    };
  });
};

const buildPolyline = (items, key, axisMax, chartWidth) =>
  getPointCoordinates(items, key, axisMax, chartWidth)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

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

    const [summaryResult, timelineResult, langfuseResult] =
      await Promise.allSettled([
        api.get("/analytics/summary", { headers, params }),
        api.get("/analytics/timeline", {
          headers,
          params: { ...params, bucket },
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
    setLangfuse(
      langfuseResult.status === "fulfilled" ? langfuseResult.value.data : null,
    );

    if (
      summaryResult.status === "rejected" ||
      timelineResult.status === "rejected" ||
      langfuseResult.status === "rejected"
    ) {
      setError(t("analytics.partialError"));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [bucket]);

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
    ],
    [summary, t],
  );

  const chartSeries = useMemo(
    () => [
      {
        key: "count",
        color: "#0086BF",
        label: t("analytics.chart.requests"),
      },
      {
        key: "errors",
        color: "#E57A44",
        label: t("analytics.chart.errors"),
      },
      {
        key: "not_found",
        color: "#6B7A90",
        label: t("analytics.chart.notFound"),
      },
    ],
    [t],
  );

  const maxSeriesValue = useMemo(() => {
    if (!timeline.length) {
      return 0;
    }

    return Math.max(
      0,
      ...timeline.flatMap((point) =>
        chartSeries.map((series) => Number(point[series.key]) || 0),
      ),
    );
  }, [chartSeries, timeline]);

  const axisConfig = useMemo(
    () => getAxisConfig(maxSeriesValue),
    [maxSeriesValue],
  );

  const chartWidth = useMemo(
    () => getChartWidth(timeline.length, bucket),
    [timeline.length, bucket],
  );

  const visibleLabelStep = useMemo(() => {
    if (bucket === "day") {
      return 1;
    }

    return Math.max(1, Math.ceil(timeline.length / 10));
  }, [bucket, timeline.length]);

  const xAxisPoints = useMemo(() => {
    const plotWidth = chartWidth - CHART_MARGIN.left - CHART_MARGIN.right;

    return timeline.map((point, index) => {
      const x =
        timeline.length === 1
          ? CHART_MARGIN.left + plotWidth / 2
          : CHART_MARGIN.left + (index / (timeline.length - 1)) * plotWidth;

      return {
        key: `${point.ts}-${index}`,
        x,
        label: formatPointLabel(point.ts, bucket, locale),
        show:
          bucket === "day" ||
          index % visibleLabelStep === 0 ||
          index === timeline.length - 1,
      };
    });
  }, [bucket, chartWidth, locale, timeline, visibleLabelStep]);

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

          {timeline.length ? (
            <>
              <div className="analytics-legend">
                {chartSeries.map((series) => (
                  <div className="analytics-legend-item" key={series.key}>
                    <span
                      className="analytics-legend-dot"
                      style={{ backgroundColor: series.color }}
                    />
                    <span>{series.label}</span>
                  </div>
                ))}
              </div>

              <div className="analytics-chart-wrapper">
                <svg
                  className="analytics-chart"
                  viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
                  preserveAspectRatio="none"
                >
                  {axisConfig.ticks.map((tick) => {
                    const plotHeight =
                      CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;
                    const y =
                      CHART_MARGIN.top +
                      plotHeight -
                      (tick / axisConfig.axisMax) * plotHeight;

                    return (
                      <g key={tick}>
                        <line
                          x1={CHART_MARGIN.left}
                          x2={chartWidth - CHART_MARGIN.right}
                          y1={y}
                          y2={y}
                          className="analytics-grid-line"
                        />
                        <text
                          x={CHART_MARGIN.left - 12}
                          y={y + 4}
                          textAnchor="end"
                          className="analytics-axis-text"
                        >
                          {formatAxisValue(tick, locale)}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={CHART_MARGIN.left}
                    x2={CHART_MARGIN.left}
                    y1={CHART_MARGIN.top}
                    y2={CHART_HEIGHT - CHART_MARGIN.bottom}
                    className="analytics-axis-line"
                  />
                  <line
                    x1={CHART_MARGIN.left}
                    x2={chartWidth - CHART_MARGIN.right}
                    y1={CHART_HEIGHT - CHART_MARGIN.bottom}
                    y2={CHART_HEIGHT - CHART_MARGIN.bottom}
                    className="analytics-axis-line"
                  />

                  {chartSeries.map((series) => (
                    <g key={series.key}>
                      <polyline
                        fill="none"
                        stroke={series.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={buildPolyline(
                          timeline,
                          series.key,
                          axisConfig.axisMax,
                          chartWidth,
                        )}
                      />
                      {getPointCoordinates(
                        timeline,
                        series.key,
                        axisConfig.axisMax,
                        chartWidth,
                      ).map((point) => (
                        <circle
                          key={point.key}
                          cx={point.x}
                          cy={point.y}
                          r="5"
                          fill={series.color}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        >
                          <title>
                            {`${series.label}: ${formatAxisValue(
                              point.value,
                              locale,
                            )} - ${formatInsightPointLabel(
                              point.ts,
                              bucket,
                              locale,
                            )}`}
                          </title>
                        </circle>
                      ))}
                    </g>
                  ))}

                  {xAxisPoints.map((point) =>
                    point.show ? (
                      <text
                        key={point.key}
                        x={point.x}
                        y={CHART_HEIGHT - 18}
                        textAnchor="middle"
                        className="analytics-axis-text analytics-axis-text_x"
                      >
                        {point.label}
                      </text>
                    ) : null,
                  )}
                </svg>
              </div>
            </>
          ) : (
            <div className="analytics-empty-state">
              {t("analytics.chart.empty")}
            </div>
          )}
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
