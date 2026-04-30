'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function ChatPage() {
  const params = useParams()
  const otroUsuarioId = params.id as string // Capturamos el ID del usuario al que le dimos clic

  const [miId, setMiId] = useState('')
  const [chatId, setChatId] = useState('')
  const [mensajes, setMensajes] = useState<any[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [otroUsuario, setOtroUsuario] = useState<any>(null)

  useEffect(() => {
    const iniciarChat = async () => {
      // 1. Obtener mi usuario
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'
      const miUid = session.user.id
      setMiId(miUid)

      // 2. Obtener datos de la otra persona para la cabecera
      const { data: perfilOtro } = await supabase.from('perfiles').select('*').eq('id', otroUsuarioId).single()
      if (perfilOtro) setOtroUsuario(perfilOtro)

      // 3. Buscar si ya existe un chat entre nosotros dos
      let { data: chats } = await supabase
        .from('chats')
        .select('*')
        .or(`and(user1_id.eq.${miUid},user2_id.eq.${otroUsuarioId}),and(user1_id.eq.${otroUsuarioId},user2_id.eq.${miUid})`)

      let idDelChat = ''

      if (chats && chats.length > 0) {
        idDelChat = chats[0].id // Ya habíamos hablado
      } else {
        // 4. Si es la primera vez que hablamos, creamos la sala
        const { data: nuevoChat } = await supabase
          .from('chats')
          .insert({ user1_id: miUid, user2_id: otroUsuarioId })
          .select()
          .single()
        if (nuevoChat) idDelChat = nuevoChat.id
      }

      setChatId(idDelChat)

      // 5. Cargar el historial de mensajes
      if (idDelChat) {
        const { data: msjs } = await supabase
          .from('mensajes')
          .select('*')
          .eq('chat_id', idDelChat)
          .order('created_at', { ascending: true })
        if (msjs) setMensajes(msjs)
      }
    }

    iniciarChat()
  }, [otroUsuarioId])

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatId) return

    // Añadimos el mensaje a la pantalla al instante (para que parezca rápido)
    const msj = { emisor_id: miId, texto: nuevoMensaje, created_at: new Date().toISOString() }
    setMensajes([...mensajes, msj])
    setNuevoMensaje('')

    // Lo enviamos a la base de datos de fondo
    await supabase.from('mensajes').insert({
      chat_id: chatId,
      emisor_id: miId,
      texto: msj.texto
    })
  }

  if (!otroUsuario) return <div className="p-10 text-center font-bold text-indigo-600">Conectando...</div>

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-2xl mx-auto border-x shadow-xl">
      {/* Cabecera del chat */}
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-4 z-10">
        <a href="/" className="text-2xl hover:scale-110 transition">⬅️</a>
        {otroUsuario.avatar_url ? (
          <img src={otroUsuario.avatar_url} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">🏠</div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-800">{otroUsuario.nombre}</h2>
          <p className="text-xs text-emerald-500 font-semibold">● En línea</p>
        </div>
      </div>

      {/* Historial de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {mensajes.length === 0 && (
          <div className="text-center mt-10">
            <span className="text-5xl block mb-3">👋</span>
            <p className="text-gray-500 font-medium">¡Di hola a {otroUsuario.nombre}!</p>
          </div>
        )}
        
        {mensajes.map((m, i) => (
          <div key={i} className={`max-w-[75%] p-3 rounded-2xl text-sm ${
            m.emisor_id === miId 
            ? 'bg-indigo-600 text-white self-end rounded-tr-sm' 
            : 'bg-white border text-gray-800 self-start rounded-tl-sm shadow-sm'
          }`}>
            {m.texto}
          </div>
        ))}
      </div>

      {/* Barra para escribir */}
      <div className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text" 
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
          placeholder="Escribe un mensaje..."
          className="flex-1 border p-3 rounded-full outline-none focus:border-indigo-500 focus:ring-2 ring-indigo-200 text-black"
        />
        <button 
          onClick={enviarMensaje} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}