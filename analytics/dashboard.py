import streamlit as st
import pandas as pd
import os

st.set_page_config(page_title="Performance Dashboard - Pinturas Diamante", layout="wide")

st.title("📊 Panel de Rendimiento SEO y Analítica")
st.markdown("Consolidación de datos de **Google Search Console** y **Google Analytics 4** para pinturasdiamante.com")

# Cargar datos
data_file = os.path.join(os.path.dirname(__file__), 'consolidated_performance.csv')

if os.path.exists(data_file):
    df = pd.read_csv(data_file)
    
    # Métricas clave (Resumen)
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Clics (30d)", f"{df['clicks'].sum():,}")
    with col2:
        st.metric("Total Impresiones", f"{df['impressions'].sum():,}")
    with col3:
        st.metric("Total Vistas", f"{df['page_views'].sum():,}")
    with col4:
        st.metric("Posición Media", f"{df['position'].mean():.1f}")

    st.divider()

    # Tabla Interactiva
    st.subheader("Detalle por URL")
    
    # Filtro de búsqueda
    search = st.text_input("Filtrar por URL o categoría:")
    if search:
        df = df[df['url'].str.contains(search, case=False)]

    # Estilo de la tabla
    st.dataframe(
        df.style.background_gradient(subset=['clicks', 'page_views'], cmap='BuGn')
                .background_gradient(subset=['bounce_rate'], cmap='Reds')
                .format({'position': '{:.1f}', 'bounce_rate': '{:.2f}%'}),
        use_container_width=True,
        height=600
    )
    
    # Botón para descargar
    csv = df.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="Descargar datos en CSV",
        data=csv,
        file_name='performance_pinturas_diamante.csv',
        mime='text/csv',
    )
else:
    st.error("No se encontró el archivo de datos. Por favor ejecuta `process_data.py` primero.")
    st.info("Asegúrate de haber configurado tu `credentials.json` en la carpeta `analytics/`.")

st.sidebar.info("### Configuración\nPara actualizar los datos, ejecuta:\n`python process_data.py` dentro de la carpeta `analytics`.")
