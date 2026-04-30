'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CIUDADES = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Alicante", "Granada", "Otra"]

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [verificado, setVerificado] = useState(false)
  
  const [biografia, setBiografia] = useState('')
  const [ciudad, setCiudad] = useState('Madrid')
  const [fuma, setFuma] = useState('No')
  const [mascotas, setMascotas] = useState('No')
  const [horarios, setHorarios] = useState('Madrugador')
  const [limpieza, setLimpieza] = useState('Normal')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single()
        if (data) {
          setBiografia(data.biografia || '')
          setCiudad(data.ciudad || 'Madrid')
          setFuma(data.fuma || 'No')
          setMascotas(data.mascotas || 'No')
          setHorarios(data.horarios || 'Madrugador')
          setLimpieza(data.limpieza || 'Normal')
          setAvatarUrl(data.avatar_url || '')
          setVerificado(data.verificado || false)
        }
      } else {
        window.location.href = '/login'
      }
      setLoading(false)
    }
    cargarDatos()
  }, [])

  const subirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImg(true)
      if (!e.target.files || e.target.files.length === 0) throw new Error('Debes seleccionar una imagen.')
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('fotos').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('fotos').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
      await supabase.from('perfiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setUploadingImg(false)
    }
  }

  const actualizarPerfil = async () => {
    setLoading(true)
    const { error } = await supabase.from('perfiles').update({
      biografia, ciudad, fuma, mascotas, horarios, limpieza
    }).eq('id', user.id)
    if (error) alert('Error: ' + error.message)
    else {
      alert('¡Perfil actualizado!')
      window.location.href = '/'
    }
    setLoading(false)
  }

  if (loading) return <div className="text-center p-10 font-bold">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md mt-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Tu Perfil</h1>
          <a href="/" className="text-indigo-600 font-bold hover:underline">Volver</a>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          {avatarUrl ? (
            <img src={avatarUrl} className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 mb-4" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-sm text-gray-400">Sin foto</div>
          )}
          <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100">
            {uploadingImg ? 'Subiendo...' : 'Cambiar Foto'}
            <input type="file" accept="image/*" className="hidden" onChange={subirImagen} disabled={uploadingImg}/>
          </label>

          {/* BADGE DE VERIFICACIÓN */}
          {verificado ? (
            <span className="mt-3 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
              style={{ borderColor: '#d1fae5', color: '#065f46', background: '#f0fdf4', border: '1px solid #d1fae5' }}>
              ✅ Perfil verificado
            </span>
          ) : (
            <a href="/verificacion"
              className="mt-3 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: '#065f46', background: '#f0fdf4', border: '1px solid #d1fae5' }}>
              🛡️ Obtener badge verificado
            </a>
          )}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">¿En qué ciudad buscas/ofreces?</label>
        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg bg-white text-black focus:ring-2 ring-indigo-400 outline-none">
          {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">Tu biografía</label>
        <textarea rows={3} className="w-full p-3 mb-4 border rounded-lg outline-none text-black"
          value={biografia} onChange={(e) => setBiografia(e.target.value)} />

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div><label className="block text-sm text-gray-700 mb-1">¿Fumas?</label>
            <select value={fuma} onChange={(e) => setFuma(e.target.value)} className="w-full p-2 border rounded-lg bg-white text-black">
              <option value="No">🚭 No</option><option value="Sí">🚬 Sí</option>
            </select>
          </div>
          <div><label className="block text-sm text-gray-700 mb-1">¿Mascotas?</label>
            <select value={mascotas} onChange={(e) => setMascotas(e.target.value)} className="w-full p-2 border rounded-lg bg-white text-black">
              <option value="No">🚫 No</option><option value="Sí">🐶 Sí</option>
            </select>
          </div>
          <div><label className="block text-sm text-gray-700 mb-1">Horarios</label>
            <select value={horarios} onChange={(e) => setHorarios(e.target.value)} className="w-full p-2 border rounded-lg bg-white text-black">
              <option value="Madrugador">🐓 Madrugador</option><option value="Nocturno">🦉 Nocturno</option>
            </select>
          </div>
          <div><label className="block text-sm text-gray-700 mb-1">Limpieza</label>
            <select value={limpieza} onChange={(e) => setLimpieza(e.target.value)} className="w-full p-2 border rounded-lg bg-white text-black">
              <option value="Normal">🤷‍♂️ Normal</option><option value="Estricto">✨ Estricto</option>
            </select>
          </div>
        </div>

        <button onClick={actualizarPerfil} disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700">
          Actualizar mi Perfil
        </button>
      </div>
    </div>
  )
}