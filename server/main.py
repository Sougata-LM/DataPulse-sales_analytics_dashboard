from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import io
import os
from analytics import (
    clean_data, get_summary_stats, get_revenue_trend,
    get_top_products, get_regional_breakdown, get_customer_segments,
    get_monthly_heatmap, get_forecast, generate_pdf_report
)

app = FastAPI(title="Sales Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploaded_data: dict = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported.")

        df, issues = clean_data(df)
        uploaded_data["df"] = df
        uploaded_data["filename"] = file.filename

        return {
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "cleaning_issues": issues,
            "preview": df.head(5).to_dict(orient="records"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/summary")
def get_summary():
    df = _get_df()
    return get_summary_stats(df)

@app.get("/api/revenue-trend")
def revenue_trend(period: str = "monthly"):
    df = _get_df()
    return get_revenue_trend(df, period)

@app.get("/api/top-products")
def top_products(limit: int = 10):
    df = _get_df()
    return get_top_products(df, limit)

@app.get("/api/regional")
def regional():
    df = _get_df()
    return get_regional_breakdown(df)

@app.get("/api/segments")
def segments():
    df = _get_df()
    return get_customer_segments(df)

@app.get("/api/heatmap")
def heatmap():
    df = _get_df()
    return get_monthly_heatmap(df)

@app.get("/api/forecast")
def forecast(periods: int = 6):
    df = _get_df()
    return get_forecast(df, periods)

@app.get("/api/report")
def download_report():
    df = _get_df()
    pdf_bytes = generate_pdf_report(df, uploaded_data.get("filename", "data.csv"))
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=sales_report.pdf"}
    )

def _get_df():
    if "df" not in uploaded_data:
        raise HTTPException(status_code=400, detail="No data uploaded. Please upload a file first.")
    return uploaded_data["df"]
