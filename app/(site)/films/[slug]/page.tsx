import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'
import type { Film } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 60

interface PageProps {
  params: { slug: string }
}

async function getFilm(slug: string): Promise<Film | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('films')
    .select('*')
    .eq('slug', slug)
    .single()
  return (data as Film) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const film = await getFilm(params.slug)
  if (!film) return { title: 'Película no encontrada' }
  return {
    title: `${film.title} — Archivo Vivo`,
    description: film.short_description ?? film.description ?? undefined,
  }
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&color=white`
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?color=C9A870&title=0&byline=0&portrait=0`
  }
  return null
}

export default async function FilmDetailPage({ params }: PageProps) {
  const film = await getFilm(params.slug)
  if (!film) notFound()

  const embedUrl = film.video_url ? getEmbedUrl(film.video_url) : null

  const statusConfig = {
    upcoming: { label: 'Próximamente', cls: 'bg-gold text-dark' },
    released: { label: 'Disponible', cls: 'bg-cream text-dark' },
    in_production: { label: 'En Producción', cls: 'bg-charcoal/60 text-cream' },
  }
  const { label, cls } = statusConfig[film.status]

  return (
    <>
      {/* Cinematic Hero */}
      <div className="relative bg-dark min-h-[60vh] flex items-end">
        {film.poster_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={film.poster_url}
              alt={film.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 pb-16 pt-36 w-full">
          <Link href="/films" className="inline-flex items-center gap-2 font-body text-xs text-cream/40 hover:text-gold tracking-widest uppercase mb-8 transition-colors duration-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Cortometrajes
          </Link>

          <div className="flex flex-wrap items-start gap-4 mb-4">
            <span className={`${cls} font-display font-bold text-xs tracking-widest uppercase px-3 py-1`}>
              {label}
            </span>
            {film.duration_minutes && (
              <span className="font-body text-xs text-cream/40 tracking-wider">
                {film.duration_minutes} minutos
              </span>
            )}
            {film.release_date && (
              <span className="font-body text-xs text-cream/40 tracking-wider">
                {new Date(film.release_date).getFullYear()}
              </span>
            )}
          </div>

          {film.artist_name && (
            <p className="font-body text-sm text-gold tracking-widest uppercase mb-3">
              {film.artist_name}
            </p>
          )}

          <h1 className="font-display font-extrabold text-cream tracking-wider uppercase"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 0.95 }}>
            {film.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-dark pb-24">
        <div className="max-w-screen-xl mx-auto px-6">

          {/* Video Embed */}
          {embedUrl && (
            <div className="mb-16 -mt-2">
              <div className="relative aspect-video bg-charcoal w-full max-w-4xl mx-auto">
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={film.title}
                />
              </div>
            </div>
          )}

          {/* Description + Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="md:col-span-2">
              {film.description && (
                <>
                  <h2 className="font-display font-bold text-xl tracking-widest uppercase text-gold mb-4">
                    Sobre el Proyecto
                  </h2>
                  <div className="font-body text-cream/70 leading-relaxed text-base space-y-4 whitespace-pre-wrap">
                    {film.description}
                  </div>
                </>
              )}
            </div>

            <div>
              {/* Artist Card */}
              {film.artist_name && (
                <div className="border border-cream/10 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <StarburstLogo size={24} color="#C9A870" />
                    <span className="font-body text-xs text-cream/40 tracking-widest uppercase">Artista</span>
                  </div>
                  <p className="font-display font-bold text-xl tracking-wider uppercase text-cream">
                    {film.artist_name}
                  </p>
                </div>
              )}

              {/* Details */}
              <div className="border border-cream/10 p-6">
                <h3 className="font-body text-xs text-cream/40 tracking-widest uppercase mb-4">Detalles</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="font-body text-xs text-cream/30 tracking-wider uppercase">Estado</dt>
                    <dd className="font-display font-bold text-sm tracking-wider uppercase text-cream">{label}</dd>
                  </div>
                  {film.duration_minutes && (
                    <div>
                      <dt className="font-body text-xs text-cream/30 tracking-wider uppercase">Duración</dt>
                      <dd className="font-display font-bold text-sm tracking-wider uppercase text-cream">
                        {film.duration_minutes} minutos
                      </dd>
                    </div>
                  )}
                  {film.release_date && (
                    <div>
                      <dt className="font-body text-xs text-cream/30 tracking-wider uppercase">Fecha</dt>
                      <dd className="font-display font-bold text-sm tracking-wider uppercase text-cream">
                        {new Date(film.release_date).toLocaleDateString('es-PR', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="bg-dark border-t border-cream/5 py-8 px-6">
        <div className="max-w-screen-xl mx-auto">
          <Link href="/films" className="inline-flex items-center gap-2 font-display font-bold text-sm tracking-widest uppercase text-cream/40 hover:text-gold transition-colors duration-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 19" />
            </svg>
            Todos los Cortometrajes
          </Link>
        </div>
      </div>
    </>
  )
}
