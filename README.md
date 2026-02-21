# Employee Weather View

React + Vite frontend that consumes the `employee-weather-api` weather endpoints:

- `GET /api/v1/weather/current/{location}`
- `GET /api/v1/weather/forecast/{location}/{days}`
- `GET /api/v1/weather/history/{location}/{date}`

## API Repositories

- [employee-weather-api](https://github.com/Vheekey/employee-weather-api)
- [location-sentiment-api](https://github.com/Vheekey/location-sentiment-api)

![Dashboard Hero](./public/readme-hero.svg)

## Highlights

- Polished weather dashboard UI (current, forecast, history)
- Dev proxy support to avoid CORS issues (`/api` -> `http://localhost:9091`)
- Built-in Basic Auth fields for Spring Security-backed API calls
- Clean, card-based visualization of API responses

![Dashboard Panels](./public/readme-panels.svg)

## Prerequisites

- Node.js 20 or 22 (LTS recommended)
- Employee weather API running (default assumed `http://localhost:9091`)

## Setup

```bash
npm install
cp .env.example .env
```

If your API runs on a different host/port, update `VITE_API_BASE_URL` in `.env`.
For local dev, keep `VITE_API_BASE_URL=/api/v1` so Vite proxies requests to `http://localhost:9091` and avoids CORS.

If you use `nvm`, this project includes `.nvmrc`:
```bash
nvm use
```

## Run

```bash
npm run dev
```

Open the app URL shown by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Auth

The backend uses Spring Security Basic Auth by default.

Enter:
- Username: `user`
- Password: the generated password printed in the Spring Boot startup logs
