'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PisosPage() {
  const [pisos, setPisos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('pisos')
        .select('*, perfiles(nombre, avatar_url)')
        .order('created_at', { ascending: false })
      setPisos(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-indigo-600 font-bold">
      Cargando pisos...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <a href="/" className="text-indigo-600 font-bold text-sm">← Volver</a>
            <h1 className="text-3xl font-black text-gray-900 mt-1">Pisos disponibles</h1>
          </div>
          
            href="/pisos/nuevo"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
          >
            + Publicar mi piso
          </a>
        </div>

        {pisos.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border-2 border-dashed text-center">
            <span className="text-4xl block mb-2">🏠</span>
            <p className="text-gray-600 font-medium">Aún no hay pisos publicados.</p>
            <a href="/pisos/nuevo" className="text-indigo-600 font-bold text-sm mt-2 inline-block">
              Sé el primero en publicar →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pisos.map((piso) => (
              <div key={piso.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition flex flex-col">
                <div className="h-52 relative">
                  {piso.foto_url ? (
                    <img src={piso.foto_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">🏠</div>
                  )}
                  <div className="absolute top-3 left-3 bg-white text-gray-900 font-black text-sm px-3 py-1 rounded-full shadow">
                    {piso.precio}€/mes
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-black text-gray-900 text-lg mb-1">{piso.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-1">📍 {piso.ciudad} · 🛏 {piso.habitaciones} hab.</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{piso.descripcion}</p>
                  <div className="flex items-center gap-2 mb-4">
                    {piso.perfiles?.avatar_url ? (
                      <img src={piso.perfiles.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">👤</div>
                    )}
                    <span className="text-xs text-gray-500">
                      Publicado por <b>{piso.perfiles?.nombre}</b>
                    </span>
                  </div>
                  
                    href={`/chat/${piso.propietario_id}`}
                    className="w-full text-center bg-gray-900 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-600 transition"
                  >
                    Contactar propietario
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}