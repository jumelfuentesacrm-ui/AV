import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'
import { HeroContent } from '@/components/ui/HeroContent'
import { AnimateIn, AnimateStagger, StaggerItem } from '@/components/ui/AnimateIn'
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
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(250,245,240,0.5) 2px, rgba(250,245,240,0.5) 4px)',
          }}
        />
        {/* Ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
        </div>

        <HeroContent />
      </section>

      {/* DIVISION CARDS */}
      <section className="bg-cream">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <AnimateStagger className="grid grid-cols-1 md:grid-cols-3 gap-1" staggerMs={120}>

            {/* Cortometrajes */}
            <StaggerItem className="md:col-span-2">
              <Link href="/films" className="group relative bg-dark overflow-hidden min-h-[480px] flex flex-col justify-end block">
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal/80 to-dark/95 group-hover:from-charcoal/70 transition-all duration-500" />
                <div className="absolute top-0 left-0 h-0.5 bg-gold w-0 group-hover:w-full transition-all duration-700" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/20" />

                {/* Background starburst */}
                <div className="absolute top-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                  <StarburstLogo size={200} color="#FAF5F0" />
                </div>

                <div className="relative z-10 p-10 transform group-hover:-translate-y-1 transition-transform duration-500">
                  <span className="font-body text-xs text-gold tracking-widest uppercase mb-4 block">
                    División I
                  </span>
                  <h2
                    className="font-display font-extrabold text-cream tracking-wider uppercase mb-3"
                    style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.95 }}
                  >
                    Corto&shy;metrajes
                  </h2>
                  <p className="font-body text-cream/60 text-sm leading-relaxed max-w-sm mb-6">
                    Cine de autor. Artistas puertorriqueños. Historias de 7 a 10 minutos que definen una generación.
                  </p>
                  <span className="inline-flex items-center gap-3 font-display font-bold text-sm tracking-widest uppercase text-cream group-hover:text-gold transition-colors duration-300">
                    Ver Proyectos
                    <svg className="transform group-hover:translate-x-1.5 transition-transform duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            </StaggerItem>

            {/* Merch + Máquinas */}
            <StaggerItem className="flex flex-col gap-1">
              <Link href="/merch" className="group relative bg-charcoal overflow-hidden min-h-[235px] flex flex-col justify-end block flex-1">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/60 group-hover:to-dark/40 transition-all duration-500" />
                <div className="absolute top-0 left-0 h-0.5 bg-gold/50 w-0 group-hover:w-full transition-all duration-500" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/20" />
                <div className="relative z-10 p-7 transform group-hover:-translate-y-1 transition-transform duration-500">
                  <span className="font-body text-xs text-gold/70 tracking-widest uppercase mb-2 block">
                    División II
                  </span>
                  <h2 className="font-display font-extrabold text-cream text-3xl tracking-wider uppercase mb-2">
                    Ropa
                  </h2>
                  <p className="font-body text-cream/50 text-xs leading-relaxed mb-4">
                    Elegancia sin esfuerzo. Piezas hechas para quienes viven el arte.
                  </p>
                  <span className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-widest uppercase text-cream/70 group-hover:text-gold transition-colors duration-300">
                    Ver Colección
                    <svg className="transform group-hover:translate-x-1 transition-transform duration-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>

              <Link href="/machines" className="group relative bg-charcoal/80 overflow-hidden min-h-[235px] flex flex-col justify-end block flex-1">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/50 group-hover:to-dark/30 transition-all duration-500" />
                <div className="relative z-10 p-7 transform group-hover:-translate-y-1 transition-transform duration-500">
                  <span className="font-body text-xs text-cream/30 tracking-widest uppercase mb-2 block">
                    División III
                  </span>
                  <h2 className="font-display font-extrabold text-cream text-3xl tracking-wider uppercase mb-2">
                    Máquinas
                  </h2>
                  <p className="font-body text-cream/40 text-xs leading-relaxed mb-4">
                    Encuéntranos en los centros comerciales de Puerto Rico.
                  </p>
                  <span className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-widest uppercase text-cream/40 group-hover:text-gold/70 transition-colors duration-300">
                    Ver Ubicaciones
                    <svg className="transform group-hover:translate-x-1 transition-transform duration-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            </StaggerItem>

          </AnimateStagger>
        </div>
      </section>

      {/* FEATURED FILMS */}
      {featuredFilms.length > 0 && (
        <section className="bg-cream py-24 px-6">
          <div className="max-w-screen-xl mx-auto">
            <AnimateIn className="flex items-end justify-between mb-12">
              <div>
                <p className="font-body text-xs text-gold tracking-widest uppercase mb-2">Cortometrajes</p>
                <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-wider uppercase">
                  En Vitrina
                </h2>
              </div>
              <Link
                href="/films"
                className="hidden md:flex items-center gap-2 font-display font-bold text-sm tracking-widest uppercase hover:text-gold transition-colors duration-200"
              >
                Ver Todos
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </AnimateIn>

            <AnimateStagger className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerMs={110}>
              {featuredFilms.map((film) => (
                <StaggerItem key={film.id}>
                  <Link href={`/films/${film.slug}`} className="group block">
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
                          <StarburstLogo size={64} color="#C9A870" className="opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                      <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-500" />
                      <div className="absolute bottom-4 left-4">
                        <StatusBadge status={film.status} />
                      </div>
                    </div>
                    <p className="font-body text-xs text-gold/80 tracking-widest uppercase mb-1">{film.artist_name}</p>
                    <h3 className="font-display font-bold text-xl tracking-wide uppercase group-hover:text-gold transition-colors duration-300">
                      {film.title}
                    </h3>
                    {film.short_description && (
                      <p className="font-body text-sm text-charcoal/60 mt-1 line-clamp-2">{film.short_description}</p>
                    )}
                  </Link>
                </StaggerItem>
              ))}
            </AnimateStagger>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="bg-dark py-24 px-6">
          <div className="max-w-screen-xl mx-auto">
            <AnimateIn className="flex items-end justify-between mb-12">
              <div>
                <p className="font-body text-xs text-gold tracking-widest uppercase mb-2">Ropa</p>
                <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-wider uppercase text-cream">
                  La Colección
                </h2>
              </div>
              <Link
                href="/merch"
                className="hidden md:flex items-center gap-2 font-display font-bold text-sm tracking-widest uppercase text-cream/60 hover:text-gold transition-colors duration-200"
              >
                Ver Todo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </AnimateIn>

            <AnimateStagger className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerMs={110}>
              {featuredProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <Link href={`/merch/${product.slug}`} className="group block">
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
                          <StarburstLogo size={48} color="#C9A870" className="opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-500" />
                    </div>
                    <h3 className="font-display font-bold text-xl tracking-wide uppercase text-cream group-hover:text-gold transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="font-body text-gold mt-1">${product.price.toFixed(2)}</p>
                  </Link>
                </StaggerItem>
              ))}
            </AnimateStagger>
          </div>
        </section>
      )}

      {/* MANIFESTO */}
      <section className="bg-cream py-32 px-6 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateIn blur>
            <StarburstLogo size={48} color="#C9A870" className="mx-auto mb-10 av-pulse-slow" />
          </AnimateIn>
          <AnimateIn delay={150} blur>
            <blockquote className="font-display font-extrabold text-3xl md:text-5xl tracking-wide uppercase leading-tight mb-8">
              &ldquo;No somos un proyecto. Somos un archivo en construcción.&rdquo;
            </blockquote>
          </AnimateIn>
          <AnimateIn delay={300}>
            <p className="font-body text-charcoal/50 text-sm tracking-widest uppercase">
              — Archivo Vivo, Puerto Rico
            </p>
          </AnimateIn>
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
