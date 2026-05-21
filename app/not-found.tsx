import Link from 'next/link'
import StarburstLogo from '@/components/ui/StarburstLogo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6 text-center">
      <StarburstLogo size={64} color="#C9A870" className="mb-8 opacity-60" />
      <h1 className="font-display font-extrabold text-8xl tracking-widest text-cream/20 mb-4">404</h1>
      <h2 className="font-display font-bold text-2xl tracking-wider uppercase text-cream mb-4">
        Página no encontrada
      </h2>
      <p className="font-body text-cream/40 text-sm max-w-xs leading-relaxed mb-10">
        Esta página no existe en el archivo. Puede haber sido movida o eliminada.
      </p>
      <Link
        href="/"
        className="bg-cream text-dark font-display font-bold text-sm tracking-widest uppercase px-8 py-3.5 hover:bg-gold transition-colors duration-300"
      >
        Volver al Inicio
      </Link>
    </div>
  )
}
