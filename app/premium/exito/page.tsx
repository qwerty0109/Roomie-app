export default function ExitoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md">
        <span className="text-6xl block mb-4">🎉</span>
        <h1 className="text-3xl font-black text-gray-900 mb-2">¡Bienvenido a Plus!</h1>
        <p className="text-gray-500 mb-8">Tu suscripción está activa. Ya apareces primero en las búsquedas.</p>
        <a href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
          Ir al Feed →
        </a>
      </div>
    </div>
  )
}