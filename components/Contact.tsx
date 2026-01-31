
import React from 'react';

const Contact: React.FC = () => {
  const branches = [
    {
      name: "Sucursal Ferrocarril",
      address: "Avenida ferrocarril 805- D",
      phone: "951-143-34-67",
      phoneRaw: "9511433467",
      mobile: "951-235-95-85",
      mobileRaw: "9512359585",
      hours: "Lunes a Viernes de 8:30 am a 6:30 pm, Sábados de 8:30 am a 4:30 pm.",
      mapLink: "https://maps.app.goo.gl/o3jfpZWSohha3w2n8?g_st=afm",
      color: "blue"
    },
    {
      name: "Sucursal Las culturas xoxo",
      address: "Carr. A.Arrazola 118, 21 de marzo, col. Las culturas.",
      phone: "951-768-30-49",
      phoneRaw: "9517683049",
      mobile: "951-652-35-93",
      mobileRaw: "9516523593",
      hours: "Lunes a Viernes de 8:30 am a 6:00 pm, Sábados de 8:30 am a 4:30 pm.",
      mapLink: "https://maps.app.goo.gl/kjmbXhMzDKT5hfax9?g_st=afm",
      color: "indigo"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Nuestras Sucursales</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Visítanos en cualquiera de nuestras ubicaciones en Oaxaca. Estamos listos para asesorarte en tu próximo proyecto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {branches.map((branch, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col">
            <div className={`h-2 bg-${branch.color}-600`} />
            <div className="p-8 md:p-10 flex-grow">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">{branch.name}</h3>
              
              <div className="space-y-8">
                {/* Address Section */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-${branch.color}-50 text-${branch.color}-600`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Dirección</h4>
                    <p className="text-slate-600 leading-relaxed mb-2">{branch.address}</p>
                    <a 
                      href={branch.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center text-xs font-bold text-${branch.color}-600 hover:underline gap-1`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.512a2 2 0 011.553-1.943L9 2l6 3 5.447-2.724A2 2 0 0121 4.112v9.976a2 2 0 01-1.553 1.943L15 19l-6-3z" />
                      </svg>
                      ¿CÓMO LLEGAR?
                    </a>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-${branch.color}-50 text-${branch.color}-600`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Contacto</h4>
                    <div className="space-y-4">
                      {/* Phone 1 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-2">
                        <span className="text-slate-600 text-sm font-medium">Tel: {branch.phone}</span>
                        <div className="flex gap-2">
                          <a href={`tel:${branch.phoneRaw}`} className={`p-1.5 rounded-lg bg-${branch.color}-100 text-${branch.color}-700 hover:bg-${branch.color}-200 transition-colors shadow-sm`} title="Llamar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                      {/* Mobile / WhatsApp */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-2">
                        <span className="text-slate-600 text-sm font-medium">Cel: {branch.mobile}</span>
                        <div className="flex gap-2">
                          <a href={`tel:${branch.mobileRaw}`} className={`p-1.5 rounded-lg bg-${branch.color}-100 text-${branch.color}-700 hover:bg-${branch.color}-200 transition-colors shadow-sm`} title="Llamar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </a>
                          <a href={`https://wa.me/52${branch.mobileRaw}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors shadow-sm" title="WhatsApp">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-${branch.color}-50 text-${branch.color}-600`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Horario</h4>
                    <p className="text-slate-600 leading-snug">{branch.hours}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 mt-auto">
              <a 
                href={branch.mapLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-4 bg-${branch.color}-600 text-white font-bold rounded-xl hover:bg-${branch.color}-700 transition-all shadow-lg shadow-${branch.color}-200 group`}
              >
                <span>Ver ubicación exacta</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center">
        <p className="text-slate-400 italic">Sitio web: www.pinturasdiamante.com</p>
      </div>
    </section>
  );
};

export default Contact;
