import Link from 'next/link'
import StarburstLogo from '@/components/ui/StarburstLogo'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-dark text-cream/70">
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <StarburstLogo size={32} color="#FAF5F0" />
              <span className="font-display font-extrabold text-xl tracking-widest uppercase text-cream">
                Archivo Vivo
              </span>
            </div>
            <p className="font-display text-2xl font-bold tracking-widest text-gold uppercase mb-4">
              Ideas. Visión. Legado.
            </p>
            <p className="font-body text-sm leading-relaxed text-cream/50 max-w-sm">
              Una marca puertorriqueña comprometida con el arte cinematográfico, la moda consciente y la cultura que perdura.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-bold text-sm tracking-widest uppercase text-cream/40 mb-4">
              Explorar
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/films" className="font-body text-sm hover:text-gold transition-colors duration-200">
                  Cortometrajes
                </Link>
              </li>
              <li>
                <Link href="/merch" className="font-body text-sm hover:text-gold transition-colors duration-200">
                  Ropa
                </Link>
              </li>
              <li>
                <Link href="/machines" className="font-body text-sm hover:text-gold transition-colors duration-200">
                  Máquinas
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display font-bold text-sm tracking-widest uppercase text-cream/40 mb-4">
              Cuenta
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/account" className="font-body text-sm hover:text-gold transition-colors duration-200">
                  Mi Perfil
                </Link>
              </li>
              <li>
                <Link href="/account" className="font-body text-sm hover:text-gold transition-colors duration-200">
                  Mis Puntos
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="font-body text-sm hover:text-gold transition-colors duration-200">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="font-body text-sm hover:text-gold transition-colors duration-200">
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-cream/30 tracking-wider">
            © {year} Archivo Vivo. Todos los derechos reservados.
          </p>
          <p className="font-body text-xs text-cream/20 tracking-wider uppercase">
            Hecho con orgullo en Puerto Rico
          </p>
        </div>
      </div>
    </footer>
  )
}
