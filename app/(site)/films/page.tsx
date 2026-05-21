import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'
import type { Film } from '@/types'

export const revalidate = 60

async function getFilms(): Promise<Film[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('films')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Film[]) ?? []
}

export default async function FilmsPage() {
  const films = await getFilms()

  const upcoming = films.filter((f) => f.status === 'upcoming')
  const inProduction = films.filter((f) => f.status === 'in_production')
  const released = films.filter((f) => f.status === 'released')

  return (
    <>
      {/* Header */}
      <div className="bg-dark pt-32 pb-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-start gap-6">
            <StarburstLogo size={52} color="#C9A870" className="mt-1 hidden md:block" />
            <div>
              <p className="font-body text-xs text-gold tracking-widest uppercase mb-3">División I</p>
              <h1 className="font-display font-extrabold text-cream tracking-wider uppercase"
                style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.95 }}>
                Corto&shy;metrajes
              </h1>
              <p className="font-body text-cream/50 text-base mt-4 max-w-lg leading-relaxed">
                Cine de autor puertorriqueño. Cada proyecto une a un artista visual con una historia de 7 a 10 minutos que trasciende.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-cream min-h-screen">
        <div className="max-w-screen-xl mx-auto px-6 py-16">

          {films.length === 0 && (
            <div className="text-center py-32">
              <StarburstLogo size={60} color="#C9A870" className="mx-auto mb-6 opacity-30" />
              <p className="font-display font-bold text-2xl tracking-wider uppercase text-charcoal/40">
                Próximamente
              </p>
              <p className="font-body text-charcoal/30 mt-2">Los proyectos estarán disponibles pronto.</p>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <FilmSection title="Próximamente" films={upcoming} />
          )}

          {/* In Production */}
          {inProduction.length > 0 && (
            <FilmSection title="En Producción" films={inProduction} />
          )}

          {/* Released */}
          {released.length > 0 && (
            <FilmSection title="Archivo" films={released} />
          )}

        </div>
      </div>
    </>
  )
}

function FilmSection({ title, films }: { title: string; films: Film[] }) {
  return (
    <div className="mb-20">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-wider uppercase">
          {title}
        </h2>
        <div className="flex-1 h-px bg-charcoal/10" />
        <span className="font-body text-xs text-charcoal/30 tracking-widest">
          {films.length} {films.length === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
    </div>
  )
}

function FilmCard({ film }: { film: Film }) {
  const statusConfig = {
    upcoming: { label: 'Próximamente', cls: 'bg-gold text-dark' },
    released: { label: 'Disponible', cls: 'bg-charcoal text-cream' },
    in_production: { label: 'En Producción', cls: 'bg-charcoal/60 text-cream' },
  }
  const { label, cls } = statusConfig[film.status]

  return (
    <Link href={`/films/${film.slug}`} className="group block">
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-charcoal overflow-hidden mb-3">
        {film.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={film.poster_url}
            alt={film.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <StarburstLogo size={40} color="#C9A870" className="opacity-40 group-hover:opacity-60 transition-opacity" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`${cls} font-display font-bold text-xs tracking-widest uppercase px-2 py-0.5`}>
            {label}
          </span>
        </div>
        {film.duration_minutes && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-dark/80 text-cream/70 font-body text-xs px-2 py-0.5">
              {film.duration_minutes} min
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      {film.artist_name && (
        <p className="font-body text-[11px] text-gold/80 tracking-widest uppercase mb-0.5">
          {film.artist_name}
        </p>
      )}
      <h3 className="font-display font-bold text-lg tracking-wide uppercase leading-tight group-hover:text-gold transition-colors duration-200">
        {film.title}
      </h3>
      {film.short_description && (
        <p className="font-body text-xs text-charcoal/50 mt-1 line-clamp-2 leading-relaxed">
          {film.short_description}
        </p>
      )}
    </Link>
  )
}
