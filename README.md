# DataPulse — Sales Analytics Dashboard
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![React](https://img.shields.io/badge/React-18-blue)
A full-stack data analytics project. Upload any sales CSV/Excel file and get instant interactive analytics.

## Tech Stack
- **Backend:** Python · FastAPI · Pandas · NumPy · ReportLab
- **Frontend:** React · Recharts · Axios

---

## Features
- 📤 CSV/Excel upload with automatic column detection & data cleaning
- 📈 Revenue trends (monthly/weekly area charts)
- 🏆 Top products by revenue (horizontal bar chart)
- 🌍 Regional performance (pie + table)
- 👥 Customer segmentation (Low/Mid/High value)
- 🔮 6-month revenue forecast (linear regression)
- 📄 Auto-generated PDF report download

---

## Quick Start

### 1. Generate sample data (optional)
```bash
cd server
python generate_sample_data.py
# Creates: sample_sales_data.csv
```

### 2. Start the backend
```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the frontend
```bash
cd client
npm install
npm start
# Opens at http://localhost:3000
```

---

## Expected CSV Columns
The app auto-detects these columns by common aliases:

| Standard  | Accepted names |
|-----------|---------------|
| date      | order_date, sale_date, transaction_date |
| revenue   | sales, amount, total, price |
| product   | product_name, item, sku |
| region    | area, zone, territory, country |
| customer  | customer_id, client, user_id |
| quantity  | qty, units, count |

---

## Deployment
- **Backend:** Render (set root dir to `server`, start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- **Frontend:** Vercel (set root dir to `client`)
- Update CORS origin in `server/main.py` to your Vercel URL.

---
