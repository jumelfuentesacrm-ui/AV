import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'
import type { Film, Product } from '@/types'

async function getFeaturedFilms(): Promise<Film[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('films')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3)
  return (data as Film[]) ?? []
}

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('active', true)
    .limit(3)
  return (data as Product[]) ?? []
}

export default async function HomePage() {
  const [featuredFilms, featuredProducts] = await Promise.all([
    getFeaturedFilms(),
    getFeaturedProducts(),
  ])

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen bg-dark flex flex-col items-center justify-center overflow-hidden">
        {/* Background texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(250,245,240,0.5) 2px, rgba(250,245,240,0.5) 4px)',
          }}
        />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Starburst */}
          <div className="mb-8 animate-[spin_60s_linear_infinite]">
            <StarburstLogo size={120} color="#FAF5F0" />
          </div>

          {/* Wordmark */}
          <h1 className="font-display font-extrabold text-cream leading-none tracking-widest uppercase mb-4"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}>
            Archivo Vivo
          </h1>

          {/* Tagline */}
          <p className="font-display font-bold text-gold tracking-[0.35em] uppercase text-lg md:text-2xl mb-10">
            Ideas · Visión · Legado
          </p>

          {/* CTA */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/films"
              className="bg-cream text-dark font-display font-bold text-sm tracking-widest uppercase px-8 py-3.5 hover:bg-gold hover:text-dark transition-colors duration-300"
            >
              Ver Cortometrajes
            </Link>
            <Link
              href="/merch"
              className="border border-cream/30 text-cream font-display font-bold text-sm tracking-widest uppercase px-8 py-3.5 hover:border-gold hover:text-gold transition-colors duration-300"
            >
              Explorar Ropa
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/30">
          <span className="font-body text-xs tracking-widest uppercase">Desplazar</span>
          <div className="w-px h-12 bg-gradient-to-b from-cream/30 to-transparent" />
        </div>
      </section>

      {/* DIVISION CARDS */}
      <section className="bg-cream">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">

            {/* Cortometrajes — most important, larger */}
            <div className="md:col-span-2 group relative bg-dark overflow-hidden min-h-[480px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal/80 to-dark/95" />
              {/* Gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
              <div className="relative z-10 p-10">
                <span className="font-body text-xs text-gold tracking-widest uppercase mb-4 block">
                  División I
                </span>
                <h2 className="font-display font-extrabold text-cream tracking-wider uppercase mb-3"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.95 }}>
                  Corto&shy;metrajes
                </h2>
                <p className="font-body text-cream/60 text-sm leading-relaxed max-w-sm mb-6">
                  Cine de autor. Artistas puertorriqueños. Historias de 7 a 10 minutos que definen una generación.
                </p>
                <Link
                  href="/films"
                  className="inline-flex items-center gap-3 font-display font-bold text-sm tracking-widest uppercase text-cream group-hover:text-gold transition-colors duration-300"
                >
                  Ver Proyectos
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Merch + Máquinas stacked */}
            <div className="flex flex-col gap-1">
              {/* Merch */}
              <div className="group relative bg-charcoal overflow-hidden min-h-[235px] flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/60" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/50" />
                <div className="relative z-10 p-7">
                  <span className="font-body text-xs text-gold/70 tracking-widest uppercase mb-2 block">
                    División II
                  </span>
                  <h2 className="font-display font-extrabold text-cream text-3xl tracking-wider uppercase mb-2">
                    Ropa
                  </h2>
                  <p className="font-body text-cream/50 text-xs leading-relaxed mb-4">
                    Elegancia sin esfuerzo. Piezas hechas para quienes viven el arte.
                  </p>
                  <Link
                    href="/merch"
                    className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-widest uppercase text-cream/70 group-hover:text-gold transition-colors duration-300"
                  >
                    Ver Colección
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Máquinas */}
              <div className="group relative bg-charcoal/80 overflow-hidden min-h-[235px] flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/50" />
                <div className="relative z-10 p-7">
                  <span className="font-body text-xs text-cream/30 tracking-widest uppercase mb-2 block">
                    División III
                  </span>
                  <h2 className="font-display font-extrabold text-cream text-3xl tracking-wider uppercase mb-2">
                    Máquinas
                  </h2>
                  <p className="font-body text-cream/40 text-xs leading-relaxed mb-4">
                    Encuéntranos en los centros comerciales de Puerto Rico.
                  </p>
                  <Link
                    href="/machines"
                    className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-widest uppercase text-cream/40 group-hover:text-gold/70 transition-colors duration-300"
                  >
                    Ver Ubicaciones
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED FILMS */}
      {featuredFilms.length > 0 && (
        <section className="bg-cream py-24 px-6">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-body text-xs text-gold tracking-widest uppercase mb-2">Cortometrajes</p>
                <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-wider uppercase">
                  En Vitrina
                </h2>
              </div>
              <Link href="/films" className="hidden md:flex items-center gap-2 font-display font-bold text-sm tracking-widest uppercase hover:text-gold transition-colors duration-200">
                Ver Todos
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredFilms.map((film) => (
                <Link key={film.id} href={`/films/${film.slug}`} className="group block">
                  <div className="relative aspect-[3/4] bg-charcoal overflow-hidden mb-4">
                    {film.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={film.poster_url}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <StarburstLogo size={64} color="#C9A870" className="opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <StatusBadge status={film.status} />
                    </div>
                  </div>
                  <p className="font-body text-xs text-gold/80 tracking-widest uppercase mb-1">{film.artist_name}</p>
                  <h3 className="font-display font-bold text-xl tracking-wide uppercase group-hover:text-gold transition-colors duration-200">
                    {film.title}
                  </h3>
                  {film.short_description && (
                    <p className="font-body text-sm text-charcoal/60 mt-1 line-clamp-2">{film.short_description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="bg-dark py-24 px-6">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-body text-xs text-gold tracking-widest uppercase mb-2">Ropa</p>
                <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-wider uppercase text-cream">
                  La Colección
                </h2>
              </div>
              <Link href="/merch" className="hidden md:flex items-center gap-2 font-display font-bold text-sm tracking-widest uppercase text-cream/60 hover:text-gold transition-colors duration-200">
                Ver Todo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/merch/${product.slug}`} className="group block">
                  <div className="relative aspect-[4/5] bg-charcoal overflow-hidden mb-4">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <StarburstLogo size={48} color="#C9A870" className="opacity-20" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-xl tracking-wide uppercase text-cream group-hover:text-gold transition-colors duration-200">
                    {product.name}
                  </h3>
                  <p className="font-body text-gold mt-1">${product.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MANIFESTO */}
      <section className="bg-cream py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <StarburstLogo size={48} color="#C9A870" className="mx-auto mb-10" />
          <blockquote className="font-display font-extrabold text-3xl md:text-5xl tracking-wide uppercase leading-tight mb-8">
            &ldquo;No somos un proyecto. Somos un archivo en construcción.&rdquo;
          </blockquote>
          <p className="font-body text-charcoal/50 text-sm tracking-widest uppercase">
            — Archivo Vivo, Puerto Rico
          </p>
        </div>
      </section>
    </>
  )
}

function StatusBadge({ status }: { status: Film['status'] }) {
  const map = {
    upcoming: { label: 'Próximamente', bg: 'bg-gold text-dark' },
    released: { label: 'Disponible', bg: 'bg-cream text-dark' },
    in_production: { label: 'En Producción', bg: 'bg-charcoal/80 text-cream' },
  }
  const { label, bg } = map[status]
  return (
    <span className={`${bg} font-display font-bold text-xs tracking-widest uppercase px-2.5 py-1`}>
      {label}
    </span>
  )
}
