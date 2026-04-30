'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PremiumPage() {
  const [loading, setLoading] = useState(false)
  const [esPremium, setEsPremium] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const checkPremium = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'
      setUserId(session.user.id)

      const { data } = await supabase
        .from('perfiles')
        .select('es_premium')
        .eq('id', session.user.id)
        .single()

      if (data?.es_premium) setEsPremium(true)
    }
    checkPremium()
  }, [])

  const activarPremium = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Error: ' + data.error)
    } catch (e) {
      alert('Error al conectar con Stripe')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <a href="/" className="text-indigo-600 font-bold hover:underline">← Volver</a>
          <h1 className="text-4xl font-black text-gray-900 mt-4">Roomie <span className="text-amber-500">Plus</span></h1>
          <p className="text-gray-500 mt-2">Encuentra compañero antes y mejor</p>
        </div>

        {esPremium ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-8 text-center">
            <span className="text-5xl block mb-4">⭐</span>
            <h2 className="text-2xl font-black text-amber-700">¡Ya eres Plus!</h2>
            <p className="text-amber-600 mt-2">Tienes acceso a todas las ventajas Premium.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Plan Gratis */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Básico</h3>
                <span className="text-2xl font-black text-gray-400">Gratis</span>
              </div>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✅ Perfil visible</li>
                <li>✅ Chat ilimitado</li>
                <li>✅ Valoraciones</li>
                <li>❌ Apareces arriba en búsquedas</li>
                <li>❌ Ver quién te dio like</li>
              </ul>
            </div>

            {/* Plan Plus */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold">Plus ⭐</h3>
                  <p className="text-indigo-200 text-xs">El más popular</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black">4,99€</span>
                  <span className="text-indigo-200 text-sm">/mes</span>
                </div>
              </div>
              <ul className="text-sm text-indigo-100 space-y-2 mb-6">
                <li>✅ Todo lo del plan Básico</li>
                <li>✅ Apareces primero en búsquedas</li>
                <li>✅ Badge ⭐ verificado en tu perfil</li>
                <li>✅ Ver quién ha visto tu perfil</li>
                <li>✅ Sin límite de mensajes al día</li>
              </ul>
              <button
                onClick={activarPremium}
                disabled={loading}
                className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black hover:bg-indigo-50 transition shadow-lg"
              >
                {loading ? 'Redirigiendo...' : 'Activar Plus — 7 días gratis'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}