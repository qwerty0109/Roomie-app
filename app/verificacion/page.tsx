'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function VerificacionPage() {
  const [userId, setUserId] = useState('')
  const [verificado, setVerificado] = useState(false)
  const [pendiente, setPendiente] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dniUrl, setDniUrl] = useState('')

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'
      setUserId(session.user.id)

      const { data } = await supabase
        .from('perfiles')
        .select('verificado, dni_url')
        .eq('id', session.user.id)
        .single()

      if (data?.verificado) setVerificado(true)
      if (data?.dni_url) setPendiente(true)
    }
    check()
  }, [])

  const subirDNI = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      const filePath = `dni-${userId}-${Math.random()}.${file.name.split('.').pop()}`

      const { error } = await supabase.storage.from('fotos').upload(filePath, file)
      if (error) throw error

      const { data } = supabase.storage.from('fotos').getPublicUrl(filePath)
      setDniUrl(data.publicUrl)

      // Guardamos la URL del DNI — un admin lo revisará manualmente
      await supabase.from('perfiles').update({ dni_url: data.publicUrl }).eq('id', userId)

      setPendiente(true)
      alert('¡DNI enviado! Tu perfil será verificado en menos de 24h.')
    } catch (e: any) {
      alert('Error: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border shadow-sm p-8">
        <a href="/perfil" className="text-indigo-600 font-bold text-sm">← Volver al perfil</a>

        <div className="text-center my-8">
          <span className="text-6xl block mb-4">🛡️</span>
          <h1 className="text-2xl font-black text-gray-900">Verificación de identidad</h1>
          <p className="text-gray-500 mt-2 text-sm">Los perfiles verificados generan 3x más confianza y aparecen primero en búsquedas.</p>
        </div>

        {verificado ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <span className="text-4xl block mb-2">✅</span>
            <h2 className="text-xl font-black text-emerald-700">¡Ya estás verificado!</h2>
            <p className="text-emerald-600 text-sm mt-1">Tu badge aparece en tu perfil y en el feed.</p>
          </div>
        ) : pendiente ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <span className="text-4xl block mb-2">⏳</span>
            <h2 className="text-xl font-black text-amber-700">Verificación en proceso</h2>
            <p className="text-amber-600 text-sm mt-1">Hemos recibido tu DNI. Te avisaremos en menos de 24h.</p>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-emerald-500">✓</span> Tu DNI solo lo veremos nosotros
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-emerald-500">✓</span> No se mostrará públicamente
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-emerald-500">✓</span> Se elimina tras la verificación
              </div>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition mb-6">
              <span className="text-3xl mb-2">📄</span>
              <span className="text-sm font-medium text-gray-600">
                {uploading ? 'Subiendo...' : 'Subir foto del DNI'}
              </span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG — máx 5MB</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={subirDNI}
                disabled={uploading}
              />
            </label>

            <p className="text-xs text-gray-400 text-center">
              Al subir tu DNI aceptas que Roomie lo revise manualmente para confirmar tu identidad.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
