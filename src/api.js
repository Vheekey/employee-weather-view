const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function buildHeaders(auth) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth.username && auth.password) {
    headers.Authorization = `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
  }

  return headers;
}

async function request(path, auth) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: buildHeaders(auth),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error || JSON.stringify(data)
        : String(data);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return data;
}

export function getCurrentWeather(location, auth) {
  return request(`/weather/current/${encodeURIComponent(location)}`, auth);
}

export function getForecast(location, days, auth) {
  const normalizedDays = Number(days);
  if (Number.isNaN(normalizedDays) || normalizedDays < 1) {
    throw new Error("Forecast days must be at least 1");
  }
  return request(`/weather/forecast/${encodeURIComponent(location)}/${normalizedDays}`, auth);
}

export function getHistory(location, date, auth) {
  return request(`/weather/history/${encodeURIComponent(location)}/${date}`, auth);
}
