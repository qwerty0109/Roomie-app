'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('¡Ups! Por favor, rellena el email y la contraseña.')
      return
    }
    
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else window.location.href = '/onboarding'
    setLoading(false)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      alert('¡Ups! Por favor, rellena el email y la contraseña.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else window.location.href = '/' // Nos manda a la home
    setLoading(false)
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">RoomieApp</h1>
        <input 
          type="email" placeholder="Tu Email" 
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 ring-indigo-400 text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Tu Contraseña" 
          className="w-full p-3 mb-6 border rounded-lg outline-none focus:ring-2 ring-indigo-400 text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          onClick={handleLogin} disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold mb-3 hover:bg-indigo-700 transition"
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
        <button 
          onClick={handleSignUp}
          className="w-full text-indigo-600 font-semibold p-3"
        >
          No tengo cuenta, registrarme
        </button>
      </div>
    </div>
  )
}