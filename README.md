# ML Trading Platform — Frontend

Web UI for the full lifecycle of stock-price forecasting models: datasets,
experiments, training, models and validation. Built against the ML-Trading
REST API (`docs/openapi.json`).

## Stack

- **React 18 + TypeScript + Vite**
- **React Router** — routing
- **TanStack Query** — server state, caching, polling
- **Axios** — HTTP, isolated service layer (`src/api`)
- **Material UI** — components & theming
- **Zustand** — theme + notification global state
- **React Hook Form** — forms
- **Recharts** — training curves & prediction scatter plots

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if the backend is remote
npm run dev            # http://localhost:5173
```

By default the dev server proxies `/api` → `http://localhost:8000`
(override with `VITE_API_PROXY_TARGET`). For a production deployment behind a
different host, set `VITE_API_BASE_URL` and rebuild.

### Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Type-check (`tsc -b`) + production build |
| `npm run preview` | Preview the production build         |
| `npm run lint`    | ESLint                               |
| `npm run typecheck` | Type-check only                    |

## Project structure

```
src/
  api/          Axios client + one service module per resource + OpenAPI types
  hooks/        TanStack Query hooks (queries + mutations) per resource
  store/        Zustand stores (theme, notifications)
  theme/        Light/dark MUI theme factory
  components/
    layout/     App shell: sidebar, top bar, API status
    common/     DataTable, dialogs, states, status chips, definition lists
    charts/     LossChart, PredictionWindowViewer
    forms/      Create/Start dialogs (dataset, training, model)
  pages/        One component per route
  utils/        Formatting helpers
  router.tsx    Route table (lazy-loaded pages)
  App.tsx       Providers (Query, Theme, Router, Notifier)
```

## Pages

Dashboard · Datasets · Dataset Details · Experiments · Experiment Details ·
Training Runs · Run Details · Models · Model Details · Validation.

## Design

Two minimalist themes (persisted to `localStorage`):

- **Light** — strictly black & white; interactive elements fill with black on hover.
- **Dark** — near-black background with dark-blue accents.

All tables support search, sorting, filtering and pagination
(`components/common/DataTable.tsx`).

## Validation — windowed prediction viewer

The backend returns full `actual` / `predicted` time series per ticker, which
can be tens of thousands of points. Instead of one huge chart, the viewer
(`components/charts/PredictionWindowViewer.tsx`):

- splits each series into **2000-point segments**,
- plots **every 5th point** (`actual[start:end:5]`, `predicted[start:end:5]`),
- renders each segment as a static scatter snapshot (Actual vs Predicted),
- lets the user step between segments with a segment counter.

## API types

`src/api/types.ts` mirrors `components.schemas` in `docs/openapi.json` 1:1.
If the backend schema changes, regenerate/update this file to keep types in
sync with the API.
```bash
# example using openapi-typescript (optional)
npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts
```

## Dataset preview (reading parquet in the browser)

Dataset rows are stored as parquet files on the backend
(`<datasets-dir>/<dataset>/<TICKER>.parquet`) and are **not** exposed by the
REST API. The Dataset Details page previews them directly:

- A dev-only Vite middleware serves parquet files over HTTP from
  `VITE_DATASETS_DIR` (default `~/ml-runner-backend/datasets`). It only serves
  `.parquet` files resolving inside that directory (path-traversal is blocked).
- The browser fetches a file once, parses it with [`hyparquet`](https://github.com/hyparam/hyparquet)
  (`src/utils/parquet.ts`), caches the buffer in memory, and decodes row windows
  on demand — so paging through 25k+ rows never re-downloads the file.
- The table (`components/datasets/DatasetPreviewTable.tsx`) has per-ticker tabs,
  dynamic columns and pagination.

> For production, replace the dev middleware with a backend endpoint that
> streams parquet files (or returns row pages) and point `datasetFileUrl()` at
> it — the rest of the preview UI stays the same.

## Live monitoring

Training runs and run-status queries poll automatically while a run is
`pending`/`running` (3–5 s), so the Dashboard, Training Runs table and Run
Details page update without manual refresh.
