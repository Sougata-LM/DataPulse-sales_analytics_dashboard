import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
import io

# ── Column name normalizer ────────────────────────────────────────────────────
COL_ALIASES = {
    "date":     ["date", "order_date", "sale_date", "transaction_date", "purchase_date"],
    "revenue":  ["revenue", "sales", "amount", "total", "price", "total_amount", "sale_amount", "value"],
    "product":  ["product", "product_name", "item", "item_name", "sku", "product_id"],
    "region":   ["region", "area", "zone", "territory", "location", "country", "state", "city"],
    "customer": ["customer", "customer_id", "client", "client_id", "customer_name", "user_id"],
    "quantity": ["quantity", "qty", "units", "count", "volume"],
    "category": ["category", "product_category", "type", "segment", "department"],
}

def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Rename columns to standard names based on known aliases."""
    rename_map = {}
    lower_cols = {c.lower().strip().replace(" ", "_"): c for c in df.columns}
    for standard, aliases in COL_ALIASES.items():
        if standard not in lower_cols:
            for alias in aliases:
                if alias in lower_cols:
                    rename_map[lower_cols[alias]] = standard
                    break
    return df.rename(columns=rename_map)


# ── Data Cleaning ─────────────────────────────────────────────────────────────
def clean_data(df: pd.DataFrame):
    issues = []
    original_rows = len(df)

    df = _normalize_columns(df)

    # Drop fully empty rows/cols
    df.dropna(how="all", inplace=True)
    df.dropna(axis=1, how="all", inplace=True)

    # Parse date column
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], infer_datetime_format=True, errors="coerce")
        bad_dates = df["date"].isna().sum()
        if bad_dates:
            issues.append(f"Removed {bad_dates} rows with unparseable dates")
        df.dropna(subset=["date"], inplace=True)
        df.sort_values("date", inplace=True)
    else:
        issues.append("No 'date' column detected — time-series charts will be unavailable")

    # Clean revenue
    if "revenue" in df.columns:
        if df["revenue"].dtype == object:
            df["revenue"] = df["revenue"].astype(str).str.replace(r"[$,€£\s]", "", regex=True)
        df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
        neg = (df["revenue"] < 0).sum()
        if neg:
            issues.append(f"Found {neg} negative revenue values — kept as-is (may be returns)")
        df["revenue"].fillna(0, inplace=True)

    # Clean quantity
    if "quantity" in df.columns:
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(1)

    # Remove duplicates
    dups = df.duplicated().sum()
    if dups:
        df.drop_duplicates(inplace=True)
        issues.append(f"Removed {dups} duplicate rows")

    removed = original_rows - len(df)
    if removed > 0:
        issues.append(f"Total rows removed during cleaning: {removed}")

    df.reset_index(drop=True, inplace=True)
    return df, issues


# ── Summary KPIs ──────────────────────────────────────────────────────────────
def get_summary_stats(df: pd.DataFrame) -> dict:
    stats = {"total_rows": len(df)}

    if "revenue" in df.columns:
        stats["total_revenue"] = round(float(df["revenue"].sum()), 2)
        stats["avg_order_value"] = round(float(df["revenue"].mean()), 2)
        stats["median_order_value"] = round(float(df["revenue"].median()), 2)
        stats["max_order_value"] = round(float(df["revenue"].max()), 2)

    if "customer" in df.columns:
        stats["unique_customers"] = int(df["customer"].nunique())

    if "product" in df.columns:
        stats["unique_products"] = int(df["product"].nunique())

    if "region" in df.columns:
        stats["unique_regions"] = int(df["region"].nunique())

    if "date" in df.columns and "revenue" in df.columns:
        # Month-over-month growth
        df["_month"] = df["date"].dt.to_period("M")
        monthly = df.groupby("_month")["revenue"].sum()
        if len(monthly) >= 2:
            last = float(monthly.iloc[-1])
            prev = float(monthly.iloc[-2])
            stats["mom_growth_pct"] = round(((last - prev) / prev) * 100, 1) if prev != 0 else 0
            stats["latest_month_revenue"] = round(last, 2)
        df.drop(columns=["_month"], inplace=True)

    return stats


# ── Revenue Trend ─────────────────────────────────────────────────────────────
def get_revenue_trend(df: pd.DataFrame, period: str = "monthly") -> list:
    if "date" not in df.columns or "revenue" not in df.columns:
        return []

    freq = "ME" if period == "monthly" else "W"
    label_fmt = "%b %Y" if period == "monthly" else "%d %b"

    trend = df.resample(freq, on="date")["revenue"].agg(["sum", "count", "mean"]).reset_index()
    trend.columns = ["date", "revenue", "orders", "avg_order"]
    return [
        {
            "date": row["date"].strftime(label_fmt),
            "revenue": round(row["revenue"], 2),
            "orders": int(row["orders"]),
            "avg_order": round(row["avg_order"], 2),
        }
        for _, row in trend.iterrows()
    ]


# ── Top Products ──────────────────────────────────────────────────────────────
def get_top_products(df: pd.DataFrame, limit: int = 10) -> list:
    if "product" not in df.columns or "revenue" not in df.columns:
        return []
    top = (
        df.groupby("product")["revenue"]
        .agg(["sum", "count"])
        .rename(columns={"sum": "revenue", "count": "orders"})
        .sort_values("revenue", ascending=False)
        .head(limit)
        .reset_index()
    )
    return [
        {"product": row["product"], "revenue": round(row["revenue"], 2), "orders": int(row["orders"])}
        for _, row in top.iterrows()
    ]


# ── Regional Breakdown ────────────────────────────────────────────────────────
def get_regional_breakdown(df: pd.DataFrame) -> list:
    if "region" not in df.columns or "revenue" not in df.columns:
        return []
    regional = (
        df.groupby("region")["revenue"]
        .agg(["sum", "count", "mean"])
        .rename(columns={"sum": "revenue", "count": "orders", "mean": "avg_order"})
        .sort_values("revenue", ascending=False)
        .reset_index()
    )
    total = regional["revenue"].sum()
    return [
        {
            "region": row["region"],
            "revenue": round(row["revenue"], 2),
            "orders": int(row["orders"]),
            "avg_order": round(row["avg_order"], 2),
            "share_pct": round((row["revenue"] / total) * 100, 1) if total else 0,
        }
        for _, row in regional.iterrows()
    ]


# ── Customer Segments ─────────────────────────────────────────────────────────
def get_customer_segments(df: pd.DataFrame) -> list:
    if "customer" not in df.columns or "revenue" not in df.columns:
        return []
    customer_spend = df.groupby("customer")["revenue"].sum()
    q1 = customer_spend.quantile(0.33)
    q2 = customer_spend.quantile(0.66)

    def segment(val):
        if val <= q1:      return "Low Value"
        elif val <= q2:    return "Mid Value"
        else:              return "High Value"

    segmented = customer_spend.apply(segment).value_counts().reset_index()
    segmented.columns = ["segment", "count"]
    revenue_by_seg = df.copy()
    revenue_by_seg["segment"] = df.groupby("customer")["revenue"].transform("sum").apply(segment)
    rev = revenue_by_seg.groupby("segment")["revenue"].sum().reset_index()
    result = segmented.merge(rev, on="segment")
    return [
        {"segment": row["segment"], "customers": int(row["count"]), "revenue": round(row["revenue"], 2)}
        for _, row in result.iterrows()
    ]


# ── Monthly Heatmap (day of week x week of month) ────────────────────────────
def get_monthly_heatmap(df: pd.DataFrame) -> list:
    if "date" not in df.columns or "revenue" not in df.columns:
        return []
    d = df.copy()
    d["dow"] = d["date"].dt.day_name()
    d["week"] = d["date"].dt.isocalendar().week.astype(int)
    pivot = d.groupby(["dow", "week"])["revenue"].sum().reset_index()
    return [
        {"day": row["dow"], "week": int(row["week"]), "revenue": round(row["revenue"], 2)}
        for _, row in pivot.iterrows()
    ]


# ── Forecast (simple linear regression) ──────────────────────────────────────
def get_forecast(df: pd.DataFrame, periods: int = 6) -> dict:
    if "date" not in df.columns or "revenue" not in df.columns:
        return {"historical": [], "forecast": []}

    monthly = df.resample("ME", on="date")["revenue"].sum().reset_index()
    monthly.columns = ["date", "revenue"]

    if len(monthly) < 3:
        return {"historical": [], "forecast": [], "error": "Not enough data for forecast (need 3+ months)"}

    # Linear regression on month index
    x = np.arange(len(monthly))
    y = monthly["revenue"].values
    coeffs = np.polyfit(x, y, 1)
    slope, intercept = coeffs

    historical = [
        {"date": row["date"].strftime("%b %Y"), "revenue": round(row["revenue"], 2), "type": "actual"}
        for _, row in monthly.iterrows()
    ]

    last_date = monthly["date"].iloc[-1]
    forecast = []
    for i in range(1, periods + 1):
        future_date = last_date + pd.DateOffset(months=i)
        pred = slope * (len(monthly) + i - 1) + intercept
        forecast.append({
            "date": future_date.strftime("%b %Y"),
            "revenue": round(max(pred, 0), 2),
            "type": "forecast"
        })

    r_squared = float(np.corrcoef(x, y)[0, 1] ** 2) if len(x) > 1 else 0

    return {
        "historical": historical,
        "forecast": forecast,
        "slope": round(float(slope), 2),
        "r_squared": round(r_squared, 3),
        "trend": "upward" if slope > 0 else "downward",
    }


# ── PDF Report ────────────────────────────────────────────────────────────────
def generate_pdf_report(df: pd.DataFrame, filename: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=22, spaceAfter=6, textColor=colors.HexColor("#1a1a2e"))
    heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], fontSize=13, spaceAfter=4, textColor=colors.HexColor("#16213e"))
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, spaceAfter=4)

    story.append(Paragraph("Sales Analytics Report", title_style))
    story.append(Paragraph(f"Source: {filename} | Generated: {datetime.now().strftime('%d %b %Y %H:%M')}", body_style))
    story.append(Spacer(1, 0.2*inch))

    # Summary stats
    stats = get_summary_stats(df)
    story.append(Paragraph("Key Performance Indicators", heading_style))
    kpi_data = [
        ["Metric", "Value"],
        ["Total Revenue", f"${stats.get('total_revenue', 0):,.2f}"],
        ["Total Orders", f"{stats.get('total_rows', 0):,}"],
        ["Average Order Value", f"${stats.get('avg_order_value', 0):,.2f}"],
        ["Unique Customers", f"{stats.get('unique_customers', 'N/A')}"],
        ["Unique Products", f"{stats.get('unique_products', 'N/A')}"],
        ["MoM Growth", f"{stats.get('mom_growth_pct', 'N/A')}%"],
    ]
    t = Table(kpi_data, colWidths=[3*inch, 3*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f9fa"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.25*inch))

    # Top products
    top = get_top_products(df, 5)
    if top:
        story.append(Paragraph("Top 5 Products by Revenue", heading_style))
        prod_data = [["Product", "Revenue", "Orders"]] + [
            [p["product"], f"${p['revenue']:,.2f}", str(p["orders"])] for p in top
        ]
        pt = Table(prod_data, colWidths=[3.5*inch, 1.5*inch, 1.5*inch])
        pt.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f9fa"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(pt)
        story.append(Spacer(1, 0.25*inch))

    # Regional breakdown
    regional = get_regional_breakdown(df)
    if regional:
        story.append(Paragraph("Regional Performance", heading_style))
        reg_data = [["Region", "Revenue", "Share %", "Orders"]] + [
            [r["region"], f"${r['revenue']:,.2f}", f"{r['share_pct']}%", str(r["orders"])]
            for r in regional[:8]
        ]
        rt = Table(reg_data, colWidths=[2.5*inch, 2*inch, 1.25*inch, 1.25*inch])
        rt.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f9fa"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(rt)
        story.append(Spacer(1, 0.25*inch))

    # Forecast
    fc = get_forecast(df)
    if fc.get("forecast"):
        story.append(Paragraph("6-Month Revenue Forecast", heading_style))
        story.append(Paragraph(
            f"Trend: {fc['trend'].capitalize()} | Monthly slope: ${fc['slope']:,}/month | R²: {fc['r_squared']}",
            body_style
        ))
        fc_data = [["Month", "Predicted Revenue"]] + [
            [f["date"], f"${f['revenue']:,.2f}"] for f in fc["forecast"]
        ]
        ft = Table(fc_data, colWidths=[3*inch, 3*inch])
        ft.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#533483")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f9fa"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(ft)

    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph("Generated by Sales Analytics Dashboard", ParagraphStyle("footer", parent=styles["Normal"], fontSize=8, textColor=colors.gray)))

    doc.build(story)
    return buffer.getvalue()
