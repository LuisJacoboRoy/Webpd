import requests
import xml.etree.ElementTree as ET
import pandas as pd
import os

def extract_sitemap_urls(url):
    """
    Lee y parsea el sitemap XML para extraer todas las URLs.
    """
    print(f"Extrayendo URLs de {url}...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        
        # El sitemap suele tener un namespace
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        urls = []
        for url_tag in root.findall('ns:url', namespace):
            loc_tag = url_tag.find('ns:loc', namespace)
            if loc_tag is not None:
                urls.append(loc_tag.text)
        
        print(f"Se encontraron {len(urls)} URLs.")
        return urls
    except Exception as e:
        print(f"Error al extraer el sitemap: {e}")
        return []

if __name__ == "__main__":
    sitemap_url = "https://pinturasdiamante.com/sitemap.xml"
    urls = extract_sitemap_urls(sitemap_url)
    
    if urls:
        # Guardar temporalmente para verificar
        df = pd.DataFrame(urls, columns=["url"])
        output_path = os.path.join(os.path.dirname(__file__), "urls_extraidas.csv")
        df.to_csv(output_path, index=False)
        print(f"URLs guardadas en {output_path}")
