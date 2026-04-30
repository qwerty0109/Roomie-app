'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

const ETIQUETAS_DISPONIBLES = ["Limpio", "Paga a tiempo", "Sociable", "Respetuoso", "Tranquilo", "Buen cocinero"]

export default function ValorarPage() {
  const params = useParams()
  const perfilId = params.id as string
  
  const [autorId, setAutorId] = useState('')
  const [perfil, setPerfil] = useState<any>(null)
  const [comentario, setComentario] = useState('')
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setAutorId(session.user.id)
      
      const { data } = await supabase.from('perfiles').select('*').eq('id', perfilId).single()
      setPerfil(data)
    }
    checkUser()
  }, [perfilId])

  const toggleEtiqueta = (tag: string) => {
    setEtiquetasSeleccionadas(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const enviarValoracion = async () => {
    if (!comentario) return alert("Escribe un pequeño comentario")
    setEnviando(true)

    const { error } = await supabase.from('valoraciones').insert({
      perfil_id: perfilId,
      autor_id: autorId,
      comentario,
      etiquetas: etiquetasSeleccionadas
    })

    if (error) alert("Error: " + error.message)
    else {
      alert("¡Gracias por tu valoración!")
      window.location.href = '/'
    }
    setEnviando(false)
  }

  if (!perfil) return <div className="p-10 text-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Valorar a {perfil.nombre}</h1>
        <p className="text-gray-500 mb-6 text-sm">Tu opinión ayuda a mantener la comunidad segura.</p>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">¿Qué etiquetas le definen?</label>
          <div className="flex flex-wrap gap-2">
            {ETIQUETAS_DISPONIBLES.map(tag => (
              <button
                key={tag}
                onClick={() => toggleEtiqueta(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  etiquetasSeleccionadas.includes(tag) 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">Comentario sobre la convivencia</label>
          <textarea
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-indigo-400 text-black h-32"
            placeholder="¿Cómo ha sido vivir con esta persona?"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        <button
          onClick={enviarValoracion}
          disabled={enviando}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          {enviando ? "Enviando..." : "Publicar reseña"}
        </button>
      </div>
    </div>
  )
}