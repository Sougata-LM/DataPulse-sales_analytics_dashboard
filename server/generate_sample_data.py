"""Run this script to generate a sample CSV for testing the dashboard."""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

random.seed(42)
np.random.seed(42)

PRODUCTS = [
    "Laptop Pro 15", "Wireless Headphones", "USB-C Hub", "Mechanical Keyboard",
    "4K Monitor", "Webcam HD", "Standing Desk Mat", "Ergonomic Chair",
    "SSD 1TB", "RAM 32GB", "Smart Watch", "Tablet 10in",
]
REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"]
CUSTOMERS = [f"CUST_{i:04d}" for i in range(1, 201)]

rows = []
start = datetime(2023, 1, 1)
for i in range(2000):
    date = start + timedelta(days=random.randint(0, 548))
    product = random.choice(PRODUCTS)
    base_prices = {
        "Laptop Pro 15": 1299, "Wireless Headphones": 199, "USB-C Hub": 49,
        "Mechanical Keyboard": 149, "4K Monitor": 599, "Webcam HD": 89,
        "Standing Desk Mat": 39, "Ergonomic Chair": 449, "SSD 1TB": 119,
        "RAM 32GB": 89, "Smart Watch": 299, "Tablet 10in": 499,
    }
    price = base_prices[product] * (1 + np.random.normal(0, 0.1))
    qty = random.randint(1, 5)
    rows.append({
        "order_date": date.strftime("%Y-%m-%d"),
        "product_name": product,
        "region": random.choice(REGIONS),
        "customer_id": random.choice(CUSTOMERS),
        "quantity": qty,
        "revenue": round(price * qty, 2),
        "category": "Electronics" if product in ["Laptop Pro 15", "Smart Watch", "Tablet 10in"] else "Accessories",
    })

df = pd.DataFrame(rows)
df.to_csv("sample_sales_data.csv", index=False)
print(f"Generated {len(df)} rows → sample_sales_data.csv")
