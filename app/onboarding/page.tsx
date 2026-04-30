'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [rol, setRol] = useState('Busco habitación')
  const [loading, setLoading] = useState(false)

  // Esto comprueba qué usuario ha iniciado sesión
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      } else {
        window.location.href = '/login' // Si no hay usuario, lo manda al login
      }
    }
    getUser()
  }, [])

  const guardarPerfil = async () => {
    if (!nombre || !edad) return alert('Por favor, rellena todos los campos')
    setLoading(true)

    // Guardamos los datos en nuestra tabla "perfiles"
    const { error } = await supabase.from('perfiles').upsert({
      id: user.id, // Unimos este perfil con el usuario registrado
      nombre: nombre,
      edad: parseInt(edad),
      rol: rol,
    })

    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      alert('¡Perfil creado con éxito!')
      window.location.href = '/' // Lo mandaremos al feed principal
    }
    setLoading(false)
  }

  if (!user) return <div className="p-10 text-center">Cargando...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-indigo-600">Crea tu Perfil</h1>
        <p className="text-center text-gray-500 mb-8">Cuéntanos un poco sobre ti</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo te llamas?</label>
        <input 
          type="text" placeholder="Tu nombre" 
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 ring-indigo-400 text-black"
          onChange={(e) => setNombre(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué edad tienes?</label>
        <input 
          type="number" placeholder="Ej: 24" 
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 ring-indigo-400 text-black"
          onChange={(e) => setEdad(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué buscas en RoomieApp?</label>
        <select 
          className="w-full p-3 mb-8 border rounded-lg outline-none focus:ring-2 ring-indigo-400 text-black bg-white"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="Busco habitación">Busco habitación</option>
          <option value="Ofrezco habitación">Tengo una habitación libre</option>
        </select>

        <button 
          onClick={guardarPerfil} disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          {loading ? 'Guardando...' : 'Guardar y Continuar'}
        </button>
      </div>
    </div>
  )
}