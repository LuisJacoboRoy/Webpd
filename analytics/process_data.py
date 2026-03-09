import pandas as pd
import os
from datetime import datetime, timedelta
from extract_sitemap import extract_sitemap_urls
from fetch_metrics import get_ga4_metrics, get_gsc_metrics

def main():
    # 1. Extraer URLs del Sitemap
    sitemap_url = "https://pinturasdiamante.com/sitemap.xml"
    urls = extract_sitemap_urls(sitemap_url)
    df_sitemap = pd.DataFrame(urls, columns=["url"])
    
    # 2. Obtener métricas de GA4 (si existe credentials.json)
    creds_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
    property_id = '478440306' # Un Property ID de ejemplo o dejar vacío para que el usuario complete
    
    if os.path.exists(creds_path):
        print("Obteniendo métricas de GA4...")
        df_ga4 = get_ga4_metrics(property_id, creds_path)
        
        print("Obteniendo métricas de Search Console...")
        df_gsc = get_gsc_metrics(creds_path, 'https://pinturasdiamante.com/')
        
        # Procesar URLs para que coincidan
        # GA4 usa paths (/catalog), GSC usa URLs completas
        df_ga4['full_url'] = df_ga4['url_path'].apply(lambda x: 'https://pinturasdiamante.com' + x if not x.startswith('http') else x)
        
        # Cruze de datos
        merged_df = pd.merge(df_sitemap, df_gsc, on='url', how='left')
        merged_df = pd.merge(merged_df, df_ga4[['full_url', 'page_views', 'users', 'bounce_rate']], left_on='url', right_on='full_url', how='left')
        
        # Limpieza
        merged_df = merged_df.drop(columns=['full_url'])
        merged_df = merged_df.fillna(0)
        
        output_file = os.path.join(os.path.dirname(__file__), 'consolidated_performance.csv')
        merged_df.to_csv(output_file, index=False)
        print(f"Éxito: Datos consolidados en {output_file}")
    else:
        print("Aviso: No se encontraron credenciales. El dashboard usará datos de prueba.")
        # Generar datos de prueba para que el usuario vea el potencial
        df_mock = df_sitemap.copy()
        import numpy as np
        df_mock['clicks'] = np.random.randint(0, 100, size=len(df_mock))
        df_mock['impressions'] = np.random.randint(100, 1000, size=len(df_mock))
        df_mock['position'] = np.random.uniform(1, 20, size=len(df_mock)).round(1)
        df_mock['page_views'] = np.random.randint(0, 500, size=len(df_mock))
        df_mock['users'] = np.random.randint(0, 200, size=len(df_mock))
        df_mock['bounce_rate'] = np.random.uniform(20, 80, size=len(df_mock)).round(2)
        
        output_file = os.path.join(os.path.dirname(__file__), 'consolidated_performance.csv')
        df_mock.to_csv(output_file, index=False)
        print(f"Datos de prueba generados en {output_file}")

if __name__ == "__main__":
    main()
