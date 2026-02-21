import { useState } from "react";
import { getCurrentWeather, getForecast, getHistory } from "./api";

const initialAuth = {
  username: "user",
  password: "",
};

export default function App() {
  const [auth, setAuth] = useState(initialAuth);
  const [location, setLocation] = useState("London");
  const [forecastDays, setForecastDays] = useState(1);
  const [historyDate, setHistoryDate] = useState("2025-01-20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [requestType, setRequestType] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  async function runRequest(requestFn, type) {
    if (!auth.username || !auth.password) {
      setError("Enter username and password before sending a request.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await requestFn();
      setResult(data);
      setRequestType(type);
      setUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setResult(null);
      setRequestType("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container shell">
      <header className="hero">
        <p className="eyebrow">Employee Weather Console</p>
        <h1>A cleaner way to check weather signals</h1>
        <p className="subtext">
          Query current weather, short forecasts, and historical snapshots from the API in one dashboard.
        </p>
      </header>

      <section className="panel auth-panel">
        <h2>API Access</h2>
        <div className="field-grid">
          <label className="field">
            <span>Username</span>
            <input
              value={auth.username}
              onChange={(e) => setAuth((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="user"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={auth.password}
              onChange={(e) => setAuth((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Password"
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Search Controls</h2>
        <div className="field-grid">
          <label className="field">
            <span>Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="London"
            />
          </label>
          <label className="field">
            <span>Forecast Days</span>
            <input
              type="number"
              min="1"
              value={forecastDays}
              onChange={(e) => setForecastDays(e.target.value)}
            />
          </label>
          <label className="field">
            <span>History Date (yyyy-MM-dd)</span>
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
            />
          </label>
        </div>

        <div className="actions">
          <button
            className="action-btn"
            onClick={() => runRequest(() => getCurrentWeather(location, auth), "current")}
            disabled={loading}
          >
            Get Current
          </button>
          <button
            className="action-btn"
            onClick={() => runRequest(() => getForecast(location, forecastDays, auth), "forecast")}
            disabled={loading}
          >
            Get Forecast
          </button>
          <button
            className="action-btn"
            onClick={() => runRequest(() => getHistory(location, historyDate, auth), "history")}
            disabled={loading}
          >
            Get History
          </button>
        </div>
      </section>

      <section className="panel response-panel">
        <h2>Result</h2>
        {loading && <p className="status">Loading weather data...</p>}
        {!loading && error && <p className="error">{error}</p>}
        {!loading && !error && !result && <p className="status">No response yet. Run a query to populate this panel.</p>}
        {!loading && !error && result && (
          <WeatherResult result={result} requestType={requestType} updatedAt={updatedAt} />
        )}
      </section>
    </main>
  );
}

function WeatherResult({ result, requestType, updatedAt }) {
  const locationName = result.locationName || "Unknown location";
  const days = Array.isArray(result.forecastDays) ? result.forecastDays : [];
  const avgTemp = requestType === "current" ? result.tempC : days[0]?.day?.avgTempC;
  const themeClass = getTempTheme(avgTemp);

  if (requestType === "current") {
    return (
      <div className={`result-card primary ${themeClass}`}>
        <MetaBar requestType={requestType} updatedAt={updatedAt} location={locationName} days={1} />
        <p className="result-location">{locationName}</p>
        <p className="result-temp">{formatTemp(result.tempC)}</p>
        <p className="status">Current observation · {describeTemp(result.tempC)}</p>
      </div>
    );
  }

  return (
    <div className="result-stack">
      <div className="result-card">
        <MetaBar requestType={requestType} updatedAt={updatedAt} location={locationName} days={days.length} />
        <p className="result-location">{locationName}</p>
        <p className="status">
          {requestType === "forecast" ? "Forecast window" : "Historical data"} ({days.length} day
          {days.length === 1 ? "" : "s"})
        </p>
      </div>
      <div className="days-grid">
        {days.map((entry) => (
          <article className="day-tile" key={`${entry.date}-${entry.dateEpoch || "x"}`}>
            <h3>{entry.date || "Unknown date"}</h3>
            <div className="stats">
              <Stat label="Average" value={formatTemp(entry.day?.avgTempC)} />
              <Stat label="High" value={formatTemp(entry.day?.maxTempC)} />
              <Stat label="Low" value={formatTemp(entry.day?.minTempC)} />
            </div>
            {requestType === "forecast" && Array.isArray(entry.hour) && entry.hour.length > 0 && (
              <>
                <Sparkline hours={entry.hour.slice(0, 12)} />
                <div className="hour-strip">
                  {entry.hour.slice(0, 6).map((hourData) => (
                    <span className="hour-chip" key={hourData.time}>
                      {hourData.time?.slice(11) || "--:--"} {formatTemp(hourData.tempC)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function MetaBar({ requestType, updatedAt, location, days }) {
  return (
    <div className="meta-bar">
      <span>{labelRequestType(requestType)}</span>
      <span>{location}</span>
      <span>{days} day{days === 1 ? "" : "s"}</span>
      <span>{updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : "Updated now"}</span>
    </div>
  );
}

function Sparkline({ hours }) {
  const points = hours
    .map((h) => (typeof h.tempC === "number" ? h.tempC : null))
    .filter((x) => x !== null);

  if (points.length < 2) {
    return null;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 240;
  const height = 54;
  const stepX = width / (points.length - 1);
  const path = points
    .map((temp, idx) => {
      const x = idx * stepX;
      const y = height - ((temp - min) / range) * (height - 8) - 4;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Hourly temperature trend">
      <path d={path} />
    </svg>
  );
}

function Stat({ label, value }) {
  return (
    <p className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </p>
  );
}

function formatTemp(value) {
  if (typeof value !== "number") {
    return "N/A";
  }
  return `${value.toFixed(1)}°C`;
}

function describeTemp(value) {
  if (typeof value !== "number") {
    return "No signal";
  }
  if (value <= 0) {
    return "Freezing";
  }
  if (value <= 12) {
    return "Cool";
  }
  if (value <= 24) {
    return "Mild";
  }
  return "Hot";
}

function getTempTheme(value) {
  if (typeof value !== "number") {
    return "";
  }
  if (value <= 4) {
    return "theme-cold";
  }
  if (value >= 25) {
    return "theme-warm";
  }
  return "theme-mild";
}

function labelRequestType(type) {
  if (type === "current") {
    return "Current";
  }
  if (type === "forecast") {
    return "Forecast";
  }
  if (type === "history") {
    return "History";
  }
  return "Weather";
}
