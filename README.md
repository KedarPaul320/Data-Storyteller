# 📚 Data Storyteller

Turn raw rows into stories your team can act on.  
Data Storyteller is a full-stack data exploration app with:

- 🐍 Django + DRF backend for file upload, filtering, and chart generation
- ⚛️ React + TypeScript frontend for an interactive dashboard
- 📈 Plotly-powered chart rendering with dynamic controls

---

## ✨ What This Project Does

1. 📤 Upload a `.csv` or `.xlsx` dataset
2. 🧠 Auto-detect column metadata (categorical + numerical)
3. 🎛️ Apply dynamic filters in the sidebar
4. 🏗️ Pick chart type + X/Y axes in the chart builder
5. 🖼️ Render charts via backend-generated Plotly figure data

---

## 🧱 Tech Stack

### Backend
- Django 6
- Django REST Framework
- Pandas
- Plotly
- SQLite
- django-cors-headers

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn-style UI primitives
- Plotly.js
- React Router

---

## 🗂️ Repository Structure

```text
Data Stroyteller/
├─ Backend/
│  ├─ core/                  # Django project settings + URL wiring
│  ├─ dashboard/             # Upload/analyze/chart APIs + data utilities
│  ├─ media/                 # Uploaded datasets stored on disk
│  ├─ db.sqlite3             # Local development database
│  └─ pyproject.toml         # Python dependencies
└─ frontend/
   ├─ src/
   │  ├─ pages/              # Landing and dashboard pages
   │  ├─ components/charts/  # Chart controls, gallery, Plotly renderer
   │  ├─ components/layout/  # Sidebar filter panel
   │  └─ context/            # Session state for uploaded file metadata
   └─ package.json           # Node scripts + dependencies
```

---

## 🔌 Backend API Overview

Base URL: `http://localhost:8000/api`

### `POST /upload/` 📤
Uploads a file and returns a session payload.

- Accepts: multipart form field `file`
- Supports: `.csv`, `.xlsx`
- Returns:
  - `file_id`
  - `filename`
  - `metadata.columns`
  - `metadata.categorical`
  - `metadata.numerical`

### `POST /analyze/` 🔎
Applies filters and returns table-like records.

Request body includes:
- `file_id`
- `filename`
- `filters` object

Response includes:
- `total_rows`
- `filtered_rows`
- `returned_rows`
- `truncated`
- `data`

Note: returned records are capped to 5000 rows.

### `POST /chart/generate/` 📊
Builds chart data from filtered dataset.

Request body includes:
- `file_id`
- `filename`
- `filters`
- `chart_type`
- `x_axis`
- `y_axis`

Supported chart types:
- `bar`
- `line`
- `scatter`
- `pie`
- `area`
- `box`
- `histogram`

Returns:
- `success`
- `chart_data` (Plotly figure dict)

---

## 🖥️ Frontend Flow

### `/` Landing Page
- Shows Data Storyteller branding and upload card
- Sends file to backend upload endpoint
- Stores returned file session in context + `sessionStorage`
- Navigates to dashboard

### `/dashboard` Dashboard Page
- Left sidebar auto-builds filters from metadata
  - Numerical columns: slider (`min` fixed, adjustable `max`)
  - Categorical columns: checkbox options (first 10 values)
- Chart controls choose:
  - Chart type
  - X axis
  - Y axis
- Chart gallery requests backend chart generation whenever config/filters apply

---

## 🚀 Local Development Setup

## 1) Backend Setup (Django)

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -U pip
pip install django djangorestframework pandas plotly openpyxl django-cors-headers django-environ
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

## 2) Frontend Setup (Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## ⚙️ Configuration Notes

- CORS currently allows:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Uploads are saved under `Backend/media/`
- Current backend settings are development-oriented (`DEBUG=True`)

---

## 🧪 Testing Status

- Backend test scaffold exists but no implemented test cases yet.
- Frontend lint script is available via `npm run lint`.

Suggested next test coverage:
- ✅ Upload validation tests (file type, missing file)
- ✅ Filter behavior tests (categorical + numerical)
- ✅ Chart endpoint tests per chart type
- ✅ Frontend integration test for upload → dashboard flow

---

## 🧠 Current Behavior and Limits

- Only `.csv` and `.xlsx` files are accepted
- Large responses from `/analyze/` are truncated at 5000 rows
- Categorical filter UI currently shows up to 10 values per categorical column
- Numerical filter UI applies an upper-bound slider (`max`) with fixed lower bound
- Data is cached in backend process memory using an LRU cache for faster repeated reads

---

## 🔮 Recommended Improvements

- Add true min+max range slider for numerical filters
- Add pagination or virtualized table rendering for large datasets
- Add backend authentication if multi-user deployment is required
- Add robust unit/integration test suites
- Move secrets/config to environment variables and harden production settings
- Add Docker setup for one-command local startup

---

## 🤝 Contributing

1. Fork or clone the repository
2. Create a feature branch
3. Make focused changes
4. Run lint/tests
5. Open a pull request with clear context

---

## 📜 License

No license file is currently present in the repository. 

---

Built with ❤️ for fast, visual data storytelling.
