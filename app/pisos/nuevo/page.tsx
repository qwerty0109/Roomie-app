'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CIUDADES = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Alicante", "Granada", "Otra"]

export default function NuevoPisoPage() {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [ciudad, setCiudad] = useState('Madrid')
  const [habitaciones, setHabitaciones] = useState('1')
  const [fotoUrl, setFotoUrl] = useState('')

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'
      setUserId(session.user.id)
    }
    check()
  }, [])

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImg(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      const filePath = `piso-${userId}-${Math.random()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('fotos').upload(filePath, file)
      if (error) throw error
      const { data } = supabase.storage.from('fotos').getPublicUrl(filePath)
      setFotoUrl(data.publicUrl)
    } catch (e: any) {
      alert('Error subiendo foto: ' + e.message)
    } finally {
      setUploadingImg(false)
    }
  }

  const publicarPiso = async () => {
    if (!titulo || !precio || !ciudad) return alert('Rellena título, precio y ciudad')
    setLoading(true)
    const { error } = await supabase.from('pisos').insert({
      propietario_id: userId,
      titulo,
      descripcion,
      precio: parseInt(precio),
      ciudad,
      habitaciones: parseInt(habitaciones),
      foto_url: fotoUrl,
    })
    if (error) alert('Error: ' + error.message)
    else {
      alert('¡Piso publicado!')
      window.location.href = '/pisos'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <a href="/" className="text-indigo-600 font-bold">← Volver</a>
          <h1 className="text-2xl font-black text-gray-900">Publicar mi piso</h1>
        </div>

        {/* Foto del piso */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto del piso</label>
          {fotoUrl ? (
            <div className="relative">
              <img src={fotoUrl} className="w-full h-48 object-cover rounded-xl border" />
              <button onClick={() => setFotoUrl('')} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                Cambiar
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition">
              <span className="text-3xl mb-2">📸</span>
              <span className="text-sm text-gray-500">{uploadingImg ? 'Subiendo...' : 'Haz clic para subir una foto'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={subirFoto} disabled={uploadingImg} />
            </label>
          )}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Título del anuncio</label>
        <input
          type="text" placeholder="Ej: Habitación luminosa en Malasaña"
          className="w-full p-3 mb-4 border rounded-xl outline-none focus:ring-2 ring-indigo-400 text-black"
          value={titulo} onChange={(e) => setTitulo(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          rows={3} placeholder="Describe el piso, las zonas comunes, el barrio..."
          className="w-full p-3 mb-4 border rounded-xl outline-none focus:ring-2 ring-indigo-400 text-black"
          value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio mensual (€)</label>
            <input
              type="number" placeholder="350"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-indigo-400 text-black"
              value={precio} onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
            <select
              className="w-full p-3 border rounded-xl bg-white text-black outline-none focus:ring-2 ring-indigo-400"
              value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)}
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} habitación{n > 1 ? 'es' : ''}</option>)}
            </select>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
        <select
          className="w-full p-3 mb-8 border rounded-xl bg-white text-black outline-none focus:ring-2 ring-indigo-400"
          value={ciudad} onChange={(e) => setCiudad(e.target.value)}
        >
          {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          onClick={publicarPiso} disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          {loading ? 'Publicando...' : 'Publicar piso'}
        </button>
      </div>
    </div>
  )
}