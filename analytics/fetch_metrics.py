import os
import pandas as pd
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
    OrderBy
)
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Configuración
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')
PROPERTY_ID = 'TU_PROPERTY_ID_AQUI'  # El usuario debe llenar esto
SITE_URL = 'https://pinturasdiamante.com/'

def get_ga4_metrics(property_id, creds_path):
    """Obtiene Vistas, Usuarios y Tasa de Rebote de GA4."""
    if not os.path.exists(creds_path):
        print("Error: No se encontró credentials.json")
        return pd.DataFrame()

    client = BetaAnalyticsDataClient.from_service_account_json(creds_path)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[
            Metric(name="screenPageViews"),
            Metric(name="activeUsers"),
            Metric(name="bounceRate"),
        ],
        date_ranges=[DateRange(start_date="30daysAgo", end_date="today")],
    )

    response = client.run_report(request)
    
    data = []
    for row in response.rows:
        data.append({
            "url_path": row.dimension_values[0].value,
            "page_views": int(row.metric_values[0].value),
            "users": int(row.metric_values[1].value),
            "bounce_rate": float(row.metric_values[2].value)
        })
    
    return pd.DataFrame(data)

def get_gsc_metrics(creds_path, site_url):
    """Obtiene Clics, Impresiones y Posición de Search Console."""
    if not os.path.exists(creds_path):
        print("Error: No se encontró credentials.json")
        return pd.DataFrame()

    credentials = service_account.Credentials.from_service_account_file(creds_path)
    service = build('searchconsole', 'v1', credentials=credentials)

    request = {
        'startDate': '2024-02-09',  # Implementar cálculo dinámico de 30 días
        'endDate': '2024-03-09',
        'dimensions': ['page'],
        'rowLimit': 1000
    }

    # Nota: El calculo de fechas debería ser dinámico. Aquí lo dejo estático para el ejemplo inicial.
    # En la versión final usaremos datetime.
    
    response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    
    data = []
    if 'rows' in response:
        for row in response['rows']:
            data.append({
                "url": row['keys'][0],
                "clicks": row['clicks'],
                "impressions": row['impressions'],
                "position": round(row['position'], 2)
            })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Script listo. Requiere configuración de Property ID y credentials.json")
