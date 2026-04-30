'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [perfiles, setPerfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [miCiudad, setMiCiudad] = useState('')

  useEffect(() => {
    const fetchDatos = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return; }

      const { data: miPerfil } = await supabase.from('perfiles').select('rol, ciudad').eq('id', session.user.id).single()
      
      if (miPerfil) {
        setMiCiudad(miPerfil.ciudad || 'tu ciudad')
        const rolBuscado = miPerfil.rol === 'Busco habitación' ? 'Ofrezco habitación' : 'Busco habitación'

        // FILTRO DUAL: Rol contrario y MISMA ciudad
        const { data: listaPerfiles, error } = await supabase
          .from('perfiles')
          .select('*, valoraciones(etiquetas)')
          .eq('rol', rolBuscado)
          .eq('ciudad', miPerfil.ciudad) // Solo gente de mi ciudad
          .neq('id', session.user.id)

        if (error) console.error(error)
        else setPerfiles(listaPerfiles || [])
      }
      setLoading(false)
    }

    fetchDatos()
  }, [])

  const procesarEtiquetas = (valoraciones: any[]) => {
    const conteo: any = {}
    valoraciones?.forEach(v => {
      v.etiquetas?.forEach((tag: string) => { conteo[tag] = (conteo[tag] || 0) + 1 })
    })
    return Object.entries(conteo).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2)
  }

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-indigo-600">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <header className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-indigo-600">RoomieApp</h1>
        <div className="flex gap-2">
          <a href="/mensajes" className="bg-white border p-2 rounded-lg shadow-sm">💬</a>
          <a href="/perfil" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Mi Perfil</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Roomies en {miCiudad}</h2>
        </div>

        {perfiles.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center border-2 border-dashed">
            <span className="text-4xl block mb-2">📍</span>
            <p className="text-gray-600 font-medium">No hay nadie disponible en {miCiudad} ahora mismo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {perfiles.map((perfil) => {
              const topEtiquetas = procesarEtiquetas(perfil.valoraciones || [])
              return (
                <div key={perfil.id} className="bg-white rounded-3xl shadow-sm border overflow-hidden flex flex-col">
                  <div className="h-64 w-full relative">
                    <img src={perfil.avatar_url || 'https://via.placeholder.com/400?text=Roomie'} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 bg-gradient-to-t from-black/60 p-4 w-full">
                      <h3 className="text-white text-xl font-bold">{perfil.nombre}, {perfil.edad}</h3>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex gap-2 mb-4">
                      {topEtiquetas.map(([tag, count]: any) => (
                        <span key={tag} className="bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full border border-amber-200">
                          🏆 {count} dicen "{tag}"
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">"{perfil.biografia}"</p>
                    <a href={`/chat/${perfil.id}`} className="mt-auto w-full text-center bg-gray-900 text-white py-3 rounded-2xl font-bold">
                      Hablar
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}