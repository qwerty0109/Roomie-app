'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InboxPage() {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarInbox = async () => {
      // 1. ¿Quién soy?
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'
      const miId = session.user.id

      // 2. Buscamos todas las salas de chat donde yo sea el user1 o el user2
      const { data: misChats, error } = await supabase
        .from('chats')
        .select('*')
        .or(`user1_id.eq.${miId},user2_id.eq.${miId}`)
        .order('created_at', { ascending: false })

      if (misChats) {
        // 3. Por cada chat, averiguamos quién es la "otra" persona y traemos su foto/nombre
        const chatsConPerfiles = await Promise.all(
          misChats.map(async (chat) => {
            const otroId = chat.user1_id === miId ? chat.user2_id : chat.user1_id
            const { data: perfil } = await supabase
              .from('perfiles')
              .select('id, nombre, avatar_url, rol')
              .eq('id', otroId)
              .single()
            
            return { ...chat, otroUsuario: perfil }
          })
        )
        setChats(chatsConPerfiles)
      }
      setLoading(false)
    }

    cargarInbox()
  }, [])

  if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Cargando tus mensajes...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="text-2xl hover:scale-110 transition bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm border">
            ⬅️
          </a>
          <h1 className="text-3xl font-extrabold text-gray-900">Mis Mensajes</h1>
        </div>

        {/* Lista de Chats */}
        {chats.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-200">
            <span className="text-4xl block mb-2">💬</span>
            <p className="text-gray-500 font-medium">Aún no tienes conversaciones.</p>
            <p className="text-sm text-gray-400 mt-1">¡Ve al Feed y haz match con alguien!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chats.map((chat) => (
              <a 
                key={chat.id} 
                href={`/chat/${chat.otroUsuario?.id}`}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition group"
              >
                {/* Foto del otro usuario */}
                {chat.otroUsuario?.avatar_url ? (
                  <img src={chat.otroUsuario.avatar_url} className="w-14 h-14 rounded-full object-cover border-2 border-indigo-50" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl">🏠</div>
                )}
                
                {/* Datos del chat */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">{chat.otroUsuario?.nombre}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    chat.otroUsuario?.rol === 'Busco habitación' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {chat.otroUsuario?.rol}
                  </span>
                </div>
                
                <div className="text-gray-300 group-hover:text-indigo-400 transition">
                  ▶
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}