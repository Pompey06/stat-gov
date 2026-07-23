import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES = [
  { key: "count", color: "#0086BF" },
  { key: "errors", color: "#E57A44" },
  { key: "not_found", color: "#6B7A90" },
];

const truncateToBucket = (value, bucket) => {
  const date = new Date(value);
  if (bucket === "day") {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setMinutes(0, 0, 0);
  }
  return date;
};

const fillTimelineGaps = (timeline, bucket, startDate, endDate) => {
  if (!startDate || !endDate || !timeline.length) {
    return timeline.map((point) => ({
      ...point,
      count: Number(point.count) || 0,
      errors: Number(point.errors) || 0,
      not_found: Number(point.not_found) || 0,
    }));
  }

  const stepMs = bucket === "day" ? 86_400_000 : 3_600_000;
  const byKey = new Map();

  timeline.forEach((point) => {
    const truncated = truncateToBucket(point.ts, bucket);
    byKey.set(truncated.getTime(), {
      ts: truncated.toISOString(),
      count: Number(point.count) || 0,
      errors: Number(point.errors) || 0,
      not_found: Number(point.not_found) || 0,
    });
  });

  const filled = [];
  let cursor = truncateToBucket(startDate, bucket);
  const end = truncateToBucket(endDate, bucket);

  while (cursor.getTime() <= end.getTime()) {
    const key = cursor.getTime();
    filled.push(
      byKey.get(key) ?? {
        ts: new Date(key).toISOString(),
        count: 0,
        errors: 0,
        not_found: 0,
      },
    );
    cursor = new Date(key + stepMs);
  }

  return filled.length ? filled : timeline;
};

const formatAxisValue = (value, locale) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

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
    minute: "2-digit",
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

const ChartTooltip = ({ active, payload, locale }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  return (
    <div className="analytics-chart-tooltip">
      <div className="analytics-chart-tooltip-title">{point?.tooltipLabel}</div>
      {payload.map((entry) => (
        <div className="analytics-chart-tooltip-row" key={entry.dataKey}>
          <span
            className="analytics-chart-tooltip-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span className="analytics-chart-tooltip-label">{entry.name}</span>
          <strong className="analytics-chart-tooltip-value">
            {formatAxisValue(entry.value ?? 0, locale)}
          </strong>
        </div>
      ))}
    </div>
  );
};

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  locale: PropTypes.string.isRequired,
};

const AnalyticsTimelineChart = ({
  timeline,
  bucket,
  startDate,
  endDate,
  locale,
  seriesLabels,
  emptyText,
}) => {
  const chartData = useMemo(() => {
    const filled = fillTimelineGaps(timeline, bucket, startDate, endDate);

    return filled.map((point) => ({
      ...point,
      label: formatPointLabel(point.ts, bucket, locale),
      tooltipLabel: formatInsightPointLabel(point.ts, bucket, locale),
    }));
  }, [timeline, bucket, startDate, endDate, locale]);

  const showBrush = chartData.length > 14;

  if (!chartData.length) {
    return <div className="analytics-empty-state">{emptyText}</div>;
  }

  return (
    <div className="analytics-chart-container">
      <ResponsiveContainer width="100%" height={360}>
        <LineChart
          data={chartData}
          margin={{ top: 12, right: 16, left: 4, bottom: showBrush ? 28 : 8 }}
        >
          <CartesianGrid
            stroke="rgba(0, 134, 191, 0.12)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#7d8da0", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(0, 134, 191, 0.25)" }}
            minTickGap={24}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#7d8da0", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} locale={locale} />}
            cursor={{ stroke: "rgba(0, 134, 191, 0.25)", strokeWidth: 1 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ paddingBottom: 12 }}
          />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={seriesLabels[series.key]}
              stroke={series.color}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls
              isAnimationActive
            />
          ))}
          {showBrush ? (
            <Brush
              dataKey="label"
              height={24}
              stroke="#0086BF"
              fill="#f6fbfe"
              travellerWidth={10}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

AnalyticsTimelineChart.propTypes = {
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      ts: PropTypes.string.isRequired,
      count: PropTypes.number,
      errors: PropTypes.number,
      not_found: PropTypes.number,
    }),
  ).isRequired,
  bucket: PropTypes.oneOf(["hour", "day"]).isRequired,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  locale: PropTypes.string.isRequired,
  seriesLabels: PropTypes.shape({
    count: PropTypes.string.isRequired,
    errors: PropTypes.string.isRequired,
    not_found: PropTypes.string.isRequired,
  }).isRequired,
  emptyText: PropTypes.string.isRequired,
};

export default AnalyticsTimelineChart;
